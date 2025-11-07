// src/ComparePlansPage.jsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function ComparePlansPage({ plans }) {
  const navigate = useNavigate();

  // Defense: plans might be undefined
  const safePlans = Array.isArray(plans) ? plans : [];
  const [selectedIds, setSelectedIds] = useState([]);

  // Select at most 2 plans
  const toggle = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  };

  // Get the two selected plans (left and right)
  const [leftPlan, rightPlan] = useMemo(() => {
    const chosen = selectedIds
      .map((id) => safePlans.find((p) => p.id === id))
      .filter(Boolean);
    return [chosen[0] || null, chosen[1] || null];
  }, [selectedIds, safePlans]);

  return (
    <div style={{ maxWidth: 1000, margin: "3rem auto", padding: "0 16px" }}>
      <h1 style={{ textAlign: "center" }}>Compare Plans</h1>
      <p style={{ textAlign: "center", color: "#555" }}>
        Select <strong>two</strong> plans to compare Salary, Stipends, and Fees.
      </p>

      {/* Plan selector */}
      <div
        style={{
          marginTop: 16,
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        {safePlans.map((p) => {
          const checked = selectedIds.includes(p.id);
          const disabled = !checked && selectedIds.length >= 2;
          const label = p.company || p.name || "Untitled";
          return (
            <label
              key={p.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 10px",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                background: checked ? "#eef5ff" : "white",
                opacity: disabled ? 0.6 : 1,
                cursor: disabled ? "not-allowed" : "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggle(p.id)}
                disabled={disabled}
              />
              <span style={{ color: "#2563eb", textDecoration: "underline" }}>
                {label}
              </span>
              <span style={{ fontSize: 12, color: "#6b7280" }}>
                (salary: ${num(p.salary)})
              </span>
            </label>
          );
        })}
      </div>


      {leftPlan && rightPlan ? (
        <div
          style={{
            marginTop: 20,
            display: "grid",
            gridTemplateColumns: "1fr 1.4fr 1fr", // Middle column wider for chart
            gap: 16,
            alignItems: "stretch",
          }}
        >
          <Column title={leftPlan.company || leftPlan.name || "Plan A"} plan={leftPlan} />

          {/* Middle bar chart: Total of Salary / Stipends / Fees */}
          <MidChart left={leftPlan} right={rightPlan} />

          <Column title={rightPlan.company || rightPlan.name || "Plan B"} plan={rightPlan} />
        </div>
      ) : (
        <div style={{ textAlign: "center", marginTop: 20, color: "#0e5bf7ff" }}>
          (Pick two plans to show comparison)
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: 24 }}>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: "none",
            background: "#6b7280",
            color: "white",
            cursor: "pointer",
          }}
        >
          Back Home
        </button>
      </div>
    </div>
  );
}


// Calculate total earnings with proper salary frequency conversion
function calculateTotalEarnings(plan) {
  if (!plan || !plan.salary || !plan.weeks) return 0;
  
  let salaryPerWeek = plan.salary;
  
  // Convert to weekly based on frequency
  if (plan.salaryFrequency === "hourly") {
    // Use hoursPerDay if available, otherwise default to 8 hours/day (40 hours/week)
    const hoursPerDay = plan.hoursPerDay || 8;
    const hoursPerWeek = hoursPerDay * 5; // Assuming 5 working days per week
    salaryPerWeek = plan.salary * hoursPerWeek;
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

function MidChart({ left, right }) {
  const sumAmount = (arr) => {
    if (!Array.isArray(arr)) return 0;
    return arr.reduce((s, x) => {
      if (x == null) return s;
      if (typeof x === "number") return s + x;
      if (typeof x === "string") return s + 0;
      return s + Number(x.amount ?? x.value ?? x.price ?? 0);
    }, 0);
  };

  const lStip = sumAmount(
    left?.stipends ?? left?.reimbursements ?? left?.allowances ?? []
  );
  const rStip = sumAmount(
    right?.stipends ?? right?.reimbursements ?? right?.allowances ?? []
  );

  const lFees = sumAmount(left?.fees ?? left?.costs ?? left?.expenses ?? []);
  const rFees = sumAmount(right?.fees ?? right?.costs ?? right?.expenses ?? []);

  const data = [
    { name: "Salary",   A: calculateTotalEarnings(left),  B: calculateTotalEarnings(right) },
    { name: "Stipends", A: lStip,              B: rStip },
    { name: "Fees",     A: lFees,              B: rFees },
  ];

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        padding: "0.75rem",
        background: "white",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h3 style={{ margin: 0, marginBottom: "0.5rem", textAlign: "center" }}>
        Comparison (Totals)
      </h3>
      <div style={{ flex: 1, minHeight: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(v) => `$${Number(v).toLocaleString()}`} />
            <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
            <Legend />
            <Bar dataKey="A" name={left?.company || left?.name || "Plan A"} />
            <Bar dataKey="B" name={right?.company || right?.name || "Plan B"} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function Column({ title, plan }) {
  const companyLabel =
    plan.company ?? plan.companyName ?? plan.name ?? plan.title ?? "—";

  // Calculate total salary with proper frequency conversion
  const totalSalary = calculateTotalEarnings(plan);

  // Normalize stipend list
  let rawStipends =
    plan.stipends ?? plan.reimbursements ?? plan.allowances ?? plan.stipend ?? [];
  if (!Array.isArray(rawStipends)) rawStipends = [rawStipends];

  const stipendItems = rawStipends
    .map((x, i) => {
      if (x == null) return null;
      if (typeof x === "number") return { type: `Item ${i + 1}`, amount: x };
      if (typeof x === "string") return { type: x, amount: 0 };
      const type = x.type ?? x.category ?? x.name ?? x.label ?? `Item ${i + 1}`;
      const amount = Number(x.amount ?? x.value ?? x.price ?? 0);
      return { type, amount };
    })
    .filter(Boolean);

  // Normalize fee list
  let rawFees = plan.fees ?? plan.costs ?? plan.expenses ?? plan.charges ?? [];
  if (!Array.isArray(rawFees)) rawFees = [rawFees];

  const feeItems = rawFees
    .map((x, i) => {
      if (x == null) return null;
      if (typeof x === "number") return { type: `Fee ${i + 1}`, amount: x };
      if (typeof x === "string") return { type: x, amount: 0 };
      const type = x.type ?? x.category ?? x.name ?? x.label ?? `Fee ${i + 1}`;
      const amount = Number(x.amount ?? x.value ?? x.price ?? 0);
      return { type, amount };
    })
    .filter(Boolean);

  // Total
  const stipendsTotal = stipendItems.reduce((s, x) => s + Number(x.amount || 0), 0);
  const feesTotal     = feeItems.reduce((s, x) => s + Number(x.amount || 0), 0);

  return (
    <div
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 10,
        padding: "1rem",
        background: "white",
      }}
    >
      <h3 style={{ margin: 0, marginBottom: "0.5rem" }}>{title}</h3>

      <Row label="Company / Plan">{companyLabel}</Row>

      <Row label="Total Salary">
        {totalSalary != null ? `$${totalSalary.toLocaleString()}` : "—"}
      </Row>

      {/* Stipends section */}
      <h4 style={{ marginTop: "1rem" }}>Reimbursements / Stipends</h4>
      {stipendItems.length > 0 ? (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "0.25rem",
          }}
        >
          <thead>
            <tr style={{ background: "#f8f9fa" }}>
              <th style={{ border: "1px solid #e5e7eb", padding: "0.4rem" }}>
                Type
              </th>
              <th style={{ border: "1px solid #e5e7eb", padding: "0.4rem" }}>
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {stipendItems.map((s, i) => (
              <tr key={i}>
                <td style={{ border: "1px solid #e5e7eb", padding: "0.4rem" }}>
                  {s.type}
                </td>
                <td style={{ border: "1px solid #e5e7eb", padding: "0.4rem" }}>
                  ${Number(s.amount || 0).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ color: "#6b7280", marginTop: 4 }}>
          No reimbursements / stipends
        </div>
      )}
      {/* Stipends total */}
      <div style={{ marginTop: 6, textAlign: "right", fontWeight: 600 }}>
        Total Stipends: ${stipendsTotal.toLocaleString()}
      </div>

      {/* Fees section */}
      <h4 style={{ marginTop: "1rem" }}>Fees</h4>
      {feeItems.length > 0 ? (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "0.25rem",
          }}
        >
          <thead>
            <tr style={{ background: "#f8f9fa" }}>
              <th style={{ border: "1px solid #e5e7eb", padding: "0.4rem" }}>
                Type
              </th>
              <th style={{ border: "1px solid #e5e7eb", padding: "0.4rem" }}>
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {feeItems.map((f, i) => (
              <tr key={i}>
                <td style={{ border: "1px solid #e5e7eb", padding: "0.4rem" }}>
                  {f.type}
                </td>
                <td style={{ border: "1px solid #e5e7eb", padding: "0.4rem" }}>
                  ${Number(f.amount || 0).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ color: "#6b7280", marginTop: 4 }}>No fees</div>
      )}
      {/* Fees total */}
      <div style={{ marginTop: 6, textAlign: "right", fontWeight: 600 }}>
        Total Fees: ${feesTotal.toLocaleString()}
      </div>
    </div>
  );
}

/** Small component: left-right row layout */
function Row({ label, children }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "6px 0",
        borderBottom: "1px dashed #eee",
      }}
    >
      <span style={{ color: "#6b7280" }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{children}</span>
    </div>
  );
}

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
