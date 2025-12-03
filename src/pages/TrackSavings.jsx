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
        `Congrats! You completed your savings goal for ${category}!`
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
            stroke="#ddd"
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
        style={{ padding: "0.5rem", marginRight: "0.5rem" }}
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
        style={{ padding: "0.5rem", width: "100px", marginRight: "0.5rem" }}
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
        style={{ marginTop: "3rem" }}
      >
        Edit Plan
      </button>

      {/* ✅ BACK BUTTON FIXED */}
      <div style={{ marginTop: "3rem" }}>
      <button
        onClick={() => navigate(`/plan/${plan.id}`)}
        style={{
            marginTop: "3rem",
            backgroundColor: "var(--color-accent-dark)",
            padding: "0.75rem 1.25rem",
            borderRadius: "10px",
            border:"none",
            color:"white",
            cursor: "pointer"
        }}
        >
        ← Back to Plan
        </button>
      </div>
    </div>
  );
}
