// src/pages/CreatePlanPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import '../App.css'
import StepIndicator from '../components/StepIndicator';

export default function CreatePlanPage({ addPlan, plans, updatePlan }) {
  const navigate = useNavigate();
  const locationState = useLocation();
  
  // Get plan ID from location state if editing
  const editingPlanId = locationState.state?.planId;
  const editingPlan = editingPlanId ? plans.find(p => p.id === editingPlanId) : null;

  // Offer details - initialize from editing plan if exists
  const [company, setCompany] = useState(editingPlan?.company || "");
  const [salary, setSalary] = useState(editingPlan?.salary?.toString() || "");
  const [salaryFrequency, setSalaryFrequency] = useState(editingPlan?.salaryFrequency || "annually");
  const [weeks, setWeeks] = useState(editingPlan?.weeks?.toString() || "");
  const [hoursPerWeek, setHoursPerWeek] = useState(editingPlan?.hoursPerWeek?.toString() || "40");

  // Location info
  const [location, setLocation] = useState(editingPlan?.location || "");
  const [rent, setRent] = useState(editingPlan?.rent?.toString() || "");
  const [rentFrequency, setRentFrequency] = useState(editingPlan?.rentFrequency || "monthly");
  const [transportation, setTransportation] = useState(editingPlan?.transportation?.toString() || "");
  const [transportFrequency, setTransportFrequency] = useState(editingPlan?.transportFrequency || "monthly");
  
  // Track if we have a plan ID (editing mode)
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
      if (company.trim() || salary || weeks || location.trim() || rent || transportation) {
        saveCurrentData();
      }
    }, 1000); // Save after 1 second of no changes

    return () => clearTimeout(timer);
  }, [company, salary, salaryFrequency, weeks, hoursPerWeek, location, rent, rentFrequency, transportation, transportFrequency]);

  const handleNext = (e) => {
    e.preventDefault();
    if (
      company.trim() === "" ||
      salary.trim() === "" ||
      weeks.trim() === "" ||
      location.trim() === "" ||
      rent.trim() === "" ||
      transportation.trim() === ""
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
        alert("Please enter valid hours per week (between 1 and 168) for hourly salary.");
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
      ...(salaryFrequency === "hourly" && {
        hoursPerWeek: hoursPerWeekValue,
      }),
    };

    // Save before navigating
    saveCurrentData();
    
    // Navigate to fees page, passing plan ID if we have one
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
        <h1>Create Plan Page</h1>

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

          {/* Stipends Section */}
          <p className="form-section">Add Stipends</p>

          <div className="inp-row">
            <div className="inp">
              <input
                type="text"
                placeholder="Housing, Travel, etc."
                value={stipendType}
                onChange={(e) => setStipendType(e.target.value)}
                required
              />
              <span className="label">Stipend Type</span>
            </div>

            <div className="inp">
              <input
                type="number"
                value={stipendAmount}
                onChange={(e) => setStipendAmount(e.target.value)}
                required
              />
              <span className="label">Amount</span>
            </div>

            <button type="button" className="add-btn" onClick={addStipend}>
              Add
            </button>
          </div>

          {stipends.length > 0 && (
            <ul className="stipend-list">
              {stipends.map((s, i) => (
                <li key={i}>
                  {s.type}: ${s.amount.toFixed(2)}
                </li>
              ))}
            </ul>
          )}


          {/* Fees Section */}
          <p className="form-section">Add One-Time Fees</p>

          <div className="inp-row">
            <div className="inp">
              <input
                type="text"
                placeholder="Relocation, Deposit, etc."
                value={feeType}
                onChange={(e) => setFeeType(e.target.value)}
                required
              />
              <span className="label">Fee Type</span>
            </div>

            <div className="inp">
              <input
                type="number"
                value={feeAmount}
                onChange={(e) => setFeeAmount(e.target.value)}
                required
              />
              <span className="label">Amount</span>
            </div>

            <button type="button" className="add-btn" onClick={addFee}>
              Add
            </button>
          </div>

          {fees.length > 0 && (
            <ul className="fee-list">
              {fees.map((f, i) => (
                <li key={i}>
                  {f.type}: ${f.amount.toFixed(2)}
                </li>
              ))}
            </ul>
          )}
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
      </div>
    </div>
  );
}
