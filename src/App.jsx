import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useParams,
} from "react-router-dom";
import './App.css'
import { getPlanStatus } from "./utils/planDetails";
import OfferCalculationSection from "./components/OfferCalculationSection";
import BudgetCreationSection from "./components/BudgetCreationSection";

import CreatePlanPage from "./pages/CreatePlanPage";
import SelectBudgetCategoriesPage from "./pages/SelectCategoriesPage";
import AddFeesPage from "./pages/AddFeesPage";
import SetBudgetPage from "./pages/SetBudgetPage";
import ComparePlansPage from "./pages/ComparePlansPage";
import TrackSavingsPage from "./pages/TrackSavings";





// 🏠 Home Page
function Home({ plans, deletePlan }) {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "2rem" }}>
    <h1 style={{ fontSize: "2.2rem" }}>Sunny Savings</h1>
    <p style={{ color: "var(--color-dark-text)", marginTop: "0.5rem" }}>
      Welcome to your budgeting dashboard!
    </p>

      <div className="plans-container">
        <h2>Your Plans</h2>

        {plans.length === 0 ? (
          <p>No plans created yet.</p>
        ) : (
          plans.map((plan) => (
            <div
              key={plan.id}
              className="plan-card"
              onMouseEnter={(e) => {
                e.currentTarget.classList.add("plan-card-hover");
              }}
              onMouseLeave={(e) => {
                e.currentTarget.classList.remove("plan-card-hover");
              }}
            >
              {/* Plan title and status */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.6rem" }}>
                <h2 className="plan-title">
                  {plan.company || "Untitled Plan"}
                </h2>
                {(() => {
                  const planStatus = getPlanStatus(plan);
                  return (
                    <span className={"plan-status"} >
                      {planStatus.label}
                    </span>
                  );
                })()}
              </div>

              {/* ✅ Sleek horizontal button row */}
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
                  className="btn btn-view"
                >
                  View
                </button>

                <button
                  onClick={() => navigate(`/track/${plan.id}`)}
                  className="btn btn-track"
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
                  className="btn btn-delete"
                >
                  Delete
                </button>
              </div>
            </div>

          ))
        )}

        <div className="actions-container">
          <button
            onClick={() => navigate("/create")}
            className="btn btn-create"
          >
            Create New Plan
          </button>

          <button
            onClick={() => navigate("/compare")}
            disabled={plans.length < 2}
            className={`btn btn-compare ${plans.length < 2 ? "btn-disabled" : ""}`}
          >
            Compare Plans
          </button>
        </div>

      </div>
    </div>
  );
}

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

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

  return (
    <div style={{ maxWidth: "900px", margin: "2rem auto", padding: "0 1rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1 style={{ margin: 0 }}>
          {plan.company || "Plan Details"}
        </h1>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button
            onClick={() => navigate("/create", { state: { planId: plan.id } })}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "var(--color-accent-dark)",
              color: "white",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            Edit Plan
          </button>
        </div>
      </div>

      {/* Offer Calculation Section - Clearly Separated */}
      <div
        style={{
          marginBottom: "2.5rem",
          paddingBottom: "2rem",
        }}
      >
        <h2>
          Offer Overview
        </h2>
        <OfferCalculationSection plan={plan} formatCurrency={formatCurrency} />
      </div>

      {/* Budget Creation Section*/}
      <div>
        <h2> Budget & Savings </h2>
        <BudgetCreationSection plan={plan} formatCurrency={formatCurrency} navigate={navigate} />
      </div>

        {/* Navigation Buttons */}
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "var(--color-primary-light)",
            color: "white",
            cursor: "pointer",
            fontSize: "1rem",
            marginRight: "0.5rem",
          }}
        >
          Back Home
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

  const updatePlan = (id, updatedData) => {
    setPlans((prevPlans) =>
      prevPlans.map((plan) =>
        plan.id === id ? { ...plan, ...updatedData } : plan
      )
    );
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
        <Route
          path="/create"
          element={<CreatePlanPage addPlan={addPlan} plans={plans} updatePlan={updatePlan} />}
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
