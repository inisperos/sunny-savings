// src/pages/CreatePlanPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../App.css";
import StepIndicator from "../components/StepIndicator";

export default function CreatePlanPage({ addPlan, plans, updatePlan }) {
  const navigate = useNavigate();
  const locationState = useLocation();

  // Get plan ID from location state if editing
  const editingPlanId = locationState.state?.planId;
  const editingPlan = editingPlanId
    ? plans.find((p) => p.id === editingPlanId)
    : null;

  // Offer details - initialize from editing plan if exists
  const [company, setCompany] = useState(editingPlan?.company || "");
  const [salary, setSalary] = useState(
    editingPlan?.salary?.toString() || ""
  );
  const [salaryFrequency, setSalaryFrequency] = useState(
    editingPlan?.salaryFrequency || "annually"
  );
  const [weeks, setWeeks] = useState(
    editingPlan?.weeks?.toString() || ""
  );
  const [hoursPerWeek, setHoursPerWeek] = useState(
    editingPlan?.hoursPerWeek?.toString() || "40"
  );

  // Location info
  const [location, setLocation] = useState(editingPlan?.location || "");
  const [rent, setRent] = useState(
    editingPlan?.rent?.toString() || ""
  );
  const [rentFrequency, setRentFrequency] = useState(
    editingPlan?.rentFrequency || "monthly"
  );
  const [transportation, setTransportation] = useState(
    editingPlan?.transportation?.toString() || ""
  );
  const [transportFrequency, setTransportFrequency] = useState(
    editingPlan?.transportFrequency || "monthly"
  );

  // Additional living expenses: groceries and utilities
  const [groceries, setGroceries] = useState(
    editingPlan?.groceries?.toString() || ""
  );
  const [groceriesFrequency, setGroceriesFrequency] = useState(
    editingPlan?.groceriesFrequency || "monthly"
  );
  const [utilities, setUtilities] = useState(
    editingPlan?.utilities?.toString() || ""
  );
  const [utilitiesFrequency, setUtilitiesFrequency] = useState(
    editingPlan?.utilitiesFrequency || "monthly"
  );

  // Track if we have a plan ID (editing mode)
  const [currentPlanId, setCurrentPlanId] = useState(
    editingPlanId || null
  );

  // State for stipends and fees - initialize from editing plan if exists
  const [stipends, setStipends] = useState(editingPlan?.stipends || []);
  const [fees, setFees] = useState(editingPlan?.fees || []);

  // (Legacy inputs for stipends/fees, kept for minimal change, but not used directly)
  const [stipendType, setStipendType] = useState("");
  const [stipendAmount, setStipendAmount] = useState("");
  const [feeType, setFeeType] = useState("");
  const [feeAmount, setFeeAmount] = useState("");

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
      // groceries and utilities stored on the plan
      groceries: parseFloat(groceries) || 0,
      groceriesFrequency,
      utilities: parseFloat(utilities) || 0,
      utilitiesFrequency,
      stipends,
      fees,
      ...(salaryFrequency === "hourly" && {
        hoursPerWeek: parseFloat(hoursPerWeek) || 40,
      }),
    };

    if (currentPlanId) {
      // Update existing plan
      updatePlan(currentPlanId, planData);
    } else {
      // Create new plan if we have at least company name
      if (company.trim()) {
        const id = Date.now();
        setCurrentPlanId(id);
        addPlan({ id, ...planData });
      }
    }
  };

  // Auto-save on input changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (
        company.trim() ||
        salary ||
        weeks ||
        location.trim() ||
        rent ||
        transportation ||
        groceries ||
        utilities
      ) {
        saveCurrentData();
      }
    }, 1000); // Save after 1 second of no changes

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
    stipends,
    fees,
  ]);

  const handleNext = (e) => {
    e.preventDefault();
    if (
      company.trim() === "" ||
      salary.trim() === "" ||
      weeks.trim() === "" ||
      location.trim() === "" ||
      rent.trim() === "" ||
      transportation.trim() === "" ||
      groceries.trim() === "" || // groceries required
      utilities.trim() === "" // utilities required
    ) {
      alert("Please fill out all required fields.");
      return;
    }

    // Validate salary
    const salaryValue = parseFloat(salary);
    if (isNaN(salaryValue) || salaryValue <= 0) {
      alert("Please enter a valid positive salary amount.");
      return;
    }

    // Validate weeks
    const weeksValue = parseInt(weeks);
    if (
      isNaN(weeksValue) ||
      weeksValue <= 0 ||
      !Number.isInteger(weeksValue)
    ) {
      alert(
        "Please enter a valid positive number of weeks (whole number)."
      );
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

    // Validate rent
    const rentValue = parseFloat(rent);
    if (isNaN(rentValue) || rentValue < 0) {
      alert("Please enter a valid rent amount (0 or positive).");
      return;
    }

    // Validate transportation
    const transportationValue = parseFloat(transportation);
    if (isNaN(transportationValue) || transportationValue < 0) {
      alert("Please enter a valid transportation cost (0 or positive).");
      return;
    }

    // Validate groceries
    const groceriesValue = parseFloat(groceries);
    if (isNaN(groceriesValue) || groceriesValue < 0) {
      alert("Please enter a valid groceries cost (0 or positive).");
      return;
    }

    // Validate utilities
    const utilitiesValue = parseFloat(utilities);
    if (isNaN(utilitiesValue) || utilitiesValue < 0) {
      alert("Please enter a valid utilities cost (0 or positive).");
      return;
    }

    const newPlan = {
      company,
      salary: salaryValue,
      salaryFrequency,
      weeks: weeksValue,
      location,
      rent: rentValue,
      rentFrequency,
      transportation: transportationValue,
      transportFrequency,
      groceries: groceriesValue,
      groceriesFrequency,
      utilities: utilitiesValue,
      utilitiesFrequency,
      ...(salaryFrequency === "hourly" && {
        hoursPerWeek: hoursPerWeekValue,
      }),
      stipends,
      fees,
    };

    // Save before navigating
    saveCurrentData();

    // Navigate to categories page, passing plan ID if we have one
    if (currentPlanId) {
      navigate("/categories", { state: { planId: currentPlanId } });
    } else {
      const id = Date.now();
      addPlan({ id, ...newPlan });
      navigate("/categories", { state: { planId: id } });
    }
  };

  const handleBack = () => {
    // Save current data before going back
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

          {/* Transportation frequency */}
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

          {/* Additional living expenses: groceries and utilities */}
          <p className="form-section">Additional Living Expenses</p>

          {/* Groceries */}
         <div className="inp">
          <input
          type="number"
          value={groceries}
          onChange={(e) => setGroceries(e.target.value)}
          placeholder="e.g. weekly groceries, household essentials, cleaning supplies"
          required
          />
            <span className="label">Groceries</span>
         </div>

          <div className="inp">
            <select
              value={groceriesFrequency}
              onChange={(e) => setGroceriesFrequency(e.target.value)}
              required
            >
              <option value="" disabled></option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <span className="label">Groceries Frequency</span>
          </div>

          {/* Utilities */}
        <div className="inp">
        <input
           type="number"
           value={utilities}
           onChange={(e) => setUtilities(e.target.value)}
           placeholder="e.g. Wi-Fi, electricity, water, gas"
           required
         />
         <span className="label">Utilities</span>
         </div>

          <div className="inp">
            <select
              value={utilitiesFrequency}
              onChange={(e) => setUtilitiesFrequency(e.target.value)}
              required
            >
              <option value="" disabled></option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
            <span className="label">Utilities Frequency</span>
          </div>

          {/* --- STIPENDS SECTION --- */}
          <p className="form-section">Stipends</p>

          {stipends.map((s, i) => (
            <div
              className="inp"
              key={i}
              style={{ display: "flex", gap: "0.5rem" }}
            >
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
              <div style={{ display: "flex", alignItems: "center" }}>
                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => {
                    setStipends(stipends.filter((_, idx) => idx !== i));
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "var(--color-accent-dark)";
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color =
                      "var(--color-primary-dark)";
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
            <div
              className="inp"
              key={i}
              style={{ display: "flex", gap: "0.5rem" }}
            >
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
              <div style={{ display: "flex", alignItems: "center" }}>
                <button
                  type="button"
                  className="delete-btn"
                  onClick={() => {
                    setFees(fees.filter((_, idx) => idx !== i));
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "var(--color-accent-dark)";
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color =
                      "var(--color-primary-dark)";
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
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            marginTop: "2rem",
          }}
        >
          <button className="btn-navigation" onClick={handleBack}>
            ← Back
          </button>
          <button className="btn-navigation" onClick={handleNext}>
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}
