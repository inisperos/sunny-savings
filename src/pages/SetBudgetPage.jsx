import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function BudgetCard({ category, value, onChange }) {
  const cardStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    maxWidth: "760px",
    margin: "0.75rem auto",
  };

  const leftStyle = {
    flex: 1,
    padding: "1rem",
    border: "2px solid #000",
    borderRadius: "12px",
    marginRight: "1rem",
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
    </div>
  );
}

export default function SetBudgetPage({ plans, setPlans }) {
  const navigate = useNavigate();

  // derive categories from last plan
  const categories =
    plans && plans.length > 0 ? plans[plans.length - 1].categories || [] : [];

  // local state for amounts keyed by category name
  const [amounts, setAmounts] = useState({});
  const [showAdd, setShowAdd] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    // initialize amounts for categories that don't yet have a value
    const initial = {};
    categories.forEach((c) => {
      initial[c] = amounts[c] !== undefined ? amounts[c] : "";
    });
    setAmounts((prev) => ({ ...initial, ...prev }));
  }, [categories, amounts]);

  const handleAmountChange = (category, value) => {
    // allow only numeric input (empty or number)
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmounts((prev) => ({ ...prev, [category]: value }));
    }
  };

  const handleAddCategory = () => {
    if (newCategory.trim() === "") {
      alert("Category name cannot be empty");
      return;
    }

    // update plans with new category appended
    if (plans.length > 0) {
      const updatedPlans = [...plans];
      const last = { ...updatedPlans[updatedPlans.length - 1] };
      const existing = Array.isArray(last.categories) ? last.categories : [];
      if (!existing.includes(newCategory)) {
        last.categories = [...existing, newCategory];
        updatedPlans[updatedPlans.length - 1] = last;
        setPlans(updatedPlans);
      }
    }

    // initialize amount for it locally
    setAmounts((prev) => ({ ...prev, [newCategory]: "" }));
    setNewCategory("");
    setShowAdd(false);
  };

  const handleNext = () => {
    const updatedPlans = [...plans];

    if (plans.length > 0) {
      updatedPlans[updatedPlans.length - 1] = {
        ...updatedPlans[updatedPlans.length - 1],
        budgets: Object.keys(amounts).map((c) => ({
          category: c,
          amount: amounts[c] === "" ? 0 : parseFloat(amounts[c]),
        })),
      };
      setPlans(updatedPlans);
    }

    navigate("/");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
      <h1 style={{ fontWeight: 700 }}>Add your savings goals.</h1>
      <h2 style={{ marginTop: "0.25rem" }}>How much do you want to save?</h2>
      <p style={{ color: "#555" }}>
        It is recommended that your savings make up 20% of your disposable
        income.
      </p>

      {categories.length === 0 ? (
        <div style={{ marginTop: "2rem" }}>
          <p>No categories selected yet.</p>
          <button
            onClick={() => navigate("/categories")}
            style={{
              padding: "0.6rem 1rem",
              border: "2px dashed #000",
              borderRadius: "8px",
              background: "none",
              cursor: "pointer",
            }}
          >
            Select Categories
          </button>
        </div>
      ) : (
        <div style={{ marginTop: "1.5rem" }}>
          {categories.map((c) => (
            <BudgetCard
              key={c}
              category={c}
              value={amounts[c] || ""}
              onChange={handleAmountChange}
            />
          ))}

          {/* Add new category dashed button */}
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
                }}
              >
                Add New Category +
              </button>
            ) : (
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "center",
                }}
              >
                <input
                  type="text"
                  placeholder="New category name"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                  }}
                />
                <button
                  onClick={handleAddCategory}
                  style={{ padding: "0.6rem 0.9rem", cursor: "pointer" }}
                >
                  Add
                </button>
                <button
                  onClick={() => setShowAdd(false)}
                  style={{ padding: "0.6rem 0.9rem", cursor: "pointer" }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Finish button */}
          {
            <div
              style={{
                maxWidth: "760px",
                margin: "2rem auto",
                textAlign: "right",
              }}
            >
              <button
                onClick={handleNext}
                style={{
                  padding: "0.75rem 1.25rem",
                  borderRadius: "12px",
                  border: "none",
                  background: "#007bffff",
                  cursor: "pointer",
                  fontSize: "1rem",
                }}
              >
                Finish
              </button>
            </div>
          }
        </div>
      )}
    </div>
  );
}

