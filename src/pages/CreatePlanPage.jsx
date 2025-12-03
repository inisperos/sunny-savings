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
      navigate("/fees", { state: { planId: currentPlanId } });
    } else {
      const id = Date.now();
      addPlan({ id, ...newPlan });
      navigate("/fees", { state: { planId: id } });
    }
  };

  const handleBack = () => {
    // Save current data before going back
    saveCurrentData();
    navigate("/");
  };

  const inputStyle = {
    padding: "0.5rem",
    borderRadius: "8px",
    border: "1px solid #ccc",
    width: "220px",
    margin: "0.5rem",
  };

  const sectionHeader = {
    fontSize: "1.2rem",
    fontWeight: "bold",
    marginTop: "2rem",
  };

  return (
    <div style={{ textAlign: "center", marginTop: "3rem" }}>
      <StepIndicator />
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

        {/* Show hours per week input only when hourly is selected */}
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
              <input
                type="number"
                placeholder="Hours per week"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(e.target.value)}
                style={inputStyle}
                min="1"
                max="168"
                step="1"
              />
              <span style={{ fontSize: "0.9rem", color: "#666" }}>hrs/week</span>
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
      </form>

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
          type="button"
          onClick={(e) => {
            // Save and go to fees page (continue to budget setup)
            handleNext(e);
          }}
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
          Next →
        </button>
      </div>
    </div>
  );
}
