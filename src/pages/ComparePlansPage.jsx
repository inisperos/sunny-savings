// src/ComparePlansPage.jsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import '../App.css'

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

// global constant definitions 
const MAX_PLANS = 4; // maximum number of plans that can be compared 

// Helper to check for array (avoids redefining Array.isArray)
const ArrayOf = Array.isArray;

export default function ComparePlansPage({ plans }) {
  const navigate = useNavigate();

  // Defense: plans might be undefined
  const safePlans = Array.isArray(plans) ? plans : [];
  const [selectedIds, setSelectedIds] = useState([]);

  // Select at most MAX_PLANS plans
  const toggle = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= MAX_PLANS) return prev;
      return [...prev, id];
    });
  };

  // Get the selected plans in order (P1, P2, P3, P4)
  const selectedPlans = useMemo(() => {
    return selectedIds
      .map((id) => safePlans.find((p) => p.id === id))
      .filter(Boolean);
  }, [selectedIds, safePlans]);

  // Use map to assign an index (A, B, C, D) to each selected plan
  const planMap = useMemo(() => {
    const keys = ['A', 'B', 'C', 'D']; // Keys for recharts
    const map = new Map();
    selectedPlans.forEach((plan, index) => {
      if (index < MAX_PLANS) {
        map.set(plan.id, {
          plan,
          key: keys[index],
          label: plan.company || plan.name || `Plan ${keys[index]}`,
          color: ['var(--color-accent-light)', 'var(--color-accent-dark)', 'var(--color-light-text)', 'var(--color-primary-dark)'][index] // would appreciate some feedback on the blues
        });
      }
    });
    return map;
  }, [selectedPlans]);
  
  const selectedPlansWithMeta = selectedPlans.map(plan => planMap.get(plan.id));
  
  // Create a list of plans to pass to the chart
  const chartPlans = selectedPlans.map(plan => planMap.get(plan.id));

  return (
    <div style={{ maxWidth: 1200, margin: "3rem auto", padding: "0 16px" }}>
      <h1 style={{ textAlign: "center" }}>Compare Plans</h1>
      <p style={{ textAlign: "center", color: "var(--color-light-text)" }}>
        Select up to <strong>{MAX_PLANS}</strong> plans to compare Salary, Stipends, and Fees.
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
          const disabled = !checked && selectedIds.length >= MAX_PLANS;
          const label = p.company || p.name || "Untitled";
          return (
            <label
              key={p.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 10px",
                border: "1px solid var(--color-border)",
                borderRadius: 8,
                background: checked ? "var(--color-background-accent)" : "white",
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
              <span style={{ color: "var(--color-dark-accent)", textDecoration: "underline" }}>
                {label}
              </span>
              <span style={{ fontSize: 12, color: "#6b7280" }}>
                (salary: ${num(p.salary)})
              </span>
            </label>
          );
        })}
      </div>


      {selectedPlans.length >= 2 ? (
        <div
          style={{
            marginTop: 20,
            // Use a single-column grid container for the overall layout ---
            display: "grid",
            gridTemplateColumns: "1fr", // Single column for main layout
            gap: 20, // Increased gap between rows
            alignItems: "stretch",
          }}
        >
          {/* ROW 1: BAR CHART (100% width) */}
          <MidChart plans={chartPlans} />
          
          {/* ROW 2: PLAN COLUMNS (Dynamic grid) */}
          <div
            style={{
              display: "grid",
              // --- Dynamic columns for the summaries ---
              gridTemplateColumns: `repeat(${selectedPlans.length}, 1fr)`,
              gap: 16,
            }}
          >
            {/* Dynamically render columns for selected plans */}
            {selectedPlansWithMeta.map(meta => (
               <Column 
                  key={meta.plan.id}
                  title={meta.label} 
                  plan={meta.plan}
               />
            ))}
          </div>
        </div>
      ) : (
        <div style={{ textAlign: "center", marginTop: 20, color: "var(--color-light-text)" }}>
          (Pick at least two plans to show comparison)
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: 24 }}>
        <button
          onClick={() => navigate("/")}
          style={{
            padding: "8px 14px",
            borderRadius: 8,
            border: "none",
            background: "var(--color-accent-dark)",
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

// MidChart now accepts 'plans' (an array of {plan, key, label, color} objects)
function MidChart({ plans, style }) {
  const sumAmount = (arr) => {
    if (!Array.isArray(arr)) return 0;
    return arr.reduce((s, x) => {
      if (x == null) return s;
      if (typeof x === "number") return s + x;
      if (typeof x === "string") return s + 0;
      return s + Number(x.amount ?? x.value ?? x.price ?? 0);
    }, 0);
  };
  
  const planDataMap = new Map();
  plans.forEach(({ plan, key }) => {
    const totalEarnings = calculateTotalEarnings(plan);
    
    const stipendsTotal = sumAmount(
      plan?.stipends ?? plan?.reimbursements ?? plan?.allowances ?? []
    );
    
    const feesTotal = sumAmount(
      plan?.fees ?? plan?.costs ?? plan?.expenses ?? []
    );
    
    planDataMap.set(key, { totalEarnings, stipendsTotal, feesTotal });
  });


  const data = [
    { name: "Salary", ...Object.fromEntries(
        plans.map(({ key }) => [key, planDataMap.get(key).totalEarnings])
    ) },
    { name: "Stipends", ...Object.fromEntries(
        plans.map(({ key }) => [key, planDataMap.get(key).stipendsTotal])
    ) },
    { name: "Fees", ...Object.fromEntries(
        plans.map(({ key }) => [key, planDataMap.get(key).feesTotal])
    ) },
  ];

  return (
    <div
      style={{
        border: "1px solid var(--color-border)",
        borderRadius: 10,
        padding: "0.75rem",
        background: "white",
        display: "flex",
        flexDirection: "column",
        ...style
      }}
    >
      <h3 style={{ margin: 0, marginBottom: "0.5rem", textAlign: "center" }}>
        Comparison (Totals)
      </h3>
      <div style={{ flex: 1, minHeight: 400 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 15, left: 15, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={(v) => `$${Number(v).toLocaleString()}`} />
            <Tooltip formatter={(v) => `$${Number(v).toLocaleString()}`} />
            <Legend />
            {/* Dynamically render a Bar for each selected plan */}
            {plans.map(({ key, label, color }) => (
                <Bar 
                  key={key}
                  dataKey={key} 
                  name={label} 
                  fill={color}
                />
            ))}
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
  if (!ArrayOf(rawFees)) rawFees = [rawFees];

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
        border: "1px solid var(--color-border)",
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
      <h4 style={{ marginTop: "1rem", textAlign: "left" }}>Reimbursements / Stipends</h4>
      {stipendItems.length > 0 ? (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "0.25rem",
          }}
        >
          <thead>
            <tr style={{ background: "var(--color-background-accent)" }}>
              <th style={{ border: "1px solid var(--color-border)", padding: "0.4rem" }}>
                Type
              </th>
              <th style={{ border: "1px solid var(--color-border)", padding: "0.4rem" }}>
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {stipendItems.map((s, i) => (
              <tr key={i}>
                <td style={{ border: "1px solid var(--color-border)", padding: "0.4rem" }}>
                  {s.type}
                </td>
                <td style={{ border: "1px solid var(--color-border)", padding: "0.4rem" }}>
                  ${Number(s.amount || 0).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ color: "#6b7280", marginTop: 4, textAlign: "left" }}>
          No reimbursements / stipends
        </div>
      )}
      {/* Stipends total */}
      <div style={{ marginTop: 6, textAlign: "left", fontWeight: 600 }}>
        Total Stipends: ${stipendsTotal.toLocaleString()}
      </div>

      {/* Fees section */}
      <h4 style={{ marginTop: "1rem", textAlign: "left" }}>Fees</h4>
      {feeItems.length > 0 ? (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "0.25rem",
          }}
        >
          <thead>
            <tr style={{ background: "var(--color-background-accent)" }}>
              <th style={{ border: "1px solid var(--color-border)", padding: "0.4rem", textAlign: "left" }}>
                Type
              </th>
              <th style={{ border: "1px solid var(--color-border)", padding: "0.4rem", textAlign: "left" }}>
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {feeItems.map((f, i) => (
              <tr key={i}>
                <td style={{ border: "1px solid var(--color-border)", padding: "0.4rem", textAlign: "left" }}>
                  {f.type}
                </td>
                <td style={{ border: "1px solid var(--color-border)", padding: "0.4rem", textAlign: "left" }}>
                  ${Number(f.amount || 0).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div style={{ color: "#6b7280", marginTop: 4, textAlign: "left" }}>No fees</div>
      )}
      {/* Fees total */}
      <div style={{ marginTop: 6, textAlign: "right", fontWeight: 600, textAlign: "left" }}>
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
        borderBottom: "1px dashed var(--color-light-grey)",
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