// CheckpointPage.jsx - revenit la comportament implicit scroll (fără blocări)

import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import NumPad from "../components/NumPad";
import HeaderBar from "../components/HeaderBar";

const QUEUE_KEY = 'pendingQueue';

export default function CheckpointPage() {
  const [value, setValue] = useState("");
  const [lastNumbers, setLastNumbers] = useState([]);
  const [pendingQueue, setPendingQueue] = useState([]);
  const [allEntries, setAllEntries] = useState([]);
  const [showAllModal, setShowAllModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [isSuccess, setIsSuccess] = useState(true);

  const getQueue = () => {
    try {
      const stored = localStorage.getItem(QUEUE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  const setQueue = (queue) => {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    setPendingQueue(queue);
  };

  const enqueue = (payload) => {
    const timestamp = new Date().toISOString();
    const queue = getQueue();
    const entry = { ...payload, ora: timestamp };
    queue.push(entry);
    setQueue(queue);
    setLastNumbers((prev) => [...prev, entry.numar].slice(-5));
  };

  const updateLastNumbers = () => {
    const cp = localStorage.getItem("checkpointCode");
    fetch(`https://dev.extreme-parts.com/piatra-craiului/ultimele5cp.php?cp=${cp}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.numbers)) {
          setLastNumbers(data.numbers.slice(-5));
        }
      });
  };

  const flushQueue = async () => {
    const cp = localStorage.getItem("checkpointCode");
    let queue = getQueue();
    if (!queue.length || !navigator.onLine || !cp) return;

    const remaining = [];
    for (const payload of queue) {
      try {
        const res = await fetch("https://dev.extreme-parts.com/piatra-craiului/inregistreaza.php", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, cp }),
        });
        if (!res.ok) throw new Error("Eroare la trimiterea din coadă");
        await res.json();
      } catch (err) {
        remaining.push(payload);
      }
    }
    setQueue(remaining);
    updateLastNumbers();
  };

  useEffect(() => {
    updateLastNumbers();
    flushQueue();
    setPendingQueue(getQueue());
    window.addEventListener("online", flushQueue);
    return () => window.removeEventListener("online", flushQueue);
  }, []);

  const handleSubmit = () => {
    if (!value.trim()) return;

    const cp = localStorage.getItem("checkpointCode");
    const timestamp = new Date().toISOString();
    const payload = { numar: value, ora: timestamp };

    const gresitMatch = value.match(/^(\d+)gresit$|^gresit(\d+)$/);
    const numarGresit = gresitMatch ? (gresitMatch[1] || gresitMatch[2]) : null;
    if (numarGresit) {
      fetch("https://dev.extreme-parts.com/piatra-craiului/stergeUltima.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cp, numar: numarGresit }),
      })
        .then((res) => res.json())
        .then(() => {
          setConfirmText(`Ultima înregistrare pentru ${numarGresit} a fost ștearsă.`);
          setIsSuccess(true);
          updateLastNumbers();
        })
        .catch(() => {
          setConfirmText(`Eroare la ștergere pentru ${numarGresit}`);
          setIsSuccess(false);
        })
        .finally(() => {
          setValue("");
          setShowConfirm(true);
          setTimeout(() => setShowConfirm(false), 3000);
        });
      return;
    }

    if (navigator.onLine) {
      fetch("https://dev.extreme-parts.com/piatra-craiului/inregistreaza.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, cp }),
      })
        .then((res) => res.json())
        .then(({ nume, clasa, ora }) => {
          setConfirmText(`Rider ${value} (${nume}, ${clasa}) înregistrat în CP ${cp} la ora ${ora}`);
          setIsSuccess(true);
          updateLastNumbers();
        })
        .catch(() => {
          enqueue(payload);
          setConfirmText(`Salvat local. Se va trimite când revii online.`);
          setIsSuccess(true);
        })
        .finally(() => {
          setValue("");
          setShowConfirm(true);
          setTimeout(() => setShowConfirm(false), 3000);
        });
    } else {
      enqueue(payload);
      setConfirmText(`Offline: ${value} salvat local.`);
      setIsSuccess(true);
      setValue("");
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 3000);
    }
  };

  const fetchAllEntries = () => {
    const cp = localStorage.getItem("checkpointCode");
    fetch(`https://dev.extreme-parts.com/piatra-craiului/toatecp.php?cp=${cp}`)
      .then((res) => res.json())
      .then((data) => {
        setAllEntries(data.entries || []);
        setShowAllModal(true);
      });
  };

  return (
    <Layout>
      {showConfirm && <HeaderBar text={confirmText} isSuccess={isSuccess} />}

      {showAllModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded shadow p-4 max-w-sm w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-bold mb-2">Toate înregistrările</h3>
            <ul className="text-left text-sm space-y-1">
              {allEntries.map((entry, i) => (
                <li key={i} className="border-b pb-1">
                  #{entry.numar} — {entry.ora}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setShowAllModal(false)}
              className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
            >
              Închide
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col items-center justify-center h-[80vh] w-[100vw] px-4 gap-4 text-center">
        <button
          onClick={fetchAllEntries}
          className="bg-blue-500 text-white px-4 py-2 rounded mb-2"
        >
          Vezi toate înregistrările
        </button>

        <div className="flex space-x-2 mb-4">
          {lastNumbers.map((num, idx) => (
            <div
              key={idx}
              className={`text-xl font-medium p-2 rounded w-14 h-14 flex items-center justify-center
                ${pendingQueue.some(p => p.numar === num) ? "bg-yellow-300" : "bg-gray-200"}`}
            >
              {num}
            </div>
          ))}
        </div>

        <h2 className="text-3xl font-bold">
          Checkpoint: {localStorage.getItem("checkpointCode")}
        </h2>

        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          inputMode="none"
          className="border p-2 rounded text-center text-2xl w-full max-w-xs"
          placeholder="Număr"
        />

        <div className="w-full flex justify-center">
          <NumPad value={value} onInput={setValue} />
        </div>

        <button
          onClick={handleSubmit}
          className="bg-black text-white px-6 py-2 rounded text-lg mt-4 w-80 h-15"
        >
          Trimite
        </button>
      </div>
    </Layout>
  );
}
