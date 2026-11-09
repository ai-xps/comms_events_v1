export function StatusBanner({
  message,
  kind = "info"
}: {
  message?: string | null;
  kind?: "info" | "error";
}) {
  if (!message) return null;
  return (
    <p className="status" role={kind === "error" ? "alert" : "status"} data-kind={kind}>
      {message}
    </p>
  );
}
