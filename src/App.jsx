// src/App.jsx
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useParams,
} from "react-router-dom";
import "./App.css";
import { calculatePlanDetails } from "./utils/planCalculations";

import CreatePlanPage from "./pages/CreatePlanPage";
import SelectBudgetCategoriesPage from "./pages/SelectCategoriesPage";
import AddFeesPage from "./pages/AddFeesPage";
import SetBudgetPage from "./pages/SetBudgetPage";
import ComparePlansPage from "./pages/ComparePlansPage";
import TrackSavingsPage from "./pages/TrackSavings";

// Home Page
function Home({ plans, deletePlan }) {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
      <h1 style={{ fontSize: "2.2rem" }}>Sunny Savings</h1>
      <p style={{ color: "#4b5563", marginTop: "0.5rem" }}>
        Welcome to your budgeting dashboard!
      </p>

      <div
        style={{
          marginTop: "2rem",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h2>Your Plans:</h2>

        {plans.length === 0 ? (
          <p>No plans created yet.</p>
        ) : (
          plans.map((plan) => (
            <div
              key={plan.id}
              style={{
                width: "350px",
                border: "1px solid var(--color-accent-dark)",
                borderRadius: "12px",
                padding: "0.85rem",
                marginBottom: "1.25rem",
                backgroundColor: "var(--color-light-grey)",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.06)",
                transition: "transform 0.15s ease, box-shadow 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 14px rgba(0, 0, 0, 0.12)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "none";
                e.currentTarget.style.boxShadow =
                  "0 2px 6px rgba(0, 0, 0, 0.06)";
              }}
            >
              <h2
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 600,
                  margin: "0 0 0.6rem 0",
                  letterSpacing: "0.3px",
                  color: "var(--color-accent-dark)",
                }}
              >
                {plan.company}
              </h2>

              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "0.4rem",
                  marginTop: "0.25rem",
                }}
              >
                <button
                  onClick={() => navigate(`/plan/${plan.id}`)}
                  style={{
                    backgroundColor: "var(--color-accent-dark)",
                    color: "white",
                    border: "none",
                    padding: "0.45rem 0.75rem",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    transition: "opacity 0.15s ease",
                  }}
                >
                  View
                </button>

                <button
                  onClick={() => navigate(`/track/${plan.id}`)}
                  style={{
                    backgroundColor: "var(--color-primary-dark)",
                    color: "white",
                    border: "none",
                    padding: "0.45rem 0.75rem",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    transition: "opacity 0.15s ease",
                  }}
                >
                  Track
                </button>

                <button
                  onClick={() => {
                    const confirmed = window.confirm(
                      `Are you sure you want to delete "${plan.company}"?`
                    );
                    if (confirmed) {
                      deletePlan(plan.id);
                    }
                  }}
                  style={{
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    padding: "0.4rem 0.8rem",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}

        <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem" }}>
          <button
            onClick={() => navigate("/create")}
            style={{
              padding: "0.7rem 1.2rem",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "var(--color-accent-dark)",
              color: "white",
              cursor: "pointer",
              fontSize: "0.95rem",
              fontWeight: 500,
            }}
          >
            Create New Plan
          </button>

          <button
            onClick={() => navigate("/compare")}
            disabled={plans.length < 2}
            style={{
              padding: "0.7rem 1.2rem",
              borderRadius: "8px",
              border: "none",
              backgroundColor:
                plans.length < 2 ? "#d1d5db" : "var(--color-accent-dark)",
              color: "white",
              cursor: plans.length < 2 ? "not-allowed" : "pointer",
              fontSize: "0.95rem",
              fontWeight: 500,
            }}
          >
            Compare Plans
          </button>
        </div>
      </div>
    </div>
  );
}

// Plan Details Page
function PlanDetails({ plans }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const plan = plans.find((p) => p.id === parseInt(id));

  const budgetTimeframeInWeeks = plan?.budgetTimeframeInWeeks;

  if (!plan) {
    return (
      <div style={{ textAlign: "center", marginTop: "4rem" }}>
        <h2>Plan not found</h2>
        <button
          onClick={() => navigate("/")}
          style={{
            marginTop: "1rem",
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "var(--color-dark-grey)",
            color: "white",
            cursor: "pointer",
          }}
        >
          Back Home
        </button>
      </div>
    );
  }

  const {
    totalIncome,
    totalReimbursements,
    totalFees,
    totalRentCost = 0,
    totalTransportationCost = 0,
    totalGroceriesCost = 0,
    totalUtilitiesCost = 0,
    totalDisposableIncome,
  } = calculatePlanDetails(plan);

  const otherLivingExpenses =
    (totalGroceriesCost || 0) + (totalUtilitiesCost || 0);

  const numberOfCategories = plan.budgets ? plan.budgets.length : 0;

  const formatCurrency = (amount) => {
    return `$${amount
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

  return (
    <div style={{ maxWidth: "900px", margin: "2rem auto", padding: "0 1rem" }}>
      <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>
        {plan.company || "Plan Details"}
      </h1>

      {/* Offer Details Section */}
      <div
        style={{
          backgroundColor: "var(--color-background-accent)",
          padding: "1.5rem",
          borderRadius: "8px",
          marginBottom: "1.5rem",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: "1rem" }}>Offer Details</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
          }}
        >
          <div>
            <strong>Salary:</strong> {formatCurrency(plan.salary)} (
            {plan.salaryFrequency})
          </div>
          <div>
            <strong>Number of Weeks:</strong> {plan.weeks || 0}
          </div>
          <div>
            <strong>Total Earnings:</strong> {formatCurrency(totalIncome)}
          </div>
        </div>
      </div>

      {/* Location Info Section */}
      <div
        style={{
          backgroundColor: "var(--color-background-accent)",
          padding: "1.5rem",
          borderRadius: "8px",
          marginBottom: "1.5rem",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: "1rem" }}>Location Info</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
          }}
        >
          <div>
            <strong>Location:</strong> {plan.location || "N/A"}
          </div>
          <div>
            <strong>Rent:</strong> {formatCurrency(plan.rent || 0)} (
            {plan.rentFrequency || "monthly"})
          </div>
          <div>
            <strong>Transportation:</strong>{" "}
            {formatCurrency(plan.transportation || 0)} (
            {plan.transportFrequency || "monthly"})
          </div>
        </div>
      </div>

      {/* Savings Goals Section */}
      {plan.goals && plan.goals.length > 0 && (
        <div
          style={{
            backgroundColor: "var(--color-background-accent)",
            padding: "1.5rem",
            borderRadius: "8px",
            marginBottom: "1.5rem",
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: "1rem" }}>Savings Goals</h2>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >
            {plan.goals.map((goal, index) => (
              <span
                key={index}
                style={{
                  backgroundColor: "var(--color-border)",
                  borderRadius: "20px",
                  padding: "0.4rem 1rem",
                  fontSize: "0.95rem",
                  border: "1px solid var(--color-accent-dark)",
                  color: "var(--color-accent-dark)",
                }}
              >
                {goal}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Reimbursements / Stipends Section */}
      <div
        style={{
          backgroundColor: "var(--color-background-accent)",
          padding: "1.5rem",
          borderRadius: "8px",
          marginBottom: "1.5rem",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: "1rem" }}>
          Reimbursements / Stipends
        </h2>
        {plan.stipends && plan.stipends.length > 0 ? (
          <>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: "0.5rem",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#e9ecef" }}>
                  <th
                    style={{
                      border: "1px solid #dee2e6",
                      padding: "0.75rem",
                      textAlign: "left",
                    }}
                  >
                    Type
                  </th>
                  <th
                    style={{
                      border: "1px solid #dee2e6",
                      padding: "0.75rem",
                      textAlign: "right",
                    }}
                  >
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {plan.stipends.map((s, i) => (
                  <tr key={i}>
                    <td
                      style={{
                        border: "1px solid #dee2e6",
                        padding: "0.75rem",
                      }}
                    >
                      {s.type || "N/A"}
                    </td>
                    <td
                      style={{
                        border: "1px solid #dee2e6",
                        padding: "0.75rem",
                        textAlign: "right",
                      }}
                    >
                      {formatCurrency(s.amount || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ textAlign: "right", fontWeight: "600" }}>
              Total: {formatCurrency(totalReimbursements)}
            </div>
          </>
        ) : (
          <p style={{ color: "var(--color-dark-grey)", margin: 0 }}>
            No reimbursements / stipends
          </p>
        )}
      </div>

      {/* Fees Section */}
      <div
        style={{
          backgroundColor: "var(--color-background-accent)",
          padding: "1.5rem",
          borderRadius: "8px",
          marginBottom: "1.5rem",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: "1rem" }}>Fees</h2>
        {plan.fees && plan.fees.length > 0 ? (
          <>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: "0.5rem",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#e9ecef" }}>
                  <th
                    style={{
                      border: "1px solid #dee2e6",
                      padding: "0.75rem",
                      textAlign: "left",
                    }}
                  >
                    Type
                  </th>
                  <th
                    style={{
                      border: "1px solid #dee2e6",
                      padding: "0.75rem",
                      textAlign: "right",
                    }}
                  >
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {plan.fees.map((f, i) => (
                  <tr key={i}>
                    <td
                      style={{
                        border: "1px solid #dee2e6",
                        padding: "0.75rem",
                      }}
                    >
                      {f.type || "N/A"}
                    </td>
                    <td
                      style={{
                        border: "1px solid #dee2e6",
                        padding: "0.75rem",
                        textAlign: "right",
                      }}
                    >
                      {formatCurrency(f.amount || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ textAlign: "right", fontWeight: "600" }}>
              Total: {formatCurrency(totalFees)}
            </div>
          </>
        ) : (
          <p style={{ color: "var(--color-dark-grey)", margin: 0 }}>
            No fees
          </p>
        )}
      </div>

      {/* Plan Details Summary Section */}
      <div
        style={{
          backgroundColor: "var(--color-accent-light)",
          padding: "1.5rem",
          borderRadius: "8px",
          marginBottom: "1.5rem",
          border: "2px solid var(--color-accent-dark)",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: "1rem" }}>💰 Summary</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1rem",
            marginBottom: numberOfCategories > 0 ? "1rem" : 0,
          }}
        >
          <div>
            <strong>Total Earnings:</strong> {formatCurrency(totalIncome)}
          </div>
          <div>
            <strong>Total Reimbursements:</strong>{" "}
            {formatCurrency(totalReimbursements)}
          </div>
          <div>
            <strong>Total Fees:</strong> {formatCurrency(totalFees)}
          </div>
          <div>
            <strong>Total Rent Cost:</strong>{" "}
            {formatCurrency(totalRentCost || 0)}
          </div>
          <div>
            <strong>Total Transportation Cost:</strong>{" "}
            {formatCurrency(totalTransportationCost || 0)}
          </div>
          <div>
            <strong>Other Living (Groceries &amp; Utilities):</strong>{" "}
            {formatCurrency(otherLivingExpenses)}
          </div>
          <div style={{ fontWeight: "600", fontSize: "1.1rem" }}>
            <strong>Total Disposable Income:</strong>{" "}
            {formatCurrency(totalDisposableIncome)}
          </div>
        </div>

        {numberOfCategories > 0 && (
          <div
            style={{
              marginTop: "1rem",
              paddingTop: "1rem",
              borderTop: "1px solid var(--color-accent-dark)",
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: "0.5rem" }}>
              Budget Allocation Summary
            </h3>
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
                  <span>
                    {formatCurrency(
                      plan.budgets?.find(
                        (b) => b.category === budget.category
                      )?.amount || 0
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "var(--color-primary-dark)",
            color: "white",
            cursor: "pointer",
            fontSize: "1rem",
            marginRight: "0.5rem",
          }}
        >
          ← Back Home
        </button>
      </div>
    </div>
  );
}

// localStorage helpers
function loadPlansFromStorage() {
  try {
    const raw = localStorage.getItem("sunny_plans");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizePlan);
  } catch {
    return [];
  }
}

function normalizePlan(p = {}) {
  return {
    ...p,
    id: Number(p.id) || Date.now(),
    salary: num(p.salary),
    weeks: num(p.weeks),
    stipends: Array.isArray(p.stipends)
      ? p.stipends.map((x) => ({
          type: (x?.type ?? "").toString(),
          amount: num(x?.amount),
        }))
      : [],
    fees: Array.isArray(p.fees)
      ? p.fees.map((x) => ({
          type: (x?.type ?? "").toString(),
          amount: num(x?.amount),
        }))
      : [],
  };
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function App() {
  const [plans, setPlans] = useState(() => loadPlansFromStorage());

  useEffect(() => {
    localStorage.setItem("sunny_plans", JSON.stringify(plans));
  }, [plans]);

  const addPlan = (newPlan) => {
    const id = Date.now();
    setPlans((prevPlans) => [...prevPlans, { id, ...newPlan }]);
  };

  const deletePlan = (id) => {
    setPlans((prevPlans) => prevPlans.filter((plan) => plan.id !== id));
  };

  return (
    <Router>
      <div className="app-wrapper">
        <Routes>
          <Route
            path="/"
            element={<Home plans={plans} deletePlan={deletePlan} />}
          />
          <Route path="/create" element={<CreatePlanPage addPlan={addPlan} />} />
          <Route
            path="/categories"
            element={
              <SelectBudgetCategoriesPage plans={plans} setPlans={setPlans} />
            }
          />
          <Route
            path="/set-budget"
            element={<SetBudgetPage plans={plans} setPlans={setPlans} />}
          />
          <Route path="/plan/:id" element={<PlanDetails plans={plans} />} />
          <Route
            path="/fees"
            element={<AddFeesPage plans={plans} setPlans={setPlans} />}
          />
          <Route
            path="/compare"
            element={<ComparePlansPage plans={plans} />}
          />
          <Route
            path="/track/:id"
            element={<TrackSavingsPage plans={plans} setPlans={setPlans} />}
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
