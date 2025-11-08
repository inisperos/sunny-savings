import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AddFeesPage({ plans, setPlans }) {
  const navigate = useNavigate();

  // State for stipends and fees
  const [stipends, setStipends] = useState([]);
  const [fees, setFees] = useState([]);

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

  // Save data to global plans
  const handleNext = () => {
    if (plans.length > 0) {
      const updatedPlans = [...plans];
      updatedPlans[updatedPlans.length - 1] = {
        ...updatedPlans[updatedPlans.length - 1],
        stipends,
        fees,
      };
      setPlans(updatedPlans);
    }

    navigate("/categories");
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

      {/* Navigation */}
      <button
        onClick={handleNext}
        style={{
          marginTop: "2rem",
          padding: "0.6rem 1.2rem",
          backgroundColor: "#28a745ff",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Next
      </button>
    </div>
  );
}
