export function calculateSize(processes) {
  return processes?.reduce((sum, process) => sum + (process?.pageCount || 0), 0);
}
