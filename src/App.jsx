import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useParams,
} from "react-router-dom";

import CreatePlanPage from "./pages/CreatePlanPage";
import SelectBudgetCategoriesPage from "./pages/SelectCategoriesPage";
import AddFeesPage from "./pages/AddFeesPage";
import SetBudgetPage from "./pages/SetBudgetPage";
import ComparePlansPage from "./pages/ComparePlansPage";





// 🏠 Home Page
function Home({ plans, deletePlan }) {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "4rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>Sunny Savings ☀️</h1>
      <p>Welcome to your budgeting dashboard!</p>

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
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                marginBottom: "0.5rem",
              }}
            >
              <button
                onClick={() => navigate(`/plan/${plan.id}`)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#007bff",
                  cursor: "pointer",
                  fontSize: "1.1rem",
                  textDecoration: "underline",
                }}
              >
                {plan.company}
              </button>

              <button
                onClick={() => deletePlan(plan.id)}
                style={{
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  padding: "0.3rem 0.6rem",
                  cursor: "pointer",
                  fontSize: "0.9rem",
                }}
              >
                Delete
              </button>
            </div>
          ))
        )}

        <button
          onClick={() => navigate("/create")}
          style={{
            marginTop: "2rem",
            padding: "0.75rem 1.25rem",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#007bff",
            color: "white",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          Create New Plan
        </button>
        <button
          onClick={() => navigate("/compare")}
          disabled={plans.length < 2}
          title={
            plans.length < 2
              ? "Create at least 2 plans to compare"
              : "Compare two plans"
          }
          style={{
            marginTop: "0.75rem",
            padding: "0.75rem 1.25rem",
            borderRadius: "8px",
            border: "none",
            backgroundColor: plans.length < 2 ? "#9ca3af" : "#007bff",
            color: "white",
            cursor: plans.length < 2 ? "not-allowed" : "pointer",
            fontSize: "1rem",
          }}
        >
          Compare Plans
        </button>
      </div>
    </div>
  );
}

// 📊 Plan Details Page
// 📊 Plan Details Page
function PlanDetails({ plans }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const plan = plans.find((p) => p.id === parseInt(id));

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
            backgroundColor: "#6c757d",
            color: "white",
            cursor: "pointer",
          }}
        >
          Back Home
        </button>
      </div>
    );
  }

  // Calculate totals with proper salary frequency conversion
  let salaryPerWeek = 0;
  
  // Validate and convert to weekly based on frequency
  if (plan.salary && plan.weeks && plan.salary > 0 && plan.weeks > 0) {
    if (plan.salaryFrequency === "hourly") {
      // Use hoursPerDay if available, otherwise default to 8 hours/day (40 hours/week)
      const hoursPerDay = plan.hoursPerDay || 8;
      const hoursPerWeek = hoursPerDay * 5; // Assuming 5 working days per week
      salaryPerWeek = plan.salary * hoursPerWeek;
    } else if (plan.salaryFrequency === "weekly") {
      salaryPerWeek = plan.salary;
    } else if (plan.salaryFrequency === "biweekly") {
      salaryPerWeek = plan.salary / 2;
    } else if (plan.salaryFrequency === "monthly") {
      salaryPerWeek = plan.salary / 4;
    } else if (plan.salaryFrequency === "annually") {
      salaryPerWeek = plan.salary / 52;
    }
  }
  
  const salaryTotal = salaryPerWeek * (plan.weeks || 0);

  const totalReimbursements = plan.stipends && Array.isArray(plan.stipends)
    ? plan.stipends.reduce((sum, s) => {
        const amount = s && typeof s === 'object' ? (s.amount || 0) : 0;
        return sum + (isNaN(amount) || amount < 0 ? 0 : amount);
      }, 0)
    : 0;

  const totalFees = plan.fees && Array.isArray(plan.fees)
    ? plan.fees.reduce((sum, f) => {
        const amount = f && typeof f === 'object' ? (f.amount || 0) : 0;
        return sum + (isNaN(amount) || amount < 0 ? 0 : amount);
      }, 0)
    : 0;

  const totalDisposableIncome = salaryTotal + totalReimbursements - totalFees;

  const numGoals = plan.goals ? plan.goals.length : 0;
  const suggestedPerGoal =
    numGoals > 0 ? (totalDisposableIncome * 0.2) / numGoals : 0;

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

  return (
    <div style={{ maxWidth: "900px", margin: "2rem auto", padding: "0 1rem" }}>
      <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>
        {plan.company || "Plan Details"}
      </h1>

      {/* Offer Details Section */}
      <div
        style={{
          backgroundColor: "#f8f9fa",
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
          {plan.salaryFrequency === "hourly" && plan.hoursPerDay && (
            <div>
              <strong>Hours per Day:</strong> {plan.hoursPerDay}
            </div>
          )}
          <div>
            <strong>Number of Weeks:</strong> {plan.weeks || 0}
          </div>
          <div>
            <strong>Total Earnings:</strong> {formatCurrency(salaryTotal)}
          </div>
        </div>
      </div>

      {/* Location Info Section */}
      <div
        style={{
          backgroundColor: "#f8f9fa",
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
            <strong>Transportation:</strong> {formatCurrency(plan.transportation || 0)} (
            {plan.transportFrequency || "monthly"})
          </div>
        </div>
      </div>

      {/* Savings Goals Section */}
      {plan.goals && plan.goals.length > 0 && (
        <div
          style={{
            backgroundColor: "#f8f9fa",
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
                  backgroundColor: "#e7f3ff",
                  borderRadius: "20px",
                  padding: "0.4rem 1rem",
                  fontSize: "0.95rem",
                  border: "1px solid #007bff",
                  color: "#007bff",
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
          backgroundColor: "#f8f9fa",
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
          <p style={{ color: "#6c757d", margin: 0 }}>No reimbursements / stipends</p>
        )}
      </div>

      {/* Fees Section */}
      <div
        style={{
          backgroundColor: "#f8f9fa",
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
          <p style={{ color: "#6c757d", margin: 0 }}>No fees</p>
        )}
      </div>

      {/* Summary Section */}
      <div
        style={{
          backgroundColor: "#e7f3ff",
          padding: "1.5rem",
          borderRadius: "8px",
          marginBottom: "1.5rem",
          border: "2px solid #007bff",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: "1rem" }}>💰 Summary</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1rem",
            marginBottom: numGoals > 0 ? "1rem" : 0,
          }}
        >
          <div>
            <strong>Total Earnings:</strong> {formatCurrency(salaryTotal)}
          </div>
          <div>
            <strong>Total Reimbursements:</strong>{" "}
            {formatCurrency(totalReimbursements)}
          </div>
          <div>
            <strong>Total Fees:</strong> {formatCurrency(totalFees)}
          </div>
          <div style={{ fontWeight: "600", fontSize: "1.1rem" }}>
            <strong>Total Disposable Income:</strong>{" "}
            {formatCurrency(totalDisposableIncome)}
          </div>
        </div>

        {numGoals > 0 && (
          <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #007bff" }}>
            <h3 style={{ marginTop: 0, marginBottom: "0.5rem" }}>
              Suggested Savings Goals (20% of disposable income)
            </h3>
            <ul
              style={{
                listStyleType: "none",
                padding: 0,
                margin: 0,
              }}
            >
              {plan.goals.map((goal, index) => (
                <li
                  key={index}
                  style={{
                    padding: "0.25rem 0",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <span>
                    <strong>{goal}:</strong>
                  </span>
                  <span>{formatCurrency(suggestedPerGoal)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#6c757d",
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


// 🌞 Main App Component


//  localStorage  plans
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
      ? p.stipends.map(x => ({ type: (x?.type ?? "").toString(), amount: num(x?.amount) }))
      : [],
    fees: Array.isArray(p.fees)
      ? p.fees.map(x => ({ type: (x?.type ?? "").toString(), amount: num(x?.amount) }))
      : [],
  };
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

// === REVERT: function App (no localStorage / no useEffect) ===
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
      <Routes>
        <Route
          path="/"
          element={<Home plans={plans} deletePlan={deletePlan} />}
        />
        <Route
          path="/create"
          element={<CreatePlanPage addPlan={addPlan} />}
        />
        <Route
          path="/categories"
          element={<SelectBudgetCategoriesPage plans={plans} setPlans={setPlans} />}
        />
        <Route
          path="/set-budget"
          element={<SetBudgetPage plans={plans} setPlans={setPlans} />}
        />
        <Route
          path="/plan/:id"
          element={<PlanDetails plans={plans} />}
        />
        <Route
          path="/fees"
          element={<AddFeesPage plans={plans} setPlans={setPlans} />}
        />
        <Route
          path="/compare"
          element={<ComparePlansPage plans={plans} />}
        />
      </Routes>
    </Router>
  );
}


export default App;
