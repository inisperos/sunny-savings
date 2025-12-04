
// src/utils/planDetails.js

// Calculate cumulative financial plan details
export const calculatePlanDetails = (plan) => {
  const getHoursPerWeek = (p) => {
    if (!p) return 40;
    const hoursWeek = parseFloat(p.hoursPerWeek);
    if (!Number.isNaN(hoursWeek) && hoursWeek > 0) {
      return hoursWeek;
    }
    const hoursDay = parseFloat(p.hoursPerDay);
    if (!Number.isNaN(hoursDay) && hoursDay > 0) {
      return hoursDay * 5;
    }
    return 40;
  };

  let salaryPerWeek = 0;

  if (plan.salary && plan.weeks && plan.salary > 0 && plan.weeks > 0) {
    if (plan.salaryFrequency === "hourly") {
      const hoursPerWeek = getHoursPerWeek(plan);
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
  }

  const totalIncome = salaryPerWeek * (plan.weeks || 0);

  const totalReimbursements =
    plan.stipends && Array.isArray(plan.stipends)
      ? plan.stipends.reduce((sum, s) => {
          const amount =
            s && typeof s === "object" ? Number(s.amount) || 0 : 0;
          return amount > 0 ? sum + amount : sum;
        }, 0)
      : 0;

  const totalFees =
    plan.fees && Array.isArray(plan.fees)
      ? plan.fees.reduce((sum, f) => {
          const amount =
            f && typeof f === "object" ? Number(f.amount) || 0 : 0;
          return amount > 0 ? sum + amount : sum;
        }, 0)
      : 0;

  const weeks = Number(plan.weeks) || 0;

  const weeklyCostFromFrequency = (amount, frequency) => {
    const cost = Number(amount) || 0;
    if (cost <= 0) return 0;
    const freq = (frequency || "").toLowerCase();
    switch (freq) {
      case "daily":
        return cost * 7;
      case "weekly":
        return cost;
      case "biweekly":
        return cost / 2;
      case "monthly":
        return (cost * 12) / 52;
      case "annually":
        return cost / 52;
      default:
        return cost;
    }
  };

  // Four basic living cost buckets
  const totalRentCost =
    weeks * weeklyCostFromFrequency(plan.rent, plan.rentFrequency);
  const totalTransportationCost =
    weeks *
    weeklyCostFromFrequency(plan.transportation, plan.transportFrequency);
  const totalGroceriesCost =
    weeks *
    weeklyCostFromFrequency(plan.groceries, plan.groceriesFrequency);
  const totalUtilitiesCost =
    weeks *
    weeklyCostFromFrequency(plan.utilities, plan.utilitiesFrequency);

  // Combined living expenses
  const totalLivingExpenses =
    totalRentCost +
    totalTransportationCost +
    totalGroceriesCost +
    totalUtilitiesCost;

  const totalDisposableIncome =
    totalIncome + totalReimbursements - totalFees - totalLivingExpenses;

  const numGoals = plan.goals ? plan.goals.length : 0;
  const suggestedPerGoal =
    numGoals > 0 ? (totalDisposableIncome * 0.2) / numGoals : 0;

  return {
    totalIncome,
    totalReimbursements,
    totalFees,
    totalRentCost,
    totalTransportationCost,
    totalGroceriesCost,
    totalUtilitiesCost,
    totalLivingExpenses,
    totalDisposableIncome,
    suggestedPerGoal,
  };
};

// Plan status helper (from main)
export const getPlanStatus = (plan) => {
  const hasOfferInfo =
    plan.company && plan.salary && plan.weeks && plan.location;
  const hasBudget = plan.budgets && plan.budgets.length > 0;

  if (hasOfferInfo && hasBudget) {
    return { status: "complete", label: "Complete" };
  } else if (hasOfferInfo) {
    return { status: "offer-only", label: "Offer Entered" };
  } else {
    return { status: "draft", label: "Draft" };
  }
};
