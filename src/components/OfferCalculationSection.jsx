// src/components/OfferCalculationSection.jsx
import React from "react";
import { calculatePlanDetails } from "../utils/planDetails";

export default function OfferCalculationSection({ plan, formatCurrency }) {
  if (!plan) return null;

  const {
    totalIncome,
    totalReimbursements,
    totalFees,
    totalRentCost,
    totalTransportationCost,
    totalDisposableIncome,
  } = calculatePlanDetails(plan);

  return (
    <div>
      {/* Offer Details Section */}
      <div
        style={{
          backgroundColor: "var(--color-background-accent)",
          padding: "1.5rem",
          borderRadius: "8px",
          marginBottom: "1.5rem",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: "1rem" }}>Offer Details</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
          }}
        >
          <div>
            <strong>Salary:</strong> {formatCurrency(plan.salary)} (
            {plan.salaryFrequency})
          </div>
          <div>
            <strong>Number of Weeks:</strong> {plan.weeks || 0}
          </div>
          <div>
            <strong>Total Earnings:</strong> {formatCurrency(totalIncome)}
          </div>
        </div>
      </div>

      {/* Location Info Section */}
      <div
        style={{
          backgroundColor: "var(--color-background-accent)",
          padding: "1.5rem",
          borderRadius: "8px",
          marginBottom: "1.5rem",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: "1rem" }}>Location Info</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
          }}
        >
          <div>
            <strong>Location:</strong> {plan.location || "N/A"}
          </div>
          <div>
            <strong>Rent:</strong> {formatCurrency(plan.rent || 0)} (
            {plan.rentFrequency || "monthly"})
          </div>
          <div>
            <strong>Transportation:</strong> {formatCurrency(plan.transportation || 0)} (
            {plan.transportFrequency || "monthly"})
          </div>
        </div>
      </div>

      {/* Reimbursements / Stipends Section */}
      <div
        style={{
          backgroundColor: "var(--color-background-accent)",
          padding: "1.5rem",
          borderRadius: "8px",
          marginBottom: "1.5rem",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: "1rem" }}>
          Reimbursements / Stipends
        </h2>
        {plan.stipends && plan.stipends.length > 0 ? (
          <>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: "0.5rem",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#e9ecef" }}>
                  <th
                    style={{
                      border: "1px solid #dee2e6",
                      padding: "0.75rem",
                      textAlign: "left",
                    }}
                  >
                    Type
                  </th>
                  <th
                    style={{
                      border: "1px solid #dee2e6",
                      padding: "0.75rem",
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
                    <td
                      style={{
                        border: "1px solid #dee2e6",
                        padding: "0.75rem",
                      }}
                    >
                      {s.type || "N/A"}
                    </td>
                    <td
                      style={{
                        border: "1px solid #dee2e6",
                        padding: "0.75rem",
                        textAlign: "right",
                      }}
                    >
                      {formatCurrency(s.amount || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ textAlign: "right", fontWeight: "600" }}>
              Total: {formatCurrency(totalReimbursements)}
            </div>
          </>
        ) : (
          <p style={{ color: "var(--color-dark-grey)", margin: 0 }}>No reimbursements / stipends</p>
        )}
      </div>

      {/* Fees Section */}
      <div
        style={{
          backgroundColor: "var(--color-background-accent)",
          padding: "1.5rem",
          borderRadius: "8px",
          marginBottom: "1.5rem",
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: "1rem" }}>Fees</h2>
        {plan.fees && plan.fees.length > 0 ? (
          <>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                marginBottom: "0.5rem",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#e9ecef" }}>
                  <th
                    style={{
                      border: "1px solid #dee2e6",
                      padding: "0.75rem",
                      textAlign: "left",
                    }}
                  >
                    Type
                  </th>
                  <th
                    style={{
                      border: "1px solid #dee2e6",
                      padding: "0.75rem",
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
                    <td
                      style={{
                        border: "1px solid #dee2e6",
                        padding: "0.75rem",
                      }}
                    >
                      {f.type || "N/A"}
                    </td>
                    <td
                      style={{
                        border: "1px solid #dee2e6",
                        padding: "0.75rem",
                        textAlign: "right",
                      }}
                    >
                      {formatCurrency(f.amount || 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ textAlign: "right", fontWeight: "600" }}>
              Total: {formatCurrency(totalFees)}
            </div>
          </>
        ) : (
          <p style={{ color: "var(--color-dark-grey)", margin: 0 }}>No fees</p>
        )}
      </div>

      {/* Summary Section */}
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
            <strong>Total Earnings:</strong> {formatCurrency(totalIncome)}
          </div>
          <div>
            <strong>Total Reimbursements:</strong> {formatCurrency(totalReimbursements)}
          </div>
          <div>
            <strong>Total Fees:</strong> {formatCurrency(totalFees)}
          </div>
          <div>
            <strong>Total Rent Cost:</strong> {formatCurrency(totalRentCost)}
          </div>
          <div>
            <strong>Total Transportation Cost:</strong> {formatCurrency(totalTransportationCost)}
          </div>
          <div style={{ fontWeight: "600", fontSize: "1.1rem" }}>
            <strong>Total Disposable Income:</strong> {formatCurrency(totalDisposableIncome)}
          </div>
        </div>
      </div>
    </div>
  );
}

