export function StatusBanner({
  message,
  kind = "info"
}: {
  message?: string | null;
  kind?: "info" | "error";
}) {
  if (!message) return null;
  return (
    <p className="status" role="status" data-kind={kind}>
      {message}
    </p>
  );
}
