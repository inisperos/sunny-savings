import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from "recharts";

// Calculate total earnings for a plan
function calculateTotalEarnings(plan) {
  let salaryPerWeek = plan.salary;

  // Convert to weekly based on frequency
  if (plan.salaryFrequency === "hourly") {
    // Assuming 40 hours per week
    salaryPerWeek = plan.salary * 40;
  } else if (plan.salaryFrequency === "weekly") {
    salaryPerWeek = plan.salary;
  } else if (plan.salaryFrequency === "biweekly") {
    salaryPerWeek = plan.salary / 2;
  } else if (plan.salaryFrequency === "monthly") {
    salaryPerWeek = plan.salary / 4;
  } else if (plan.salaryFrequency === "annually") {
    salaryPerWeek = plan.salary / 52;
  }

  return salaryPerWeek * plan.weeks;
}

// Calculate total reimbursement
function calculateTotalReimbursement(plan) {
  return plan.stipends
    ? plan.stipends.reduce((sum, s) => sum + (s.amount || 0), 0)
    : 0;
}

// Calculate total one-time fees
function calculateTotalFees(plan) {
  return plan.fees
    ? plan.fees.reduce((sum, f) => sum + (f.amount || 0), 0)
    : 0;
}

// Calculate total disposable income
function calculateTotalDisposableIncome(plan) {
  const earnings = calculateTotalEarnings(plan);
  const reimbursement = calculateTotalReimbursement(plan);
  const fees = calculateTotalFees(plan);
  return earnings + reimbursement - fees;
}

export default function ComparePlansResult({ plans }) {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedPlanIds = location.state?.selectedPlanIds || [];

  // Find the selected plans
  const planA = plans.find((p) => p.id === selectedPlanIds[0]);
  const planB = plans.find((p) => p.id === selectedPlanIds[1]);

  // Error handling
  if (selectedPlanIds.length < 2 || !planA || !planB) {
    return (
      <div style={{ textAlign: "center", marginTop: "4rem" }}>
        <h2>Error: Invalid plan selection</h2>
        <p>Please go back and select 2 plans to compare.</p>
        <button
          onClick={() => navigate("/compare")}
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
          Back to Compare
        </button>
      </div>
    );
  }

  // Calculate metrics for both plans
  const metricsA = {
    totalEarnings: calculateTotalEarnings(planA),
    totalDisposableIncome: calculateTotalDisposableIncome(planA),
    totalReimbursement: calculateTotalReimbursement(planA),
    totalFees: calculateTotalFees(planA),
  };

  const metricsB = {
    totalEarnings: calculateTotalEarnings(planB),
    totalDisposableIncome: calculateTotalDisposableIncome(planB),
    totalReimbursement: calculateTotalReimbursement(planB),
    totalFees: calculateTotalFees(planB),
  };

  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`;
  };

  // Prepare pie chart data for comparing total disposable income
  const pieChartData = [
    {
      name: planA.company,
      value: metricsA.totalDisposableIncome,
    },
    {
      name: planB.company,
      value: metricsB.totalDisposableIncome,
    },
  ];

  // Colors for pie chart
  const COLORS = ["#0088FE", "#00C49F"];

  // Custom tooltip for pie chart
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "white",
            padding: "0.5rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        >
          <p style={{ margin: 0, fontWeight: "bold" }}>{payload[0].name}</p>
          <p style={{ margin: 0 }}>
            {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ padding: "2rem", minHeight: "100vh" }}>
      {/* Return button */}
      <button
        onClick={() => navigate("/")}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.5rem 1rem",
          borderRadius: "8px",
          border: "1px solid #6c757d",
          backgroundColor: "#fff",
          color: "#6c757d",
          cursor: "pointer",
          fontSize: "1rem",
          marginBottom: "2rem",
        }}
      >
        <span>←</span> Return to Plans
      </button>

      {/* Title */}
      <h1
        style={{
          textAlign: "center",
          fontSize: "2rem",
          fontWeight: "bold",
          marginBottom: "3rem",
        }}
      >
        Internship Comparisons
      </h1>

      {/* Main comparison layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr 1fr",
          gap: "2rem",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        {/* Company A */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            {planA.company}
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  marginBottom: "0.5rem",
                  color: "#666",
                }}
              >
                Total Earnings
              </label>
              <div
                style={{
                  padding: "1rem",
                  border: "2px solid #ddd",
                  borderRadius: "8px",
                  backgroundColor: "#f8f9fa",
                  fontSize: "1.2rem",
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                {formatCurrency(metricsA.totalEarnings)}
              </div>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  marginBottom: "0.5rem",
                  color: "#666",
                }}
              >
                Total Disposable Income
              </label>
              <div
                style={{
                  padding: "1rem",
                  border: "2px solid #ddd",
                  borderRadius: "8px",
                  backgroundColor: "#f8f9fa",
                  fontSize: "1.2rem",
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                {formatCurrency(metricsA.totalDisposableIncome)}
              </div>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  marginBottom: "0.5rem",
                  color: "#666",
                }}
              >
                Total Reimbursement
              </label>
              <div
                style={{
                  padding: "1rem",
                  border: "2px solid #ddd",
                  borderRadius: "8px",
                  backgroundColor: "#f8f9fa",
                  fontSize: "1.2rem",
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                {formatCurrency(metricsA.totalReimbursement)}
              </div>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  marginBottom: "0.5rem",
                  color: "#666",
                }}
              >
                Total One-time Fees
              </label>
              <div
                style={{
                  padding: "1rem",
                  border: "2px solid #ddd",
                  borderRadius: "8px",
                  backgroundColor: "#f8f9fa",
                  fontSize: "1.2rem",
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                {formatCurrency(metricsA.totalFees)}
              </div>
            </div>
          </div>
        </div>

        {/* Pie Chart area */}
        <div
          style={{
            padding: "2rem",
            backgroundColor: "#fff",
            borderRadius: "12px",
            border: "2px solid #ddd",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "400px",
          }}
        >
          <h3
            style={{
              marginBottom: "1.5rem",
              fontSize: "1.2rem",
              fontWeight: "600",
              color: "#333",
            }}
          >
            Total Disposable Income Comparison
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => {
                  const data = pieChartData.find((d) => d.name === value);
                  return `${value}: ${formatCurrency(data?.value || 0)}`;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Company B */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            {planB.company}
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  marginBottom: "0.5rem",
                  color: "#666",
                }}
              >
                Total Earnings
              </label>
              <div
                style={{
                  padding: "1rem",
                  border: "2px solid #ddd",
                  borderRadius: "8px",
                  backgroundColor: "#f8f9fa",
                  fontSize: "1.2rem",
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                {formatCurrency(metricsB.totalEarnings)}
              </div>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  marginBottom: "0.5rem",
                  color: "#666",
                }}
              >
                Total Disposable Income
              </label>
              <div
                style={{
                  padding: "1rem",
                  border: "2px solid #ddd",
                  borderRadius: "8px",
                  backgroundColor: "#f8f9fa",
                  fontSize: "1.2rem",
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                {formatCurrency(metricsB.totalDisposableIncome)}
              </div>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  marginBottom: "0.5rem",
                  color: "#666",
                }}
              >
                Total Reimbursement
              </label>
              <div
                style={{
                  padding: "1rem",
                  border: "2px solid #ddd",
                  borderRadius: "8px",
                  backgroundColor: "#f8f9fa",
                  fontSize: "1.2rem",
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                {formatCurrency(metricsB.totalReimbursement)}
              </div>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  marginBottom: "0.5rem",
                  color: "#666",
                }}
              >
                Total One-time Fees
              </label>
              <div
                style={{
                  padding: "1rem",
                  border: "2px solid #ddd",
                  borderRadius: "8px",
                  backgroundColor: "#f8f9fa",
                  fontSize: "1.2rem",
                  fontWeight: "600",
                  textAlign: "center",
                }}
              >
                {formatCurrency(metricsB.totalFees)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

