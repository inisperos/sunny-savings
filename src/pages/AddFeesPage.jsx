import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import '../App.css'
import StepIndicator from '../components/StepIndicator';

export default function AddFeesPage({ plans, setPlans }) {
  const navigate = useNavigate();
  const locationState = useLocation();
  
  // Get plan ID from location state
  const planId = locationState.state?.planId;
  const currentPlan = planId ? plans.find(p => p.id === planId) : (plans.length > 0 ? plans[plans.length - 1] : null);
  const actualPlanId = planId || (currentPlan?.id);

  // State for stipends and fees - initialize from plan if exists
  const [stipends, setStipends] = useState(currentPlan?.stipends || []);
  const [fees, setFees] = useState(currentPlan?.fees || []);

  // Input fields
  const [stipendType, setStipendType] = useState("");
  const [stipendAmount, setStipendAmount] = useState("");
  const [feeType, setFeeType] = useState("");
  const [feeAmount, setFeeAmount] = useState("");

  // Add new stipend
  const addStipend = () => {
    if (stipendType.trim() === "" || stipendAmount.trim() === "") {
      alert("Please enter both type and amount for the stipend.");
      return;
    }

    const newStipend = {
      type: stipendType,
      amount: parseFloat(stipendAmount),
    };

    setStipends((prev) => [...prev, newStipend]);
    setStipendType("");
    setStipendAmount("");
  };

  // Add new fee
  const addFee = () => {
    if (feeType.trim() === "" || feeAmount.trim() === "") {
      alert("Please enter both type and amount for the fee.");
      return;
    }

    const newFee = {
      type: feeType,
      amount: parseFloat(feeAmount),
    };

    setFees((prev) => [...prev, newFee]);
    setFeeType("");
    setFeeAmount("");
  };

  // Save current data to plan
  const saveCurrentData = () => {
    if (actualPlanId) {
      const updatedPlans = plans.map((plan) =>
        plan.id === actualPlanId
          ? { ...plan, stipends, fees }
          : plan
      );
      setPlans(updatedPlans);
    } else if (plans.length > 0) {
      // Fallback to last plan if no ID
      const updatedPlans = [...plans];
      updatedPlans[updatedPlans.length - 1] = {
        ...updatedPlans[updatedPlans.length - 1],
        stipends,
        fees,
      };
      setPlans(updatedPlans);
    }
  };

  // Auto-save on changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (stipends.length > 0 || fees.length > 0 || actualPlanId) {
        saveCurrentData();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [stipends, fees]);

  // Save data to global plans and navigate
  const handleNext = () => {
    saveCurrentData();
    navigate("/categories", { state: { planId: actualPlanId } });
  };

  // Handle back button - save and go to create page
  const handleBack = () => {
    saveCurrentData();
    navigate("/create", { state: { planId: actualPlanId } });
  };

  const inputStyle = {
    padding: "0.5rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
    width: "200px",
    margin: "0.4rem",
  };

  const boxStyle = {
    border: "2px dashed #bbb",
    borderRadius: "10px",
    padding: "1rem",
    margin: "1rem auto",
    width: "320px",
    textAlign: "center",
  };

  return (
    <div style={{ textAlign: "center", marginTop: "3rem" }}>
      <StepIndicator />
      <h2>Add any offer stipends or lump sums.</h2>

      {/* --- Stipends Section --- */}
      <div style={{ marginTop: "1.5rem" }}>
        <h3>Reimbursements / Stipends</h3>

        <div style={boxStyle}>
          <input
            type="text"
            placeholder="Type (e.g., Housing, Travel)"
            value={stipendType}
            onChange={(e) => setStipendType(e.target.value)}
            style={inputStyle}
          />
          <input
            type="number"
            placeholder="$ Amount"
            value={stipendAmount}
            onChange={(e) => setStipendAmount(e.target.value)}
            style={inputStyle}
          />
          <br />
          <button
            onClick={addStipend}
            style={{
              marginTop: "0.5rem",
              padding: "0.5rem 1rem",
              border: "2px dashed #000",
              borderRadius: "8px",
              background: "none",
              cursor: "pointer",
            }}
          >
            Add +
          </button>
        </div>

        {stipends.length > 0 && (
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {stipends.map((s, i) => (
              <li key={i}>
                <strong>{s.type}</strong>: ${s.amount.toFixed(2)}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* --- Fees Section --- */}
      <div style={{ marginTop: "2rem" }}>
        <h2>Add any one-time fees for this period.</h2>
        <div style={boxStyle}>
          <input
            type="text"
            placeholder="Type (e.g., Relocation, Deposit)"
            value={feeType}
            onChange={(e) => setFeeType(e.target.value)}
            style={inputStyle}
          />
          <input
            type="number"
            placeholder="$ Amount"
            value={feeAmount}
            onChange={(e) => setFeeAmount(e.target.value)}
            style={inputStyle}
          />
          <br />
          <button
            onClick={addFee}
            style={{
              marginTop: "0.5rem",
              padding: "0.5rem 1rem",
              border: "2px dashed #000",
              borderRadius: "8px",
              background: "none",
              cursor: "pointer",
            }}
          >
            Add +
          </button>
        </div>

        {fees.length > 0 && (
          <ul style={{ listStyleType: "none", padding: 0 }}>
            {fees.map((f, i) => (
              <li key={i}>
                <strong>{f.type}</strong>: ${f.amount.toFixed(2)}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Navigation buttons at bottom - Back and Next parallel */}
      <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", marginTop: "2rem" }}>
        <button
          onClick={handleBack}
          style={{
            padding: "0.6rem 1.2rem",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "var(--color-primary-light)",
            color: "white",
            cursor: "pointer",
            fontSize: "0.95rem",
            fontWeight: 500,
          }}
        >
          ← Back (Save)
        </button>
        <button
          onClick={handleNext}
          style={{
            padding: "0.6rem 1.2rem",
            backgroundColor: "var(--color-primary-light)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "0.95rem",
            fontWeight: 500,
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
