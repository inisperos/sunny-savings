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
    border: "2px solid #000",
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

  const deleteButtonStyle = {
    width: "48px",
    height: "48px",
    borderRadius: "8px",
    border: "2px solid #dc3545",
    backgroundColor: "transparent",
    color: "#dc3545",
    cursor: "pointer",
    fontSize: "1.5rem",
    fontWeight: "bold",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    flexShrink: 0,
    lineHeight: "1",
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
        style={deleteButtonStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#dc3545";
          e.currentTarget.style.color = "white";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = "#dc3545";
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
            onDelete={handleDeleteCategory}
          />
        ))}

        {/* Add new category section */}
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
                fontWeight: "500",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#e9e9e9";
                e.currentTarget.style.borderColor = "#333";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#f3f3f3";
                e.currentTarget.style.borderColor = "#000";
              }}
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
                border: "2px solid #ccc",
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
                  border: "2px solid #ccc",
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
                  border: "1px solid #ccc",
                  backgroundColor: "transparent",
                  color: "#666",
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  fontWeight: "500",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f3f3f3";
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

        <div
          style={{
            maxWidth: "760px",
            margin: "2rem auto",
            textAlign: "right",
          }}
        >
          <button
            onClick={handleBack}
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
            ← Back (Save)
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
