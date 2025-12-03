// src/pages/SetBudgetPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import '../App.css'
import { calculatePlanDetails } from "../utils/planDetails";
import StepIndicator from '../components/StepIndicator';

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
          if (window.confirm(`Are you sure you want to delete "${category}"? This will remove all budget and savings data for this category.`)) {
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
  
  // Get plan ID from location state
  const planId = locationState.state?.planId;
  const currentPlan = planId ? plans.find(p => p.id === planId) : (plans.length > 0 ? plans[plans.length - 1] : null);
  const actualPlanId = planId || (currentPlan?.id);

  // obtain categories from current plan
  const categories = currentPlan?.categories || [];

  // obtain number of weeks from current plan
  const weeksInPlan = currentPlan?.weeks || 4;

  // obtain timeframeInWeeks from current plan
  const timeframeInWeeks = currentPlan?.budgetTimeframeInWeeks || 4;

  // obtain totalDisposableIncome from current plan
  const { totalDisposableIncome } = currentPlan
    ? calculatePlanDetails(currentPlan)
    : { totalDisposableIncome: 0 };

  // calculate initial budget available based on timeframe and weeks in plan
  const initialBudgetAvailable =
    (totalDisposableIncome / weeksInPlan) * timeframeInWeeks || 0;

  // Load existing budgets from plan, but only for categories that are currently in the categories array
  const existingBudgets = currentPlan?.budgets || [];
  const initialAmounts = {};
  // Only initialize amounts for categories that are in the current categories array
  categories.forEach((c) => {
    const existingBudget = existingBudgets.find(b => b.category === c);
    initialAmounts[c] = existingBudget ? (existingBudget.amount?.toString() || "") : "";
  });

  // local state for amounts keyed by category name
  const [amounts, setAmounts] = useState(initialAmounts);
  const [showAdd, setShowAdd] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [budgetAvailable, setBudgetAvailable] =
    useState(initialBudgetAvailable);

  useEffect(() => {
    setAmounts((prev) => {
      const next = {};
      // Only keep categories that are in the current categories array
      categories.forEach((c) => {
        // Preserve existing amount if category still exists, otherwise initialize to empty
        next[c] = prev[c] !== undefined ? prev[c] : "";
      });
      // Remove categories that are no longer in the categories array
      return next;
    });

    // Clean up budgets and savings for deleted categories when categories change
    if (actualPlanId && currentPlan) {
      const currentBudgetCategories = (currentPlan.budgets || []).map(b => b.category);
      const hasDeletedCategories = currentBudgetCategories.some(cat => !categories.includes(cat));
      
      if (hasDeletedCategories) {
        // Only update if there are actually deleted categories
        const updatedPlans = plans.map((plan) => {
          if (plan.id === actualPlanId) {
            // Filter budgets to only include current categories
            const validBudgets = (plan.budgets || []).filter(b => categories.includes(b.category));
            
            // Filter savings to only include current categories
            const validSavings = {};
            categories.forEach((c) => {
              validSavings[c] = plan.savings?.[c] || 0;
            });

            return {
              ...plan,
              budgets: validBudgets,
              savings: validSavings,
            };
          }
          return plan;
        });
        setPlans(updatedPlans);
      }
    }
  }, [categories, actualPlanId]);

  // Save current budget data - only save categories that are in the current categories array
  const saveCurrentData = () => {
    // Filter amounts to only include categories that are currently in the categories array
    const validAmounts = {};
    categories.forEach((c) => {
      if (amounts[c] !== undefined) {
        validAmounts[c] = amounts[c];
      }
    });

    if (actualPlanId) {
      const updatedPlans = plans.map((plan) => {
        if (plan.id === actualPlanId) {
          // Only save budgets for categories that are in the current categories array
          const validBudgets = categories.map((c) => ({
            category: c,
            amount: parseFloat(validAmounts[c]) || 0,
          }));

          // Only keep savings for categories that are in the current categories array
          const validSavings = {};
          categories.forEach((c) => {
            validSavings[c] = plan.savings?.[c] || 0;
          });

          return {
            ...plan,
            budgets: validBudgets,
            savings: validSavings,
          };
        }
        return plan;
      });
      setPlans(updatedPlans);
    } else if (plans.length > 0) {
      // Fallback to last plan
      const updatedPlans = [...plans];
      const lastIndex = updatedPlans.length - 1;

      const validBudgets = categories.map((c) => ({
        category: c,
        amount: parseFloat(validAmounts[c]) || 0,
      }));

      const validSavings = {};
      categories.forEach((c) => {
        validSavings[c] = updatedPlans[lastIndex].savings?.[c] || 0;
      });

      updatedPlans[lastIndex] = {
        ...updatedPlans[lastIndex],
        budgets: validBudgets,
        savings: validSavings,
      };
      setPlans(updatedPlans);
    }
  };

  // Auto-save on changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (Object.keys(amounts).length > 0 || actualPlanId) {
        saveCurrentData();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [amounts]);

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

    const trimmedCategory = newCategory.trim();

    // Check if category already exists
    if (categories.includes(trimmedCategory)) {
      alert("This category already exists!");
      return;
    }

    // Update plans with new category appended
    if (actualPlanId) {
      const updatedPlans = plans.map((plan) => {
        if (plan.id === actualPlanId) {
          const existing = Array.isArray(plan.categories) ? plan.categories : [];
          if (!existing.includes(trimmedCategory)) {
            return {
              ...plan,
              categories: [...existing, trimmedCategory],
            };
          }
        }
        return plan;
      });
      setPlans(updatedPlans);
    } else if (plans.length > 0) {
      // Fallback to last plan if no ID
      const updatedPlans = [...plans];
      const last = { ...updatedPlans[updatedPlans.length - 1] };
      const existing = Array.isArray(last.categories) ? last.categories : [];
      if (!existing.includes(trimmedCategory)) {
        last.categories = [...existing, trimmedCategory];
        updatedPlans[updatedPlans.length - 1] = last;
        setPlans(updatedPlans);
      }
    }

    // Initialize amount for it locally
    setAmounts((prev) => ({ ...prev, [trimmedCategory]: "" }));
    setNewCategory("");
    setShowAdd(false);
  };

  // Handle category deletion - removes category and all related data
  const handleDeleteCategory = (categoryToDelete) => {
    if (actualPlanId) {
      const updatedPlans = plans.map((plan) => {
        if (plan.id === actualPlanId) {
          // Remove from categories array
          const updatedCategories = (plan.categories || []).filter(c => c !== categoryToDelete);
          
          // Remove from budgets array
          const updatedBudgets = (plan.budgets || []).filter(b => b.category !== categoryToDelete);
          
          // Remove from savings object
          const updatedSavings = { ...plan.savings };
          delete updatedSavings[categoryToDelete];

          return {
            ...plan,
            categories: updatedCategories,
            budgets: updatedBudgets,
            savings: updatedSavings,
          };
        }
        return plan;
      });
      setPlans(updatedPlans);
    } else if (plans.length > 0) {
      // Fallback to last plan
      const updatedPlans = [...plans];
      const last = { ...updatedPlans[updatedPlans.length - 1] };
      
      const updatedCategories = (last.categories || []).filter(c => c !== categoryToDelete);
      const updatedBudgets = (last.budgets || []).filter(b => b.category !== categoryToDelete);
      const updatedSavings = { ...last.savings };
      delete updatedSavings[categoryToDelete];

      updatedPlans[updatedPlans.length - 1] = {
        ...last,
        categories: updatedCategories,
        budgets: updatedBudgets,
        savings: updatedSavings,
      };
      setPlans(updatedPlans);
    }

    // Remove from local amounts state
    setAmounts((prev) => {
      const updated = { ...prev };
      delete updated[categoryToDelete];
      return updated;
    });
  };

  const handleNext = () => {
    saveCurrentData();
    navigate("/");
  };

  // Handle back button - save and go to categories page
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

        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginTop: "2rem" }}>

          <button className="btn-navigation" onClick={handleBack}>
            ← Back
          </button>
          <button className="btn-navigation" onClick={handleNext} >
            Next →
          </button>
        </div>

      </div>
    </div>
  );
}
