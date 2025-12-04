// src/pages/CreatePlanPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../App.css";
import StepIndicator from "../components/StepIndicator";

export default function CreatePlanPage({ addPlan, plans, updatePlan }) {
  const navigate = useNavigate();
  const locationState = useLocation();

  // If we are editing an existing plan, we get its id from location state
  const editingPlanId = locationState.state?.planId;
  const editingPlan = editingPlanId
    ? plans.find((p) => p.id === editingPlanId)
    : null;

  // Offer details - initialize from editing plan if exists
  const [company, setCompany] = useState(editingPlan?.company || "");
  const [salary, setSalary] = useState(
    editingPlan?.salary != null ? editingPlan.salary.toString() : ""
  );
  const [salaryFrequency, setSalaryFrequency] = useState(
    editingPlan?.salaryFrequency || "annually"
  );
  const [weeks, setWeeks] = useState(
    editingPlan?.weeks != null ? editingPlan.weeks.toString() : ""
  );
  const [hoursPerWeek, setHoursPerWeek] = useState(
    editingPlan?.hoursPerWeek != null
      ? editingPlan.hoursPerWeek.toString()
      : "40"
  );

  // Location info
  const [location, setLocation] = useState(editingPlan?.location || "");
  const [rent, setRent] = useState(
    editingPlan?.rent != null ? editingPlan.rent.toString() : ""
  );
  const [rentFrequency, setRentFrequency] = useState(
    editingPlan?.rentFrequency || "monthly"
  );
  const [transportation, setTransportation] = useState(
    editingPlan?.transportation != null
      ? editingPlan.transportation.toString()
      : ""
  );
  const [transportFrequency, setTransportFrequency] = useState(
    editingPlan?.transportFrequency || "monthly"
  );

  // 🆕 Extra living expenses: Groceries & Utilities
  const [groceries, setGroceries] = useState(
    editingPlan?.groceries != null ? editingPlan.groceries.toString() : ""
  );
  const [groceriesFrequency, setGroceriesFrequency] = useState(
    editingPlan?.groceriesFrequency || "monthly"
  );
  const [utilities, setUtilities] = useState(
    editingPlan?.utilities != null ? editingPlan.utilities.toString() : ""
  );
  const [utilitiesFrequency, setUtilitiesFrequency] = useState(
    editingPlan?.utilitiesFrequency || "monthly"
  );

  // Track if we already created a plan object (for auto-save / edit mode)
  const [currentPlanId, setCurrentPlanId] = useState(editingPlanId || null);

  // State for stipends and fees - initialize from editing plan if exists
  const [stipends, setStipends] = useState(editingPlan?.stipends || []);
  const [fees, setFees] = useState(editingPlan?.fees || []);

  // Input fields for stipends and fees
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

  // Save current form data (even if incomplete) to plan
  const saveCurrentData = () => {
    const planData = {
      company: company.trim() || "",
      salary: parseFloat(salary) || 0,
      salaryFrequency,
      weeks: parseInt(weeks) || 0,
      location: location.trim() || "",
      rent: parseFloat(rent) || 0,
      rentFrequency,
      transportation: parseFloat(transportation) || 0,
      transportFrequency,
      stipends,
      fees,
      ...(salaryFrequency === "hourly" && {
        hoursPerWeek: parseFloat(hoursPerWeek) || 40,
      }),
      groceries: parseFloat(groceries) || 0,
      groceriesFrequency,
      utilities: parseFloat(utilities) || 0,
      utilitiesFrequency,
    };

    if (salaryFrequency === "hourly") {
      base.hoursPerWeek = parseFloat(hoursPerWeek) || 40;
    }

    return { ...base, ...overrides };
  };

  /**
   * Save current form data to plans.
   * - If currentPlanId exists → update that plan
   * - Else if company not empty → create a new plan and return its id
   * Returns: id of the plan that was saved/updated (or null if nothing saved)
   */
  const saveCurrentData = () => {
    const planData = buildPlanData();

    // No meaningful data, don't create anything
    const hasAnyInput =
      company.trim() ||
      salary ||
      weeks ||
      location.trim() ||
      rent ||
      transportation ||
      groceries ||
      utilities;

    if (!currentPlanId && !hasAnyInput) {
      return null;
    }

    if (currentPlanId) {
      updatePlan(currentPlanId, planData);
      return currentPlanId;
    } else {
      // Create a brand-new plan
      const id = Date.now();
      setCurrentPlanId(id);
      addPlan({ id, ...planData });
      return id;
    }
  };

  // Auto-save when user is typing (debounced 1s)
  useEffect(() => {
    const timer = setTimeout(() => {
      saveCurrentData();
    }, 1000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    company,
    salary,
    salaryFrequency,
    weeks,
    hoursPerWeek,
    location,
    rent,
    rentFrequency,
    transportation,
    transportFrequency,
    groceries,
    groceriesFrequency,
    utilities,
    utilitiesFrequency,
  ]);

  // Validate + go to Fees page
  const handleNext = (e) => {
    e.preventDefault();

    if (
      company.trim() === "" ||
      salary.trim() === "" ||
      weeks.trim() === "" ||
      location.trim() === "" ||
      rent.trim() === "" ||
      transportation.trim() === "" ||
      groceries.trim() === "" || // U & G required
      utilities.trim() === ""
    ) {
      alert("Please fill out all required fields.");
      return;
    }

    const salaryValue = parseFloat(salary);
    if (isNaN(salaryValue) || salaryValue <= 0) {
      alert("Please enter a valid positive salary amount.");
      return;
    }

    const weeksValue = parseInt(weeks);
    if (isNaN(weeksValue) || weeksValue <= 0 || !Number.isInteger(weeksValue)) {
      alert("Please enter a valid positive number of weeks (whole number).");
      return;
    }

    let hoursPerWeekValue;
    if (salaryFrequency === "hourly") {
      hoursPerWeekValue = parseFloat(hoursPerWeek);
      if (
        isNaN(hoursPerWeekValue) ||
        hoursPerWeekValue <= 0 ||
        hoursPerWeekValue > 168
      ) {
        alert(
          "Please enter valid hours per week (between 1 and 168) for hourly salary."
        );
        return;
      }
    }

    const rentValue = parseFloat(rent);
    if (isNaN(rentValue) || rentValue < 0) {
      alert("Please enter a valid rent amount (0 or positive).");
      return;
    }

    const transportationValue = parseFloat(transportation);
    if (isNaN(transportationValue) || transportationValue < 0) {
      alert("Please enter a valid transportation cost (0 or positive).");
      return;
    }

    const groceriesValue = parseFloat(groceries);
    if (isNaN(groceriesValue) || groceriesValue < 0) {
      alert("Please enter a valid groceries cost (0 or positive).");
      return;
    }

    const utilitiesValue = parseFloat(utilities);
    if (isNaN(utilitiesValue) || utilitiesValue < 0) {
      alert("Please enter a valid utilities cost (0 or positive).");
      return;
    }

    // Build a cleaned version with validated numbers
    const validatedPlan = buildPlanData({
      salary: salaryValue,
      weeks: weeksValue,
      rent: rentValue,
      transportation: transportationValue,
      groceries: groceriesValue,
      utilities: utilitiesValue,
      ...(salaryFrequency === "hourly" && {
        hoursPerWeek: hoursPerWeekValue,
      }),
    });

    // Save & get id
    const id = currentPlanId || Date.now();
    if (currentPlanId) {
      navigate("/categories", { state: { planId: currentPlanId } });
    } else {
      const id = Date.now();
      addPlan({ id, ...newPlan });
      navigate("/categories", { state: { planId: id } });
      updatePlan(currentPlanId, validatedPlan);
    } else {
      setCurrentPlanId(id);
      addPlan({ id, ...validatedPlan });
    }

    navigate("/fees", { state: { planId: id } });
  };

  const handleBack = () => {{/* --- STIPENDS SECTION --- */}
<p className="form-section">Stipends</p>

{stipends.map((s, i) => (
  <div className="inp" key={i} style={{ display: "flex", gap: "0.5rem" }}>
    <input
      type="text"
      placeholder="e.g. Housing, Travel"
      value={s.type}
      onChange={(e) => {
        const updated = [...stipends];
        updated[i].type = e.target.value;
        setStipends(updated);
      }}
    />

    <input
      type="number"
      placeholder="$ Amount"
      value={s.amount}
      onChange={(e) => {
        const updated = [...stipends];
        updated[i].amount = Number(e.target.value);
        setStipends(updated);
      }}
    />

    {/* Delete button */}
    <button
      type="button"
      className="delete-btn"
      onClick={() => {
        setStipends(stipends.filter((_, idx) => idx !== i));
      }}
    >
      –
    </button>
  </div>
))}

{/* Add New Stipend Button */}
<button
  type="button"
  className="add-entry-btn"
  onClick={() =>
    setStipends([...stipends, { type: "", amount: "" }])
  }
>
  Add new stipend
</button>




{/* --- FEES SECTION --- */}
<p className="form-section">One-Time Fees</p>

{fees.map((f, i) => (
  <div className="inp" key={i} style={{ display: "flex", gap: "0.5rem" }}>
    <input
      type="text"
      placeholder="e.g. Relocation, Deposit"
      value={f.type}
      onChange={(e) => {
        const updated = [...fees];
        updated[i].type = e.target.value;
        setFees(updated);
      }}
    />

    <input
      type="number"
      placeholder="$ Amount"
      value={f.amount}
      onChange={(e) => {
        const updated = [...fees];
        updated[i].amount = Number(e.target.value);
        setFees(updated);
      }}
    />

    {/* Delete button */}
    <button
      type="button"
      className="delete-btn"
      onClick={() => {
        setFees(fees.filter((_, idx) => idx !== i));
      }}
    >
      –
    </button>
  </div>
))}

{/* Add New Fee Button */}
<button
  type="button"
  className="add-entry-btn"
  onClick={() =>
    setFees([...fees, { type: "", amount: "" }])
  }
>
  Add new fee
</button>
    // Save current data before going back
  const handleBack = () => {
    // Save (possibly creating a draft) then go home
    saveCurrentData();
    navigate("/");
  };

  return (
    <div>
      <StepIndicator />
      <div className="form-container">
        <h1>Input Offer Details</h1>

        <form onSubmit={handleNext}>
          {/* Offer Section */}
          <p className="form-section">Add Offer Details</p>

          {/* Company */}
          <div className="inp">
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              required
            />
            <span className="label">Company</span>
          </div>

          {/* Salary */}
          <div className="inp">
            <input
              type="number"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              required
            />
            <span className="label">Salary</span>
          </div>

          {/* Salary Frequency */}
          <div className="inp">
            <select
              value={salaryFrequency}
              onChange={(e) => setSalaryFrequency(e.target.value)}
              required
      <h1>Create Plan Page 📝</h1>

      <form onSubmit={handleNext}>
        {/* Offer Details */}
        <p style={sectionHeader}>Add Offer Details:</p>

        <input
          type="text"
          placeholder="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          style={inputStyle}
        />
        <br />

        <input
          type="number"
          placeholder="Salary"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
          style={inputStyle}
        />
        <select
          value={salaryFrequency}
          onChange={(e) => setSalaryFrequency(e.target.value)}
          style={inputStyle}
        >
          <option value="hourly">Hourly</option>
          <option value="weekly">Weekly</option>
          <option value="biweekly">Biweekly</option>
          <option value="monthly">Monthly</option>
          <option value="annually">Annually</option>
        </select>
        <br />

        <input
          type="number"
          placeholder="Number of weeks"
          value={weeks}
          onChange={(e) => setWeeks(e.target.value)}
          style={inputStyle}
        />
        <br />

        {salaryFrequency === "hourly" && (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              <option value="" disabled></option>
              <option value="hourly">Hourly</option>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Biweekly</option>
              <option value="monthly">Monthly</option>
              <option value="annually">Annually</option>
            </select>
            <span className="label">Salary Frequency</span>
          </div>

          {/* Weeks */}
          <div className="inp">
            <input
              type="number"
              value={weeks}
              onChange={(e) => setWeeks(e.target.value)}
              required
            />
            <span className="label">Number of Weeks</span>
          </div>

          {/* Hours per week if hourly */}
          {salaryFrequency === "hourly" && (
            <div className="inp">
              <input
                type="number"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(e.target.value)}
                min="1"
                max="168"
                step="1"
                required
              />
              <span className="label">Hours per Week</span>
            </div>
          )}

          {/* Location Section */}
          <p className="form-section">Add Location Info</p>

          {/* Location */}
          <div className="inp">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
            <span className="label">Location</span>
          </div>

          {/* Rent */}
          <div className="inp">
            <input
              type="number"
              value={rent}
              onChange={(e) => setRent(e.target.value)}
              required
            />
            <span className="label">Rent</span>
          </div>

          {/* Rent Frequency */}
          <div className="inp">
            <select
              value={rentFrequency}
              onChange={(e) => setRentFrequency(e.target.value)}
              required
            >
              <option value="" disabled></option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <span className="label">Rent Frequency</span>
          </div>

          {/* Transportation */}
          <div className="inp">
            <input
              type="number"
              value={transportation}
              onChange={(e) => setTransportation(e.target.value)}
              required
            />
            <span className="label">Transportation Cost</span>
          </div>

          {/* Transport frequency */}
          <div className="inp">
            <select
              value={transportFrequency}
              onChange={(e) => setTransportFrequency(e.target.value)}
              required
            >
              <option value="" disabled></option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <span className="label">Transportation Frequency</span>
          </div>

          {/* --- STIPENDS SECTION --- */}
          <p className="form-section">Stipends</p>

          {stipends.map((s, i) => (
            <div className="inp" key={i} style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="text"
                placeholder="e.g. Housing, Travel"
                value={s.type}
                onChange={(e) => {
                  const updated = [...stipends];
                  updated[i].type = e.target.value;
                  setStipends(updated);
                }}
              />

              <input
                type="number"
                placeholder="$ Amount"
                value={s.amount}
                onChange={(e) => {
                  const updated = [...stipends];
                  updated[i].amount = Number(e.target.value);
                  setStipends(updated);
                }}
              />

              {/* Delete button */}
              <div
                style={{ display: "flex", alignItems: "center" }}
              >
                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => {
                    setStipends(stipends.filter((_, idx) => idx !== i));
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--color-accent-dark)";
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "var(--color-primary-dark)";
                  }}
                >
                  x
                </button>
              </div>
            </div>
          ))}

          {/* Add New Stipend Button */}
          <button
            type="button"
            className="add-entry-btn"
            onClick={() =>
              setStipends([...stipends, { type: "", amount: "" }])
            }
          >
            Add New Stipend +
          </button>




          {/* --- FEES SECTION --- */}
          <p className="form-section">One-Time Fees</p>

          {fees.map((f, i) => (
            <div className="inp" key={i} style={{ display: "flex", gap: "0.5rem" }}>
              <input
                type="text"
                placeholder="e.g. Relocation, Deposit"
                value={f.type}
                onChange={(e) => {
                  const updated = [...fees];
                  updated[i].type = e.target.value;
                  setFees(updated);
                }}
              />

              <input
                type="number"
                placeholder="$ Amount"
                value={f.amount}
                onChange={(e) => {
                  const updated = [...fees];
                  updated[i].amount = Number(e.target.value);
                  setFees(updated);
                }}
              />

              {/* Delete button */}
              <div
                style={{ display: "flex", alignItems: "center" }}
              >
                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => {
                    setFees(fees.filter((_, idx) => idx !== i));
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--color-accent-dark)";
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "var(--color-primary-dark)";
                  }}
                >
                  x
                </button>
              </div>
            </div>
          ))}

          {/* Add New Fee Button */}
          <button
            type="button"
            className="add-entry-btn"
            onClick={() =>
              setFees([...fees, { type: "", amount: "" }])
            }
          >
            Add New Fee +
          </button>
        </form>

        {/* Navigation Buttons */}
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "2rem" }}>
          
          <button className="btn-navigation" onClick={handleBack}>
            ← Back
          </button>
          <button className="btn-navigation" onClick={handleNext} >
            Next →
          </button>
        </div>
              <span style={{ fontSize: "0.9rem", color: "#666" }}>
                hrs/week
              </span>
            </div>
            <br />
          </>
        )}

        {/* Location Info */}
        <p style={sectionHeader}>Add Location Info:</p>

        <input
          type="text"
          placeholder="Location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          style={inputStyle}
          required
        />
        <br />

        <input
          type="number"
          placeholder="Rent"
          value={rent}
          onChange={(e) => setRent(e.target.value)}
          style={inputStyle}
          required
        />
        <select
          value={rentFrequency}
          onChange={(e) => setRentFrequency(e.target.value)}
          style={inputStyle}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <br />

        <input
          type="number"
          placeholder="Transportation Cost"
          value={transportation}
          onChange={(e) => setTransportation(e.target.value)}
          style={inputStyle}
          required
        />
        <select
          value={transportFrequency}
          onChange={(e) => setTransportFrequency(e.target.value)}
          style={inputStyle}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <br />

        {/* Additional living expenses */}
        <p
          style={{
            fontSize: "1rem",
            fontWeight: 600,
            marginTop: "1.5rem",
          }}
        >
          Additional Living Expenses:
        </p>

        {/* Groceries */}
        <input
          type="number"
          placeholder="Groceries (e.g., food)"
          value={groceries}
          onChange={(e) => setGroceries(e.target.value)}
          style={inputStyle}
          required
        />
        <select
          value={groceriesFrequency}
          onChange={(e) => setGroceriesFrequency(e.target.value)}
          style={inputStyle}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <br />

        {/* Utilities */}
        <input
          type="number"
          placeholder="Utilities (e.g., Wi-Fi, electricity)"
          value={utilities}
          onChange={(e) => setUtilities(e.target.value)}
          style={inputStyle}
          required
        />
        <select
          value={utilitiesFrequency}
          onChange={(e) => setUtilitiesFrequency(e.target.value)}
          style={inputStyle}
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
        <br />
      </form>

      {/* Navigation buttons */}
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          justifyContent: "center",
          marginTop: "2rem",
        }}
      >
        <button
          onClick={handleBack}
          style={{
            padding: "0.6rem 1.2rem",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "var(--color-border)",
            color: "white",
            cursor: "pointer",
            fontSize: "0.95rem",
            fontWeight: 500,
          }}
        >
          ← Back (Save)
        </button>
        <button
          type="button"
          onClick={handleNext}
          style={{
            padding: "0.6rem 1.2rem",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "var(--color-accent-light)",
            color: "white",
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
