// src/pages/CreatePlanPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreatePlanPage({ addPlan }) {
  const navigate = useNavigate();

  // Offer details
  const [company, setCompany] = useState("");
  const [salary, setSalary] = useState("");
  const [salaryFrequency, setSalaryFrequency] = useState("annually");
  const [weeks, setWeeks] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState("40");

  // Location info
  const [location, setLocation] = useState("");
  const [rent, setRent] = useState("");
  const [rentFrequency, setRentFrequency] = useState("monthly");
  const [transportation, setTransportation] = useState("");
  const [transportFrequency, setTransportFrequency] = useState("monthly");

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
  
    addPlan(newPlan);
    navigate("/goals");
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
        <button
          type="submit"
          onClick={handleNext}
          style={{
            marginTop: "1.5rem",
            padding: "0.5rem 1rem",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#28a745ff",
            color: "white",
            cursor: "pointer",
          }}
        >
          Next →
        </button>
      </form>

      <button
        onClick={() => navigate("/")}
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          borderRadius: "8px",
          border: "none",
          backgroundColor: "#6c757d",
          color: "white",
          cursor: "pointer",
        }}
      >
        Go Back Home
      </button>
    </div>
  );
}
