import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

export default function SelectBudgetCategories({ plans, setPlans }) {
  const navigate = useNavigate();

  const [timeframeInWeeks, setTimeframeInWeeks] = useState(4);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showTip, setShowTip] = useState(false); 

  const defaultCategories = [
    "Emergency",
    "Travel",
    "Retirement",
    "Education",
    "Big purchase",
    "Entertainment",
  ];

  // Toggle a category selection
  const toggleCategory = (category) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        // Remove the category
        return prev.filter((c) => c !== category);
      } else {
        // Add the category
        return [...prev, category];
      }
    });
  };

  // Add custom category
  const handleAddCustomCategory = () => {
    if (newCategoryName.trim() === "") {
      alert("Category name cannot be empty!");
      return;
    }
    setCustomCategories([...customCategories, newCategoryName]);
    setShowPopup(false);
    setNewCategoryName("");
  };

  // Save all categories and move to Fees page
  const handleNext = () => {
    if (plans.length > 0) {
      const updatedPlans = [...plans];

      // Combine and deduplicate all categories
      const allCategories = Array.from(
        new Set([...selectedCategories, ...customCategories].filter(Boolean))
      );

      updatedPlans[updatedPlans.length - 1] = {
        ...updatedPlans[updatedPlans.length - 1],
        categories: allCategories,
        budgetTimeframeInWeeks: timeframeInWeeks,
      };

      setPlans(updatedPlans);
    }

    navigate("/set-budget");
  };

  const circleStyle = (category, isCustom = false) => ({
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    backgroundColor: selectedCategories.includes(category) ? "#4caf50" : "#ddd",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    fontSize: isCustom ? "1rem" : "1.1rem",
    fontWeight: "500",
    transition: "0.2s",
    padding: "0.5rem",
    textAlign: "center",
  });

  return (
    <div style={{ textAlign: "center", marginTop: "3rem" }}>
      <h1>Add your savings goals.</h1>

      <p>How often would you like to plan or review your budget?</p>

      {/* Timeframe input */}
      <div style={{ marginTop: "1.5rem" }}>
        <label htmlFor="timeframe">Every</label>
        <input
          id="timeframe"
          type="number"
          min="1"
          value={timeframeInWeeks}
          onChange={(e) => setTimeframeInWeeks(Number(e.target.value))}
          style={{
            marginLeft: "1rem",
            padding: "0.5rem",
            width: "80px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            textAlign: "center",
          }}
        />
        <label htmlFor="timeframe"> week(s)</label>
      </div>

      <div
        style={{
          marginTop: "1.5rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
        }}
      >
        <p style={{ margin: 0 }}>
          What do you want to save for during this period?
        </p>
        <button
          type="button"
          onClick={() => setShowTip((prev) => !prev)}
          aria-label="What is a saving goal?"
          style={{
            width: "22px",
            height: "22px",
            borderRadius: "50%",
            border: "1px solid #9ca3af",
            backgroundColor: "#f3f4f6",
            cursor: "pointer",
            fontSize: "0.9rem",
            fontWeight: 600,
            lineHeight: "20px",
            padding: 0,
          }}
        >
          ?
        </button>
      </div>

  {showTip && (
  <div
    style={{
      maxWidth: "600px",
      margin: "0.6rem auto 0",
      backgroundColor: "#f9fafb",
      borderRadius: "8px",
      border: "1px solid #e5e7eb",
      padding: "0.75rem 1rem",
      fontSize: "0.9rem",
      color: "#4b5563",
      textAlign: "left",
    }}
  >
    <strong>Saving goals in this app:</strong>
    <ul
      style={{
        margin: "0.4rem 0 0",
        paddingLeft: "1.2rem",
      }}
    >
      <li>Basic living costs (rent, groceries, utilities) are already counted.</li>
      <li>Saving goals are things you want to put money aside for after that.</li>
      <li>Examples: emergency fund, a trip, education, or a big purchase.</li>
    </ul>
  </div>
)}

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
        {defaultCategories.map((category) => (
          <div
            key={category}
            onClick={() => toggleCategory(category)}
            style={circleStyle(category)}
          >
            {category}
          </div>
        ))}
        {customCategories.map((category) => (
          <div
            key={category}
            onClick={() => toggleCategory(category)}
            style={circleStyle(category, true)}
          >
            {category}
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
            <h3>Add Custom Category</h3>
            <input
              type="text"
              placeholder="Enter category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
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
                onClick={handleAddCustomCategory}
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
          backgroundColor: "var(--color-accent-light)",
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

