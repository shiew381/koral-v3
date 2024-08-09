import { alphabetize } from "./commonUtils";

export function filterByTerm(arr, searchTerm) {
  if (!searchTerm) return arr;

  if (searchTerm) {
    return arr.filter((el) => el.searchHandle?.includes(searchTerm));
  }
}

export function getFilters(asgmts) {
  if (asgmts.length === 0) {
    return [];
  }
  const aggregatedFilters = asgmts
    .flatMap((asgmt) => asgmt.labels)
    .filter((el) => el);

  const uniqueFilters = alphabetize([...new Set(aggregatedFilters)]);
  return uniqueFilters;
}
