function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
function timeAgo(dateString) {
  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1e3);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}
function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}
function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}
function scoreColor(score) {
  if (score >= 80) return "text-brand-600";
  if (score >= 60) return "text-accent-600";
  return "text-red-600";
}
function scoreBg(score) {
  if (score >= 80) return "bg-brand-100 text-brand-700";
  if (score >= 60) return "bg-accent-100 text-accent-700";
  return "bg-red-100 text-red-700";
}
function getInitials(name) {
  if (!name) return "U";
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
}
export {
  cn,
  formatDate,
  formatDuration,
  getInitials,
  scoreBg,
  scoreColor,
  timeAgo
};
