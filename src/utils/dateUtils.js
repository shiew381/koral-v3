export function formatDate(dateObj) {
  const isDate = dateObj instanceof Date;
  if (!isDate) return "error - not date object";

  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const formattedDate = dateObj.toLocaleDateString("en-US", options);
  return formattedDate;
}

export function formatTime(dateObj) {
  const isDate = dateObj instanceof Date;
  if (!isDate) return "error - not a date object";

  const options = { hour: "2-digit", minute: "2-digit" };

  const formattedDate = dateObj.toLocaleTimeString("en-US", options);
  return formattedDate;
}

export function formatTimeAndDate(dateObj) {
  return formatDate(dateObj) + " at " + formatTime(dateObj);
}

export function getInitDueDate() {
  const date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  date.setHours(23);
  date.setMinutes(59);
  return date;
}
