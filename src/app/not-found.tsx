import Link from "next/link";

export default function NotFound() {
  return (
    <main>
      <div className="page-head">
        <h1>Not found</h1>
        <p className="lede">That page or event does not exist, or you do not have access to it.</p>
      </div>
      <Link className="button" href="/calendar">
        Back to the calendar
      </Link>
    </main>
  );
}
