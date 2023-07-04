export function formatDate(dateObj) {
  const isDate = dateObj instanceof Date;
  if (!isDate) return "no date";

  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const formattedDate = dateObj.toLocaleDateString("en-US", options);
  return formattedDate;
}
