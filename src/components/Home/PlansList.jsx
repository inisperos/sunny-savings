function PlansList({ plans, navigate, deletePlan }) {
  return (
    <>
      {plans.map((plan) => (
        <div
          key={plan.id}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "0.5rem",
          }}
        >
          <button
            onClick={() => navigate(`/plan/${plan.id}`)}
            style={{
              background: "none",
              border: "none",
              color: "#007bff",
              cursor: "pointer",
              fontSize: "1.1rem",
              textDecoration: "underline",
            }}
          >
            {plan.company}
          </button>

          <button
            onClick={() => deletePlan(plan.id)}
            style={{
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "5px",
              padding: "0.3rem 0.6rem",
              cursor: "pointer",
              fontSize: "0.9rem",
            }}
          >
            Delete
          </button>
        </div>
      ))}
    </>
  );
}

export default PlansList;