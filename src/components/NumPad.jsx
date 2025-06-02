import React from "react";

export default function NumPad({ value, onInput }) {
  const append = (n) => {
    const newVal = value + n;
    onInput(newVal);
  };



  const clear = () => {
    onInput("");
  };

  return (
    <div className="grid grid-cols-3 gap-2 w-120 h-64 max-w-xs mx-auto text-white">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9, "gresit", 0, "C"].map((key) => (
        <button
          key={key}
          onClick={() =>
           key === "C" ? clear() : append(key)
          }
          className="bg-gray-200 text-xl py-4 rounded hover:bg-gray-300"
        >
          {key}
        </button>
      ))}
    </div>
  );
}
