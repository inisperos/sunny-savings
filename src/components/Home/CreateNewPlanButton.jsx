export default function CreateNewPlanButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        marginTop: "2rem",
        padding: "0.75rem 1.25rem",
        borderRadius: "8px",
        border: "none",
        backgroundColor: "#007bff",
        color: "white",
        cursor: "pointer",
        fontSize: "1rem",
      }}
    >
      Create New Plan
    </button>
  );
}