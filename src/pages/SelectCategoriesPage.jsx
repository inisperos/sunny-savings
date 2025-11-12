import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SelectBudgetCategories({ plans, setPlans }) {
  const navigate = useNavigate();

  const [selectedTimeframeInWeeks, setSelectedTimeframeInWeeks] = useState(4);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [customCategories, setCustomCategories] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");

  const defaultCategories = [
    "Travel",
    "Emergency",
    "Utilities",
    "Retirement",
    "Groceries",
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
        budgetTimeframeInWeeks: selectedTimeframeInWeeks,
      };

      setPlans(updatedPlans);
    }

    navigate("/set-budget");
  };

  const circleStyle = (category, isCustom = false) => ({
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    backgroundColor: selectedCategories.includes(category)
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

      <p>How often would you like to plan or review your budget?</p>

      {/* Timeframe input */}
      <div style={{ marginTop: "1.5rem" }}>
        <label htmlFor="timeframe">
          Every
        </label>
        <input
          id="timeframe"
          type="number"
          min="1"
          value={selectedTimeframeInWeeks}
          onChange={(e) => setSelectedTimeframeInWeeks(Number(e.target.value))}
          style={{
            marginLeft: "1rem",
            padding: "0.5rem",
            width: "80px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            textAlign: "center",
          }}
        />
        <label htmlFor="timeframe">
          week(s)
        </label>
      </div>

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
