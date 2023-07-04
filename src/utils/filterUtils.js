export function filterByTerm(arr, searchTerm) {
  if (!searchTerm) return arr;

  if (searchTerm) {
    return arr.filter((el) => el.searchHandle?.includes(searchTerm));
  }
}
