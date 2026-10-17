/** One sentence for the scraper form. Does not include the technical allowlist reason. */
export function droppedPriorityUrlMessage(rejected: { url: string }[]): string | null {
  if (!rejected.length) return null;
  const list = rejected.map((row) => row.url).join(", ");
  return rejected.length === 1
    ? `This address is not on the allowlist, so it was taken off the list: ${list}`
    : `These addresses are not on the allowlist, so they were taken off the list: ${list}`;
}
