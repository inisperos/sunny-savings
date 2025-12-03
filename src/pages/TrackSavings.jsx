import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { calculatePlanDetails } from "../utils/planDetails";

export default function TrackSavingsPage({ plans, setPlans }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const plan = plans.find((p) => p.id === parseInt(id));
  if (!plan) return <p>Plan not found</p>;

  // ✅ category + amount inputs for adding savings
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");

  // ✅ popup
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  // ✅ savings normalization
  const savings = { ...plan.savings };
  plan.budgets?.forEach((b) => {
    if (savings[b.category] === undefined) savings[b.category] = 0;
  });

  // ============================
  // ✅ EDIT PLAN COLLAPSIBLE LOGIC
  // ============================
  const [showEdit, setShowEdit] = useState(false);
  const [editAmounts, setEditAmounts] = useState({});
  const [newCategory, setNewCategory] = useState("");
  const [showAddCategory, setShowAddCategory] = useState(false);

  // ✅ disposable income + weekly logic (same as SetBudgetPage)
  const { totalDisposableIncome } = calculatePlanDetails(plan);
  const weeks = plan.weeks || 4;
  const timeframe = plan.budgetTimeframeInWeeks || 4;

  const initialBudgetAvailable =
    (totalDisposableIncome / weeks) * timeframe || 0;

  useEffect(() => {
    const initial = {};
    plan.budgets?.forEach((b) => {
      initial[b.category] = b.amount;
    });
    setEditAmounts(initial);
  }, [plan]);

  const totalAllocated = Object.values(editAmounts).reduce(
    (sum, val) => sum + (parseFloat(val) || 0),
    0
  );

  const budgetRemaining = initialBudgetAvailable - totalAllocated;
  const isOverBudget = budgetRemaining < 0;

  const handleEditAmountChange = (category, value) => {
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setEditAmounts((prev) => ({
        ...prev,
        [category]: value,
      }));
    }
  };

  const handleSaveEdit = () => {
    const updatedPlans = plans.map((p) =>
      p.id === plan.id
        ? {
            ...p,
            budgets: Object.keys(editAmounts).map((c) => ({
              category: c,
              amount: parseFloat(editAmounts[c]) || 0,
            })),
          }
        : p
    );

    setPlans(updatedPlans);
    setShowEdit(false);
  };

  const handleAddNewCategory = () => {
    if (!newCategory.trim()) return;

    setEditAmounts((prev) => ({
      ...prev,
      [newCategory]: "",
    }));

    setNewCategory("");
    setShowAddCategory(false);
  };

  // =========================
  // ✅ HANDLE ADD SAVINGS
  // =========================
  const handleAdd = () => {
    if (!category || !amount) return;

    const newSaved = savings[category] + Number(amount);
    const goal =
      plan.budgets?.find((b) => b.category === category)?.amount || 0;

    if (newSaved >= goal && goal > 0) {
      setPopupMessage(
        `Congratulations! You completed your savings goal for ${category}!`
      );
    } else {
      setPopupMessage(
        `Added $${amount} to ${category}. Keep up the great saving!`
      );
    }

    setShowPopup(true);

    const updatedPlans = plans.map((p) =>
      p.id === plan.id
        ? {
            ...p,
            savings: {
              ...savings,
              [category]: newSaved,
            },
          }
        : p
    );

    setPlans(updatedPlans);
    setAmount("");
  };

  // ✅ donut renderer
  const renderDonut = (label, saved, goal) => {
    const percent = goal > 0 ? Math.min(saved / goal, 1) : 0;
    const size = 140;
    const radius = 55;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - percent * circumference;

    return (
      <div key={label} style={{ textAlign: "center" }}>
        <svg width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--color-dark-grey)"
            strokeWidth="20"
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#1e3a8a"
            strokeWidth="20"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>

        <p style={{ fontWeight: 600, margin: "0.25rem 0" }}>{label}</p>
        <p style={{ margin: 0 }}>Goal: ${goal}</p>
        <p style={{ margin: 0 }}>Saved: ${saved}</p>
      </div>
    );
  };

  return (
    <div style={{ textAlign: "center", marginTop: "3rem" }}>
      <h1>{plan.company} Savings</h1>

      {/* ✅ ADD SAVINGS UI */}
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        style={{ 
          padding: "0.5rem", 
          marginRight: "0.5rem", 
          backgroundColor: "#fff",
          color: "var(--color-dark-text)",
          border: "1px solid var(--color-dark-text)"
        }}
      >
        <option value="">Select Category</option>
        {plan.budgets?.map((b, i) => (
          <option key={i} value={b.category}>
            {b.category}
          </option>
        ))}
      </select>

      <input
        type="number"
        placeholder="$"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        style={{
          padding: "0.5rem", 
          marginRight: "0.5rem", 
          backgroundColor: "#fff",
          color: "var(--color-dark-text)",
          border: "1px solid var(--color-dark-text)"
        }}
      />

      <button
        onClick={handleAdd}
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "var(--color-accent-dark)",
          color: "white",
          border: "none",
          borderRadius: "8px",
        }}
      >
        Add
      </button>

      {/* ✅ DONUTS */}
      <div
        style={{
          display: "flex",
          gap: "2rem",
          justifyContent: "center",
          flexWrap: "wrap",
          marginTop: "3rem",
        }}
      >
        {plan.budgets?.map((b) =>
          renderDonut(b.category, savings[b.category] || 0, b.amount || 0)
        )}
      </div>

      {/* EDIT PLAN */}
      <button
        onClick={() => navigate("/set-budget", { state: { planId: plan.id } })}
        className="btn btn-edit"
        style={{ marginTop: "3rem", padding: "0.5rem 1rem" }}
      >
        Edit Plan
      </button>

      {showEdit && (
        <div style={{ marginTop: "2rem" }}>
          <h2>Edit your Plan</h2>

          <h3
            style={{
              color: isOverBudget ? "var(--color-accent-dark)" : "var(--color-light-text)",
            }}
          >
            {isOverBudget
              ? `You are over budget by $${Math.abs(
                  budgetRemaining
                ).toFixed(2)}`
              : `You have $${budgetRemaining.toFixed(
                  2
                )} left to allocate`}
          </h3>

          {Object.keys(editAmounts).map((c) => (
            <div
              key={c}
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "1rem",
                margin: "0.75rem auto",
              }}
            >
              <div
                style={{
                  padding: "1rem",
                  border: "2px solid #000",
                  borderRadius: "12px",
                  width: "200px",
                }}
              >
                {c}
              </div>

              <input
                type="number"
                value={editAmounts[c]}
                onChange={(e) => handleEditAmountChange(c, e.target.value)}
                style={{
                  width: "200px",
                  padding: "1rem",
                  borderRadius: "12px",
                  border: "2px solid #ccc",
                }}
              />
            </div>
          ))}

          {!showAddCategory ? (
            <button
              onClick={() => setShowAddCategory(true)}
              style={{
                marginTop: "1rem",
                padding: "1rem",
                border: "3px dashed #000",
                borderRadius: "12px",
                cursor: "pointer",
              }}
            >
              Add New Category +
            </button>
          ) : (
            <div style={{ marginTop: "1rem" }}>
              <input
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New category"
                style={{
                  padding: "0.75rem",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                }}
              />
              <button onClick={handleAddNewCategory}>Add</button>
              <button onClick={() => setShowAddCategory(false)}>
                Cancel
              </button>
            </div>
          )}

          <div style={{ marginTop: "2rem" }}>
            <button onClick={() => setShowEdit(false)}>Cancel</button>
            <button onClick={handleSaveEdit}>Save</button>
          </div>
        </div>
      )}

      {/* ✅ popup */}
      {showPopup && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "white",
              padding: "2rem",
              borderRadius: "12px",
              width: "320px",
              textAlign: "center",
            }}
          >
            <p style={{ fontSize: "1.2rem" }}>{popupMessage}</p>
            <button
              onClick={() => setShowPopup(false)}
              style={{
                marginTop: "1rem",
                backgroundColor: "#1e3a8a",
                color: "white",
                padding: "0.75rem 1.25rem",
                borderRadius: "8px",
                border: "none",
              }}
            >
              Thanks!
            </button>
          </div>
        </div>
      )}

      {/* ✅ BACK BUTTON FIXED */}
      <div style={{ marginTop: "3rem" }}>
      <button
        onClick={() => navigate(`/plan/${plan.id}`)}
        style={{
            marginTop: "3rem",
            backgroundColor: "var(--color-primary-light)",
            padding: "0.75rem 1.25rem",
            borderRadius: "10px",
            border:"none",
            color:"white",
            cursor: "pointer"
        }}
        >
        Back to Plan
        </button>
      </div>
    </div>
  );
}
