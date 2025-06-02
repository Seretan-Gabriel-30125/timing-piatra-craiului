import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";

export default function LoginPage() {
  const [code, setCode] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (code.trim() === "") return;

    try {
      const res = await fetch("https://dev.extreme-parts.com/piatra-craiului/verifica-cp.php", {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cod_conectare: code }),
      });

      if (!res.ok) {
        alert("Cod invalid. Încearcă din nou.");
        return;
      }

      const data = await res.json();
      localStorage.setItem("checkpointCode", data.nr_cp);
      navigate("/cp");
    } catch (err) {
      console.error(err);
      alert("Eroare la conectare cu serverul.");
    }
  };

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4 bg-white">
        <h1 className="text-xl font-bold text-center">Introdu codul de conectare</h1>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="border p-2 rounded text-center text-lg"
          placeholder="Cod CP"
        />
        <button
          onClick={handleLogin}
          className="bg-blue-600 text-white px-6 py-2 rounded text-lg"
        >
          Conectare
        </button>
      </div>
    </Layout>
  );
}