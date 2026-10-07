// The CSS class mirrors the risk value: "HIGH RISK" -> HIGH_RISK, "MEDIUM", "LOW".
const RiskBadge = ({ level }) => {
  if (!level) return null;
  return <span className={`risk-badge ${level.replace(/\s+/g, '_')}`}>{level}</span>;
};

export default RiskBadge;
