import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useParams,
} from "react-router-dom";

import CreatePlanPage from "./pages/CreatePlanPage";
import AddSavingsGoals from "./pages/AddGoalsPage";
import AddFeesPage from "./pages/AddFeesPage";


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

  // 🧮 Calculate totals
  const salaryTotal = plan.salary * plan.weeks || 0;

  const totalReimbursements = plan.stipends
    ? plan.stipends.reduce((sum, s) => sum + (s.amount || 0), 0)
    : 0;

  const totalFees = plan.fees
    ? plan.fees.reduce((sum, f) => sum + (f.amount || 0), 0)
    : 0;

  const totalDisposableIncome = salaryTotal + totalReimbursements - totalFees;

  const numGoals = plan.goals ? plan.goals.length : 0;
  const suggestedPerGoal =
    numGoals > 0 ? (totalDisposableIncome * 0.2) / numGoals : 0;

  return (
    <div style={{ textAlign: "center", marginTop: "3rem" }}>
      <h1>{plan.company}</h1>

      {/* --- Offer Details --- */}
      <h3>Offer Details</h3>
      <p>
        <strong>Salary:</strong> ${plan.salary} ({plan.salaryFrequency})
      </p>
      <p>
        <strong>Number of Weeks:</strong> {plan.weeks}
      </p>

      {/* --- Location Info --- */}
      <h3>Location Info</h3>
      <p>
        <strong>Location:</strong> {plan.location}
      </p>
      <p>
        <strong>Rent:</strong> ${plan.rent} ({plan.rentFrequency})
      </p>
      <p>
        <strong>Transportation Cost:</strong> ${plan.transportation} (
        {plan.transportFrequency})
      </p>

      {/* --- Savings Goals --- */}
      {plan.goals && plan.goals.length > 0 && (
        <>
          <h3>Savings Goals</h3>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "0.5rem",
              marginTop: "1rem",
            }}
          >
            {plan.goals.map((goal, index) => (
              <span
                key={index}
                style={{
                  backgroundColor: "#f1f3f4",
                  borderRadius: "20px",
                  padding: "0.4rem 1rem",
                  fontSize: "0.95rem",
                  border: "1px solid #ccc",
                }}
              >
                {goal}
              </span>
            ))}
          </div>
        </>
      )}

      {/* --- Reimbursements / Stipends --- */}
      {plan.stipends && plan.stipends.length > 0 && (
        <>
          <h3 style={{ marginTop: "2rem" }}>Reimbursements / Stipends</h3>
          <table
            style={{
              margin: "1rem auto",
              borderCollapse: "collapse",
              width: "60%",
              minWidth: "300px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                  Type
                </th>
                <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {plan.stipends.map((s, i) => (
                <tr key={i}>
                  <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                    {s.type}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                    ${s.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* --- Fees --- */}
      {plan.fees && plan.fees.length > 0 && (
        <>
          <h3 style={{ marginTop: "2rem" }}>Fees</h3>
          <table
            style={{
              margin: "1rem auto",
              borderCollapse: "collapse",
              width: "60%",
              minWidth: "300px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa" }}>
                <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                  Type
                </th>
                <th style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {plan.fees.map((f, i) => (
                <tr key={i}>
                  <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                    {f.type}
                  </td>
                  <td style={{ border: "1px solid #ccc", padding: "0.5rem" }}>
                    ${f.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* --- Summary Calculations --- */}
      <div style={{ marginTop: "2.5rem" }}>
        <h3>💰 Summary</h3>
        <p>
          <strong>Total Disposable Income:</strong> $
          {totalDisposableIncome.toFixed(2)}
        </p>

        {numGoals > 0 && (
          <>
            <h4>Suggested Savings Goals (20% of disposable income):</h4>
            <ul
              style={{
                listStyleType: "none",
                padding: 0,
                display: "inline-block",
                textAlign: "left",
              }}
            >
              {plan.goals.map((goal, index) => (
                <li key={index}>
                  <strong>{goal}:</strong> ${suggestedPerGoal.toFixed(2)}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      {/* --- Back Button --- */}
      <button
        onClick={() => navigate("/")}
        style={{
          marginTop: "2rem",
          padding: "0.6rem 1.2rem",
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


// 🌞 Main App Component
function App() {
  const [plans, setPlans] = useState([]);

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
        <Route path="/create" element={<CreatePlanPage addPlan={addPlan} />} />
        <Route
          path="/goals"
          element={<AddSavingsGoals plans={plans} setPlans={setPlans} />}
        />
        <Route path="/plan/:id" element={<PlanDetails plans={plans} />} />
        <Route path="/fees" element={<AddFeesPage plans={plans} setPlans={setPlans} />} />

      </Routes>
    </Router>
  );
}

export default App;
