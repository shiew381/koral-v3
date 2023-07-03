export function getFileExtension(file) {
  return file.name.split(".").pop();
}

export function formatFileSize(num) {
  const sizeMB = num / 1000000;
  return `${sizeMB.toFixed(2)} MB`;
}
