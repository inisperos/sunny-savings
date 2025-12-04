// src/pages/SetBudgetPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../App.css";
import { calculatePlanDetails } from "../utils/planDetails";
import StepIndicator from "../components/StepIndicator";

function BudgetCard({ category, value, onChange, onDelete }) {
  const cardStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    maxWidth: "760px",
    margin: "0.75rem auto",
    gap: "0.75rem",
  };

  const leftStyle = {
    flex: 1,
    padding: "1rem",
    border: "2px solid var(--color-dark-text)",
    borderRadius: "12px",
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
      <button
        onClick={() => {
          if (
            window.confirm(
              `Are you sure you want to delete "${category}"? This will remove all budget and savings data for this category.`
            )
          ) {
            onDelete(category);
          }
        }}
        className="delete-btn"
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "var(--color-light-text)";
          e.currentTarget.style.color = "white";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = "var(--color-light-text)";
        }}
        title={`Delete ${category}`}
      >
        ×
      </button>
    </div>
  );
}

export default function SetBudgetPage({ plans, setPlans }) {
  const navigate = useNavigate();
  const locationState = useLocation();

  // 哪个 plan
  const planId = locationState.state?.planId;
  const currentPlan = planId
    ? plans.find((p) => p.id === planId)
    : plans.length > 0
    ? plans[plans.length - 1]
    : null;
  const actualPlanId = planId || currentPlan?.id;

  const categories = currentPlan?.categories || [];
  const weeksInPlan = currentPlan?.weeks || 4;
  const timeframeInWeeks = currentPlan?.budgetTimeframeInWeeks || 4;

  const { totalDisposableIncome } = currentPlan
    ? calculatePlanDetails(currentPlan)
    : { totalDisposableIncome: 0 };

  const initialBudgetAvailable =
    weeksInPlan > 0
      ? (totalDisposableIncome / weeksInPlan) * timeframeInWeeks
      : 0;

  const existingBudgets = currentPlan?.budgets || [];
  const initialAmounts = {};
  categories.forEach((c) => {
    const existing = existingBudgets.find((b) => b.category === c);
    initialAmounts[c] =
      existing && typeof existing.amount === "number"
        ? existing.amount.toString()
        : "";
  });

  const [amounts, setAmounts] = useState(initialAmounts);
  const [showAdd, setShowAdd] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [budgetAvailable, setBudgetAvailable] =
    useState(initialBudgetAvailable);

  // 根据当前 amounts 重新算还能分多少
  useEffect(() => {
    const totalAllocated = Object.values(amounts).reduce(
      (sum, val) => sum + (parseFloat(val) || 0),
      0
    );
    setBudgetAvailable(initialBudgetAvailable - totalAllocated);
  }, [amounts, initialBudgetAvailable]);

  const saveCurrentData = () => {
    if (!categories.length) return;

    if (actualPlanId) {
      const updated = plans.map((plan) => {
        if (plan.id !== actualPlanId) return plan;

        const budgets = categories.map((c) => ({
          category: c,
          amount: parseFloat(amounts[c]) || 0,
        }));

        const savings = {};
        categories.forEach((c) => {
          savings[c] = plan.savings?.[c] || 0;
        });

        return {
          ...plan,
          budgets,
          savings,
        };
      });
      setPlans(updated);
    } else if (plans.length > 0) {
      const updatedPlans = [...plans];
      const lastIndex = updatedPlans.length - 1;
      const last = updatedPlans[lastIndex];

      const planCategories = last.categories || categories;

      const budgets = planCategories.map((c) => ({
        category: c,
        amount: parseFloat(amounts[c]) || 0,
      }));

      const savings = {};
      planCategories.forEach((c) => {
        savings[c] = last.savings?.[c] || 0;
      });

      updatedPlans[lastIndex] = {
        ...last,
        budgets,
        savings,
      };

      setPlans(updatedPlans);
    }
  };

  // 自动保存
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Object.keys(amounts).length > 0 && (actualPlanId || plans.length)) {
        saveCurrentData();
      }
    }, 1000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amounts]);

  const handleAmountChange = (category, value) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmounts((prev) => ({
        ...prev,
        [category]: value,
      }));
    }
  };

  const handleAddCategory = () => {
    if (newCategory.trim() === "") {
      alert("Category name cannot be empty");
      return;
    }

    const trimmed = newCategory.trim();

    const targetId =
      actualPlanId || (plans.length ? plans[plans.length - 1].id : null);
    if (!targetId) return;

    const updated = plans.map((plan) => {
      if (plan.id !== targetId) return plan;
      const existing = Array.isArray(plan.categories) ? plan.categories : [];
      if (existing.includes(trimmed)) return plan;
      return {
        ...plan,
        categories: [...existing, trimmed],
      };
    });
    setPlans(updated);

    setAmounts((prev) => ({
      ...prev,
      [trimmed]: "",
    }));
    setNewCategory("");
    setShowAdd(false);
  };

  const handleDeleteCategory = (categoryToDelete) => {
    const targetId =
      actualPlanId || (plans.length ? plans[plans.length - 1].id : null);
    if (!targetId) return;

    const updated = plans.map((plan) => {
      if (plan.id !== targetId) return plan;

      const updatedCategories = (plan.categories || []).filter(
        (c) => c !== categoryToDelete
      );
      const updatedBudgets = (plan.budgets || []).filter(
        (b) => b.category !== categoryToDelete
      );
      const updatedSavings = { ...(plan.savings || {}) };
      delete updatedSavings[categoryToDelete];

      return {
        ...plan,
        categories: updatedCategories,
        budgets: updatedBudgets,
        savings: updatedSavings,
      };
    });

    setPlans(updated);

    setAmounts((prev) => {
      const copy = { ...prev };
      delete copy[categoryToDelete];
      return copy;
    });
  };

  const handleNext = () => {
    saveCurrentData();
    navigate("/");
  };

  const handleBack = () => {
    saveCurrentData();
    navigate("/categories", { state: { planId: actualPlanId } });
  };

  const isOverBudget = budgetAvailable < 0;
  const overAmount = Math.abs(budgetAvailable);

  return (
    <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
      <StepIndicator />
      <h1 style={{ fontWeight: 700 }}>Add Savings Goals</h1>
      <h2 style={{ marginTop: "0.25rem" }}>How much do you want to save?</h2>

      <h2
        style={{
          marginTop: "0.25rem",
          color: isOverBudget ? "#dc2626" : "var(--color-light-text)",
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
        <p style={{ color: "var(--color-accent-dark)", marginTop: "0.25rem" }}>
          Please reduce one or more category budgets until the remaining amount
          is positive.
        </p>
      )}

      <p style={{ color: "var(--color-dark-text)" }}>
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
            onDelete={handleDeleteCategory}
          />
        ))}

        {/* Add new category section */}
        <div style={{ maxWidth: "760px", margin: "1.25rem auto" }}>
          {!showAdd ? (
            <button
              onClick={() => setShowAdd(true)}
              className="add-entry-btn"
            >
              Add New Category +
            </button>
          ) : (
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                alignItems: "center",
                padding: "1rem",
                border: "2px solid var(--color-accent-dark)",
                borderRadius: "12px",
                backgroundColor: "#fff",
              }}
            >
              <input
                type="text"
                placeholder="New category name"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddCategory();
                  } else if (e.key === "Escape") {
                    setShowAdd(false);
                    setNewCategory("");
                  }
                }}
                autoFocus
                style={{
                  flex: 1,
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  border: "2px solid var(--color-dark-grey)",
                  fontSize: "1rem",
                  outline: "none",
                }}
              />
              <button
                onClick={handleAddCategory}
                style={{
                  padding: "0.75rem 1.25rem",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "var(--color-accent-dark)",
                  color: "white",
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  fontWeight: "500",
                  transition: "opacity 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = "0.9";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = "1";
                }}
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowAdd(false);
                  setNewCategory("");
                }}
                style={{
                  padding: "0.75rem 1.25rem",
                  borderRadius: "8px",
                  border: "1px solid var(--color-dark-grey)",
                  backgroundColor: "transparent",
                  color: "var(--color-dark-grey)",
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  fontWeight: "500",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginTop: "2rem" }}>

          <button className="btn-navigation" onClick={handleBack}>
            ← Back
          </button>

          <button
            onClick={handleNext}
            disabled={isOverBudget}
            style={{
              padding: "0.75rem 1.25rem",
              borderRadius: "12px",
              border: "none",
              background: isOverBudget ? "var(--color-dark-grey)" : "var(--color-accent-dark)",
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
