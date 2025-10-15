// Helper functions for common operations
export const formatCurrency = (amount) => {
  return amount?.toLocaleString('fr-TN', { style: 'currency', currency: 'TND' });
};

export const formatDate = (date) => {
  return date ? new Date(date).toLocaleDateString('fr-FR') : "N/A";
};

export const getConditionColor = (condition) => {
  const colors = {
    "neuf": "#10b981",
    "excellent": "#22c55e",
    "bon": "#84cc16",
    "correct": "#eab308",
    "mauvais": "#f97316",
    "nécessite_réparation": "#ef4444"
  };
  return colors[condition] || "#6b7280";
};

export const getStatusColor = (status) => {
  switch (status) {
    case "emprunté": return "primary";
    case "retourné": return "success";
    case "en_retard": return "error";
    default: return "default";
  }
};

export const isLowStock = (quantity, threshold = 5) => {
  return quantity < threshold;
};

export const isRecentDate = (date, days = 30) => {
  if (!date) return false;
  const targetDate = new Date(date);
  const daysAgo = new Date();
  daysAgo.setDate(daysAgo.getDate() - days);
  return targetDate > daysAgo;
};

export const calculateMaintenanceDuration = (startDate, endDate) => {
  if (!startDate) return null;
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};