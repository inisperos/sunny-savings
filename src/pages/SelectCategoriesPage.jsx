// src/pages/SelectCategoriesPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../App.css";
import StepIndicator from "../components/StepIndicator";

export default function SelectBudgetCategories({ plans, setPlans }) {
  const navigate = useNavigate();
  const locationState = useLocation();

  // Get plan ID from location state
  const planId = locationState.state?.planId;
  const currentPlan = planId
    ? plans.find((p) => p.id === planId)
    : plans.length > 0
    ? plans[plans.length - 1]
    : null;
  const actualPlanId = planId || currentPlan?.id;

  // Separate default and custom categories
  const defaultCategoriesList = [
    "Emergency",
    "Travel",
    "Retirement",
    "Education",
    "Big purchase",
    "Entertainment",
  ];

  // Initialize from plan if exists - get fresh data from currentPlan
  const existingCategories = currentPlan?.categories || [];
  const existingTimeframe = currentPlan?.budgetTimeframeInWeeks || 4;

  // All existing categories should be marked as selected (they're already in the plan)
  const initialSelected = existingCategories.filter((c) =>
    defaultCategoriesList.includes(c)
  );
  const initialCustom = existingCategories.filter(
    (c) => !defaultCategoriesList.includes(c)
  );

  const [timeframeInWeeks, setTimeframeInWeeks] =
    useState(existingTimeframe);
  const [selectedCategories, setSelectedCategories] =
    useState(initialSelected);
  const [customCategories, setCustomCategories] =
    useState(initialCustom);
  const [showPopup, setShowPopup] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [showTip, setShowTip] = useState(false);

  const defaultCategories = defaultCategoriesList;

  // Update selectedCategories and customCategories when plan categories change (e.g., when coming back from later steps)
  useEffect(() => {
    const freshPlan = planId
      ? plans.find((p) => p.id === planId)
      : plans.length > 0
      ? plans[plans.length - 1]
      : null;
    const freshCategories = freshPlan?.categories || [];
    const newSelected = freshCategories.filter((c) =>
      defaultCategoriesList.includes(c)
    );
    const newCustom = freshCategories.filter(
      (c) => !defaultCategoriesList.includes(c)
    );
    setSelectedCategories(newSelected);
    setCustomCategories(newCustom);
  }, [plans, planId]);

  // Toggle a category selection
  const toggleCategory = (category) => {
    const isDefaultCategory = defaultCategoriesList.includes(category);

    if (isDefaultCategory) {
      // Toggle default category
      setSelectedCategories((prev) => {
        if (prev.includes(category)) {
          return prev.filter((c) => c !== category);
        } else {
          return [...prev, category];
        }
      });
    } else {
      // Toggle custom category
      setCustomCategories((prev) => {
        if (prev.includes(category)) {
          return prev.filter((c) => c !== category);
        } else {
          return [...prev, category];
        }
      });
    }
  };

  // Add custom category
  const handleAddCustomCategory = () => {
    if (newCategoryName.trim() === "") {
      alert("Category name cannot be empty!");
      return;
    }
    setCustomCategories([...customCategories, newCategoryName.trim()]);
    setShowPopup(false);
    setNewCategoryName("");
  };

  // Save current data to plan
  const saveCurrentData = () => {
    // Combine and deduplicate all categories
    const allCategories = Array.from(
      new Set([...selectedCategories, ...customCategories].filter(Boolean))
    );

    if (actualPlanId) {
      const updatedPlans = plans.map((plan) =>
        plan.id === actualPlanId
          ? {
              ...plan,
              categories: allCategories,
              budgetTimeframeInWeeks: timeframeInWeeks,
            }
          : plan
      );
      setPlans(updatedPlans);
    } else if (plans.length > 0) {
      const updatedPlans = [...plans];
      updatedPlans[updatedPlans.length - 1] = {
        ...updatedPlans[updatedPlans.length - 1],
        categories: allCategories,
        budgetTimeframeInWeeks: timeframeInWeeks,
      };
      setPlans(updatedPlans);
    }
  };

  // Auto-save on changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        selectedCategories.length > 0 ||
        customCategories.length > 0 ||
        actualPlanId
      ) {
        saveCurrentData();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [selectedCategories, customCategories, timeframeInWeeks]);

  // Save all categories and move to set-budget page
  const handleNext = () => {
    saveCurrentData();
    navigate("/set-budget", { state: { planId: actualPlanId } });
  };

  // Handle back button - save and go to create page
  const handleBack = () => {
    saveCurrentData();
    navigate("/create", { state: { planId: actualPlanId } });
  };

  const circleStyle = (category, isCustom = false) => {
    // For default categories: check if in selectedCategories
    // For custom categories: check if in existingCategories (already saved) or in current customCategories
    const isSelected = isCustom
      ? existingCategories.includes(category) ||
        customCategories.includes(category)
      : selectedCategories.includes(category);

    return {
      width: "120px",
      height: "120px",
      borderRadius: "50%",
      backgroundColor: isSelected ? "var(--color-light-text)" : "#ddd",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      fontSize: isCustom ? "1rem" : "1.1rem",
      fontWeight: "500",
      transition: "0.2s",
      textAlign: "center",
      padding: "0.4rem",
    };
  };

  return (
    <div style={{ textAlign: "center", marginTop: "3rem" }}>
      <StepIndicator />
      <h1>Add Budget Categories</h1>

      <h2>Timeline</h2>

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
            marginLeft: "0.5rem",
            marginRight: "0.5rem",
            padding: "0.5rem",
            width: "80px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            textAlign: "center",
          }}
        />
        <label htmlFor="timeframe">week(s)</label>
      </div>

      <h2 style={{ marginTop: "2.5rem" }}>Select Categories</h2>

      {/* Question + tip toggle */}
      <div
        style={{
          marginTop: "0.5rem",
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
            <li>
              Basic living costs (rent, groceries, utilities) are already
              counted.
            </li>
            <li>
              Saving goals are things you want to put money aside for after
              that.
            </li>
            <li>
              Examples: emergency fund, a trip, education, or a big purchase.
            </li>
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
        className="add-entry-btn"
        style={{ width: "200px", marginTop: "2rem" }}
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
                  backgroundColor: "var(--color-primary-light)",
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

      {/* Navigation Buttons */}
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          justifyContent: "center",
          marginTop: "2rem",
        }}
      >
        <button className="btn-navigation" onClick={handleBack}>
          ← Back
        </button>
        <button className="btn-navigation" onClick={handleNext}>
          Next →
        </button>
      </div>
    </div>
  );
}
