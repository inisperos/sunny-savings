// src/components/StepIndicator.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function StepIndicator() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;
  const planId = location.state?.planId;

  const steps = [
    { path: "/create", label: "Create Plan", number: 1 },
    { path: "/fees", label: "Fees & Stipends", number: 2 },
    { path: "/categories", label: "Categories", number: 3 },
    { path: "/set-budget", label: "Set Budget", number: 4 },
  ];

  const getCurrentStepIndex = () => {
    const index = steps.findIndex((step) => step.path === currentPath);
    return index >= 0 ? index : -1;
  };

  const currentStepIndex = getCurrentStepIndex();

  // Don't show indicator if not in the flow
  if (currentStepIndex < 0) {
    return null;
  }

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto 2rem auto",
        padding: "1rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          position: "relative",
          minHeight: "80px",
        }}
      >
        {/* Progress line - positioned at center of circles (20px from top of circle container) */}
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            right: "20px",
            height: "2px",
            backgroundColor: "#e5e7eb",
            zIndex: 0,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            width: currentStepIndex > 0 
              ? `calc(${(currentStepIndex / (steps.length - 1)) * 100}% - 40px)` 
              : "0",
            height: "2px",
            backgroundColor: "var(--color-accent-dark)",
            zIndex: 1,
            transition: "width 0.3s ease",
          }}
        />

        {/* Steps */}
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;

          const handleStepClick = () => {
            // Navigate to the step, preserving planId if it exists
            if (planId) {
              navigate(step.path, { state: { planId } });
            } else {
              navigate(step.path);
            }
          };

          return (
            <div
              key={step.path}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                flex: 1,
                position: "relative",
                zIndex: 2,
                cursor: "pointer",
              }}
              onClick={handleStepClick}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  backgroundColor: isCompleted
                    ? "var(--color-accent-dark)"
                    : isCurrent
                    ? "var(--color-accent-dark)"
                    : "#e5e7eb",
                  color: isCompleted || isCurrent ? "white" : "#9ca3af",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "600",
                  fontSize: "0.9rem",
                  border:
                    isCurrent
                      ? "3px solid var(--color-accent-light)"
                      : "none",
                  boxShadow:
                    isCurrent
                      ? "0 0 0 3px rgba(200, 93, 126, 0.2)"
                      : "none",
                  transition: "all 0.3s ease",
                  flexShrink: 0,
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  if (!isCurrent) {
                    e.currentTarget.style.transform = "scale(1.1)";
                    e.currentTarget.style.opacity = "0.8";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.opacity = "1";
                }}
              >
                {isCompleted ? "✓" : step.number}
              </div>
              <div
                style={{
                  marginTop: "0.5rem",
                  fontSize: "0.75rem",
                  fontWeight: isCurrent ? "600" : "400",
                  color: isCurrent
                    ? "var(--color-accent-dark)"
                    : isCompleted
                    ? "#6b7280"
                    : "#9ca3af",
                  textAlign: "center",
                  maxWidth: "80px",
                  cursor: "pointer",
                  transition: "color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  if (!isCurrent) {
                    e.currentTarget.style.color = "var(--color-accent-dark)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isCurrent) {
                    e.currentTarget.style.color = isCompleted ? "#6b7280" : "#9ca3af";
                  }
                }}
              >
                {step.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

