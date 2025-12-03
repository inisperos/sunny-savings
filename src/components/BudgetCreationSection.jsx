// src/components/BudgetCreationSection.jsx
import React from "react";
import { calculatePlanDetails } from "../utils/planDetails";

export default function BudgetCreationSection({ plan, formatCurrency, navigate }) {
  if (!plan) return null;

  const budgetTimeframeInWeeks = plan.budgetTimeframeInWeeks;
  const numberOfCategories = plan.budgets ? plan.budgets.length : 0;
  const { totalDisposableIncome } = calculatePlanDetails(plan);

  return (
    <div>
      {/* Budget Allocation Summary Section */}
      {numberOfCategories > 0 ? (
        <div
          style={{
            backgroundColor: "var(--color-background-accent)",
            padding: "1.5rem",
            borderRadius: "8px",
            marginBottom: "1.5rem",
            border: "2px solid var(--color-primary-dark)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
            <h2 style={{ marginTop: 0, marginBottom: 0 }}>
              Budget Allocation Summary
            </h2>
            <button
              onClick={() => navigate("/set-budget", { state: { planId: plan.id } })}
              style={{
                padding: "0.4rem 0.8rem",
                borderRadius: "6px",
                border: "1px solid var(--color-primary-dark)",
                backgroundColor: "transparent",
                color: "var(--color-primary-dark)",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              Edit Budget
            </button>
          </div>
          <p>Per {budgetTimeframeInWeeks} week(s)</p>
          <ul
            style={{
              listStyleType: "none",
              padding: 0,
              margin: 0,
            }}
          >
            {plan.budgets.map((budget, index) => (
              <li
                key={index}
                style={{
                  padding: "0.25rem 0",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>
                  <strong>{budget.category}:</strong>
                </span>
                <span>{formatCurrency(plan.budgets?.find(b => b.category === budget.category)?.amount || 0)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div
          style={{
            backgroundColor: "var(--color-background-accent)",
            padding: "1.5rem",
            borderRadius: "8px",
            marginBottom: "1.5rem",
            border: "2px dashed var(--color-primary-dark)",
            textAlign: "center",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: "0.5rem" }}>
            No Budget Set Up
          </h2>
          <p style={{ color: "#6b7280", marginBottom: "1rem" }}>
            Set up your savings goals and budget categories for this offer.
          </p>
          <button
            onClick={() => navigate("/categories", { state: { planId: plan.id } })}
            style={{
              padding: "0.7rem 1.2rem",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "var(--color-primary-dark)",
              color: "white",
              cursor: "pointer",
              fontSize: "0.95rem",
              fontWeight: 500,
            }}
          >
            Set Up Budget
          </button>
        </div>
      )}

      {/* Savings Tracking Section */}
      {numberOfCategories > 0 && plan.savings && (
        <div
          style={{
            backgroundColor: "var(--color-background-accent)",
            padding: "1.5rem",
            borderRadius: "8px",
            marginBottom: "1.5rem",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ marginTop: 0, marginBottom: 0 }}>
              Savings Progress
            </h2>
            <button
              onClick={() => navigate(`/track/${plan.id}`)}
              style={{
                padding: "0.4rem 0.8rem",
                borderRadius: "6px",
                border: "1px solid var(--color-primary-dark)",
                backgroundColor: "transparent",
                color: "var(--color-primary-dark)",
                cursor: "pointer",
                fontSize: "0.85rem",
              }}
            >
              Track Savings
            </button>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: "1rem",
            }}
          >
            {plan.budgets.map((budget, index) => {
              const saved = plan.savings?.[budget.category] || 0;
              const goal = budget.amount || 0;
              const percent = goal > 0 ? Math.min((saved / goal) * 100, 100) : 0;

              return (
                <div
                  key={index}
                  style={{
                    padding: "1rem",
                    backgroundColor: "white",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                  }}
                >
                  <div style={{ fontWeight: "600", marginBottom: "0.5rem" }}>
                    {budget.category}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "0.25rem" }}>
                    Goal: {formatCurrency(goal)}
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "0.5rem" }}>
                    Saved: {formatCurrency(saved)}
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: "8px",
                      backgroundColor: "#e5e7eb",
                      borderRadius: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${percent}%`,
                        height: "100%",
                        backgroundColor: percent >= 100 ? "#10b981" : "var(--color-primary-dark)",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>
                    {percent.toFixed(0)}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

