// src/components/OfferCalculationSection.jsx
import React from "react";
import { calculatePlanDetails } from "../utils/planDetails";

export default function OfferCalculationSection({ plan, formatCurrency }) {
  const {
    totalIncome,
    totalReimbursements,
    totalFees,
    totalRentCost = 0,
    totalTransportationCost = 0,
    totalGroceriesCost = 0,
    totalUtilitiesCost = 0,
    totalDisposableIncome,
  } = calculatePlanDetails(plan);

  const otherLivingExpenses =
    (totalGroceriesCost || 0) + (totalUtilitiesCost || 0);

  const sectionCardStyle = {
    backgroundColor: "var(--color-background-accent)",
    padding: "1.5rem",
    borderRadius: "8px",
    marginBottom: "1.5rem",
  };

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
  };

  const tableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "0.5rem",
  };

  const thStyle = {
    border: "1px solid #dee2e6",
    padding: "0.75rem",
    textAlign: "left",
    backgroundColor: "#e9ecef",
  };

  const tdStyle = {
    border: "1px solid #dee2e6",
    padding: "0.75rem",
  };

  return (
    <>
      {/* Offer Details */}
      <div style={sectionCardStyle}>
        <h2 style={{ marginTop: 0, marginBottom: "1rem" }}>Offer Details</h2>
        <div style={gridStyle}>
          <div>
            <strong>Salary:</strong>{" "}
            {formatCurrency(plan.salary || 0)} ({plan.salaryFrequency})
          </div>
          <div>
            <strong>Number of Weeks:</strong> {plan.weeks || 0}
          </div>
          <div>
            <strong>Total Earnings:</strong>{" "}
            {formatCurrency(totalIncome || 0)}
          </div>
        </div>
      </div>

      {/* Location Info */}
      <div style={sectionCardStyle}>
        <h2 style={{ marginTop: 0, marginBottom: "1rem" }}>Location Info</h2>
        <div style={gridStyle}>
          <div>
            <strong>Location:</strong> {plan.location || "N/A"}
          </div>
          <div>
            <strong>Rent:</strong>{" "}
            {formatCurrency(plan.rent || 0)} (
            {plan.rentFrequency || "monthly"})
          </div>
          <div>
            <strong>Transportation:</strong>{" "}
            {formatCurrency(plan.transportation || 0)} (
            {plan.transportFrequency || "monthly"})
          </div>
        </div>
      </div>

      {/* Reimbursements / Stipends */}
      <div style={sectionCardStyle}>
        <h2 style={{ marginTop: 0, marginBottom: "1rem" }}>
          Reimbursements / Stipends
        </h2>
        {plan.stipends && plan.stipends.length > 0 ? (
          <>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Type</th>
                  <th
                    style={{
                      ...thStyle,
                      textAlign: "right",
                    }}
                  >
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {plan.stipends.map((s, i) => (
                  <tr key={i}>
                    <td style={tdStyle}>{s.type || "N/A"}</td>
                    <td
                      style={{
                        ...tdStyle,
                        textAlign: "right",
                      }}
                    >
                      {formatCurrency(s.amount || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ textAlign: "right", fontWeight: 600 }}>
              Total: {formatCurrency(totalReimbursements || 0)}
            </div>
          </>
        ) : (
          <p style={{ color: "var(--color-dark-grey)", margin: 0 }}>
            No reimbursements / stipends
          </p>
        )}
      </div>

      {/* Fees */}
      <div style={sectionCardStyle}>
        <h2 style={{ marginTop: 0, marginBottom: "1rem" }}>Fees</h2>
        {plan.fees && plan.fees.length > 0 ? (
          <>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={thStyle}>Type</th>
                  <th
                    style={{
                      ...thStyle,
                      textAlign: "right",
                    }}
                  >
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                {plan.fees.map((f, i) => (
                  <tr key={i}>
                    <td style={tdStyle}>{f.type || "N/A"}</td>
                    <td
                      style={{
                        ...tdStyle,
                        textAlign: "right",
                      }}
                    >
                      {formatCurrency(f.amount || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ textAlign: "right", fontWeight: 600 }}>
              Total: {formatCurrency(totalFees || 0)}
            </div>
          </>
        ) : (
          <p style={{ color: "var(--color-dark-grey)", margin: 0 }}>No fees</p>
        )}
      </div>

      {/* Summary */}
      <div
        style={{
          backgroundColor: "var(--color-accent-light)",
          padding: "1.5rem",
          borderRadius: "8px",
          marginBottom: "1.5rem",
          border: "2px solid var(--color-accent-dark)",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: "1rem" }}>💰 Offer Summary</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "1rem",
          }}
        >
          <div>
            <strong>Total Earnings:</strong>{" "}
            {formatCurrency(totalIncome || 0)}
          </div>
          <div>
            <strong>Total Reimbursements:</strong>{" "}
            {formatCurrency(totalReimbursements || 0)}
          </div>
          <div>
            <strong>Total Fees:</strong> {formatCurrency(totalFees || 0)}
          </div>
          <div>
            <strong>Total Rent Cost:</strong>{" "}
            {formatCurrency(totalRentCost || 0)}
          </div>
          <div>
            <strong>Total Transportation Cost:</strong>{" "}
            {formatCurrency(totalTransportationCost || 0)}
          </div>
          <div>
            <strong>Other Living (Groceries &amp; Utilities):</strong>{" "}
            {formatCurrency(otherLivingExpenses || 0)}
          </div>
          <div style={{ fontWeight: 600, fontSize: "1.05rem" }}>
            <strong>Total Disposable Income:</strong>{" "}
            {formatCurrency(totalDisposableIncome || 0)}
          </div>
        </div>
      </div>
    </>
  );
}

