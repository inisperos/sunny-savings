// src/pages/CreatePlanPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreatePlanPage({ addPlan }) {
  const [nameInput, setNameInput] = useState("");
  const [salaryInput, setSalaryInput] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (nameInput.trim() !== "" && salaryInput.trim() !== "") {
      const newPlan = {
        name: nameInput,
        salary: salaryInput,
      };
      addPlan(newPlan);
      navigate("/");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "4rem" }}>
      <h1>Create Plan Page 📝</h1>
      <p>Enter a name and salary for your new plan:</p>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Enter plan name"
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          style={{
            padding: "0.5rem",
            borderRadius: "8px",
            border: "1px solid #ccc",
            width: "200px",
            margin: "0.5rem",
          }}
        />
        <input
          type="number"
          placeholder="Enter salary"
          value={salaryInput}
          onChange={(e) => setSalaryInput(e.target.value)}
          style={{
            padding: "0.5rem",
            borderRadius: "8px",
            border: "1px solid #ccc",
            width: "200px",
            margin: "0.5rem",
          }}
        />
        <br />
        <button
          type="submit"
          style={{
            marginTop: "1rem",
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#28a745",
            color: "white",
            cursor: "pointer",
          }}
        >
          Save Plan
        </button>
      </form>

      <button
        onClick={() => navigate("/")}
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          borderRadius: "8px",
          border: "none",
          backgroundColor: "#6c757d",
          color: "white",
          cursor: "pointer",
        }}
      >
        Go Back Home
      </button>
    </div>
  );
}
