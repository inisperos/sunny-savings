import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddGoalsPage({ plans, setPlans }) {
  const navigate = useNavigate();

  const [selectedGoals, setSelectedGoals] = useState([]);
  const [customGoals, setCustomGoals] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [newGoalName, setNewGoalName] = useState("");

  const defaultGoals = [
    "Travel",
    "Emergency",
    "Utilities",
    "Retirement",
    "Groceries",
    "Entertainment",
  ];

  // Toggle a goal selection
  const toggleGoal = (goal) => {
    setSelectedGoals((prev) =>
      prev.includes(goal)
        ? prev.filter((g) => g !== goal)
        : [...prev, goal]
    );
  };

  // Add custom goal
  const handleAddCustomGoal = () => {
    if (newGoalName.trim() === "") {
      alert("Goal name cannot be empty!");
      return;
    }
    setCustomGoals([...customGoals, newGoalName]);
    setShowPopup(false);
    setNewGoalName("");
  };

  // ✅ Save all goals and move to Fees page
  const handleNext = () => {
    if (plans.length > 0) {
      const updatedPlans = [...plans];

      // 🧠 Combine and deduplicate all goals
      const allGoals = Array.from(
        new Set([...selectedGoals, ...customGoals].filter(Boolean))
      );

      updatedPlans[updatedPlans.length - 1] = {
        ...updatedPlans[updatedPlans.length - 1],
        goals: allGoals,
      };

      setPlans(updatedPlans);
    }

    navigate("/fees");
  };

  const circleStyle = (goal, isCustom = false) => ({
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    backgroundColor: selectedGoals.includes(goal)
      ? "#4caf50"
      : "#ddd",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: isCustom ? "1rem" : "1.1rem",
    fontWeight: "500",
    transition: "0.2s",
  });

  return (
    <div style={{ textAlign: "center", marginTop: "3rem" }}>
      <h1>Add your savings goals.</h1>
      <p>What do you want to save for during this period?</p>

      {/* Circles grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "1.5rem",
          justifyItems: "center",
          marginTop: "2rem",
          maxWidth: "700px",
          marginInline: "auto",
        }}
      >
        {defaultGoals.map((goal) => (
          <div
            key={goal}
            onClick={() => toggleGoal(goal)}
            style={circleStyle(goal)}
          >
            {goal}
          </div>
        ))}
        {customGoals.map((goal) => (
          <div
            key={goal}
            onClick={() => toggleGoal(goal)}
            style={circleStyle(goal, true)}
          >
            {goal}
          </div>
        ))}
      </div>

      {/* Add custom category */}
      <button
        onClick={() => setShowPopup(true)}
        style={{
          marginTop: "2rem",
          padding: "0.75rem 1.25rem",
          border: "2px dashed #000",
          borderRadius: "10px",
          background: "none",
          cursor: "pointer",
        }}
      >
        Add Custom Category +
      </button>

      {/* Popup modal */}
      {showPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "2rem",
              borderRadius: "10px",
              textAlign: "center",
              width: "300px",
            }}
          >
            <h3>Add Custom Goal</h3>
            <input
              type="text"
              placeholder="Enter category name"
              value={newGoalName}
              onChange={(e) => setNewGoalName(e.target.value)}
              style={{
                padding: "0.5rem",
                width: "90%",
                marginTop: "1rem",
                border: "1px solid #ccc",
                borderRadius: "8px",
              }}
            />
            <div style={{ marginTop: "1rem" }}>
              <button
                onClick={handleAddCustomGoal}
                style={{
                  padding: "0.5rem 1rem",
                  marginRight: "1rem",
                  backgroundColor: "#4caf50",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                }}
              >
                Add
              </button>
              <button
                onClick={() => setShowPopup(false)}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Next button */}
      <button
        onClick={handleNext}
        style={{
          marginTop: "2rem",
          padding: "0.6rem 1.2rem",
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Next →
      </button>
    </div>
  );
}
