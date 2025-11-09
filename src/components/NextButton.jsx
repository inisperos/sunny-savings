import React from "react";

export default function NextButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        marginTop: "2rem",
        padding: "0.6rem 1.2rem",
        backgroundColor: "#007bff",
        color: "white",
        border: "none",
        borderRadius: "8px",
        cursor: "pointer",
      }}
    >
      Next &rarr;
    </button>
  );
}