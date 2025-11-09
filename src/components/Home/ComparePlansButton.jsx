export default function ComparePlansButton({ onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={disabled ? "Create at least 2 plans to compare" : "Compare two plans"}
      style={{
        marginTop: "0.75rem",
        padding: "0.75rem 1.25rem",
        borderRadius: "8px",
        border: "none",
        backgroundColor: disabled ? "#9ca3af" : "#007bff",
        color: "white",
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: "1rem",
      }}
    >
      Compare Plans
    </button>
  );
}