// src/App.jsx
import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useParams,
} from "react-router-dom";
import CreatePlanPage from "./pages/CreatePlanPage";

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
              {/* Clicking the plan name navigates to details */}
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
                {plan.name}
              </button>

              {/* Delete button */}
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

// ✅ Plan details view
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

  return (
    <div style={{ textAlign: "center", marginTop: "4rem" }}>
      <h1>{plan.name}</h1>
      <p><strong>Salary:</strong> ${plan.salary}</p>

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
        <Route path="/" element={<Home plans={plans} deletePlan={deletePlan} />} />
        <Route path="/create" element={<CreatePlanPage addPlan={addPlan} />} />
        <Route path="/plan/:id" element={<PlanDetails plans={plans} />} />
      </Routes>
    </Router>
  );
}

export default App;
