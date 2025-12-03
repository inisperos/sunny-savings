// src/pages/SetBudgetPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import '../App.css'
import { calculatePlanDetails } from "../utils/planCalculations";

function BudgetCard({ category, value, onChange }) {
  const cardStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    maxWidth: "760px",
    margin: "0.75rem auto",
  };

  const leftStyle = {
    flex: 1,
    padding: "1rem",
    border: "2px solid #000",
    borderRadius: "12px",
    marginRight: "1rem",
    textAlign: "center",
    fontSize: "1.3rem",
    background: "#fff",
  };

  const inputStyle = {
    width: "260px",
    padding: "1rem",
    borderRadius: "12px",
    border: "2px solid #ccc",
    fontSize: "1.05rem",
    textAlign: "right",
  };

  return (
    <div style={cardStyle}>
      <div style={leftStyle}>{category}</div>
      <input
        type="number"
        placeholder="$0"
        value={value}
        onChange={(e) => onChange(category, e.target.value)}
        style={inputStyle}
        min="0"
      />
    </div>
  );
}

export default function SetBudgetPage({ plans, setPlans }) {
  const navigate = useNavigate();

  // obtain categories from last plan
  const categories =
    plans && plans.length > 0 ? plans[plans.length - 1].categories || [] : [];

  // obtain number of weeks from last plan
  const weeksInPlan =
    plans && plans.length > 0 ? plans[plans.length - 1].weeks || 4 : 4;

  // obtain timeframeInWeeks from last plan
  const timeframeInWeeks =
    plans && plans.length > 0
      ? plans[plans.length - 1].budgetTimeframeInWeeks || 4
      : 4;

  // obtain totalDisposableIncome from last plan
  const { totalDisposableIncome } =
    plans && plans.length > 0
      ? calculatePlanDetails(plans[plans.length - 1])
      : {};

  // calculate initial budget available based on timeframe and weeks in plan
  const initialBudgetAvailable =
    (totalDisposableIncome / weeksInPlan) * timeframeInWeeks || 0;

  // local state for amounts keyed by category name
  const [amounts, setAmounts] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [budgetAvailable, setBudgetAvailable] =
    useState(initialBudgetAvailable);

  useEffect(() => {
    setAmounts((prev) => {
      const next = { ...prev };
      categories.forEach((c) => {
        if (next[c] === undefined) next[c] = "";
      });
      return next;
    });
  }, [categories]);

  const handleAmountChange = (category, value) => {
    // allow only numeric input (empty or number)
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmounts((prev) => {
        const updatedAmounts = { ...prev, [category]: value };
        const totalAllocated = Object.values(updatedAmounts).reduce(
          (sum, val) => sum + (parseFloat(val) || 0),
          0
        );
        setBudgetAvailable(initialBudgetAvailable - totalAllocated);
        return updatedAmounts;
      });
    }
  };

  const handleAddCategory = () => {
    if (newCategory.trim() === "") {
      alert("Category name cannot be empty");
      return;
    }

    // update plans with new category appended
    if (plans.length > 0) {
      const updatedPlans = [...plans];
      const last = { ...updatedPlans[updatedPlans.length - 1] };
      const existing = Array.isArray(last.categories) ? last.categories : [];
      if (!existing.includes(newCategory)) {
        last.categories = [...existing, newCategory];
        updatedPlans[updatedPlans.length - 1] = last;
        setPlans(updatedPlans);
      }
    }

    // initialize amount for it locally
    setAmounts((prev) => ({ ...prev, [newCategory]: "" }));
    setNewCategory("");
    setShowAdd(false);
  };

  const handleNext = () => {
    if (plans.length > 0) {
      const updatedPlans = [...plans];
      updatedPlans[updatedPlans.length - 1] = {
        ...updatedPlans[updatedPlans.length - 1],
        budgets: Object.keys(amounts).map((c) => ({
          category: c,
          amount: amounts[c] === "" ? 0 : parseFloat(amounts[c]),
        })),
      };
      setPlans(updatedPlans);
    }

    navigate("/");
  };


  const isOverBudget = budgetAvailable < 0;
  const overAmount = Math.abs(budgetAvailable);

  return (
    <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
      <h1 style={{ fontWeight: 700 }}>Add your savings goals.</h1>
      <h2 style={{ marginTop: "0.25rem" }}>How much do you want to save?</h2>

      <h2
        style={{
          marginTop: "0.25rem",
          color: isOverBudget ? "#dc2626" : "#16a34a",
        }}
      >
        {isOverBudget ? (
          <>
            You are over budget by {overAmount.toFixed(2)} per{" "}
            {timeframeInWeeks} week(s).
          </>
        ) : (
          <>
            You have {budgetAvailable.toFixed(2)} available to allocate per{" "}
            {timeframeInWeeks} week(s).
          </>
        )}
      </h2>

      {isOverBudget && (
        <p style={{ color: "#dc2626", marginTop: "0.25rem" }}>
          Please reduce one or more category budgets until the remaining amount
          is positive.
        </p>
      )}

      <p style={{ color: "#555" }}>
        It is recommended that your savings make up 20% of your disposable
        income.
      </p>

      <div style={{ marginTop: "1.5rem" }}>
        {categories.map((c) => (
          <BudgetCard
            key={c}
            category={c}
            value={amounts[c] || ""}
            onChange={handleAmountChange}
          />
        ))}

        {/* Add new category dashed button */}
        <div style={{ maxWidth: "760px", margin: "1.25rem auto" }}>
          {!showAdd ? (
            <button
              onClick={() => setShowAdd(true)}
              style={{
                width: "100%",
                padding: "1rem",
                border: "4px dashed #000",
                borderRadius: "16px",
                background: "#f3f3f3",
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              Add New Category +
            </button>
          ) : (
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                alignItems: "center",
              }}
            >
              <input
                type="text"
                placeholder="New category name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                style={{
                  flex: 1,
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                }}
              />
              <button
                onClick={handleAddCategory}
                style={{ padding: "0.6rem 0.9rem", cursor: "pointer" }}
              >
                Add
              </button>
              <button
                onClick={() => setShowAdd(false)}
                style={{ padding: "0.6rem 0.9rem", cursor: "pointer" }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>


        <div
          style={{
            maxWidth: "760px",
            margin: "2rem auto",
            textAlign: "right",
          }}
        >

          <button
            onClick={() => navigate("/fees")}
            style={{
              padding: "0.75rem 1.25rem",
              borderRadius: "12px",
              border: "1px solid #d1d5db",
              background: "#6b7280",
              color: "#ffffff",
              cursor: "pointer",
              fontSize: "1rem",
              marginRight: "0.75rem",
            }}
          >
            ← Back to fees
          </button>

          <button
            onClick={handleNext}
            disabled={isOverBudget}
            style={{
              padding: "0.75rem 1.25rem",
              borderRadius: "12px",
              border: "none",
              background: isOverBudget ? "#9ca3af" : "#007bff",
              cursor: isOverBudget ? "not-allowed" : "pointer",
              fontSize: "1rem",
              color: "#ffffff",
            }}
          >
            Finish
          </button>
        </div>
      </div>
    </div>
  );
}