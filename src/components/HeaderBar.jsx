import React from "react";

export default function HeaderBar({ text, isSuccess }) {
  return (
    <div
      className={`w-full text-white text-center py-2 fixed top-0 left-0 z-10 ${
        isSuccess ? "bg-green-600" : "bg-red-600"
      }`}
    >
      {text}
    </div>
  );
}
