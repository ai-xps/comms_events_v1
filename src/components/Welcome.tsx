import { GatherMark } from "@/components/GatherMark";
import { LoginForm } from "@/components/LoginForm";

export function Welcome({
  cellNumbers,
  focusSignIn = false
}: {
  cellNumbers?: string[];
  /** When true (e.g. bounced from /?types=…), bring the sign-in fields into view. */
  focusSignIn?: boolean;
}) {
  return (
    <main className="welcome-shell">
      <div className="welcome-card card">
        <div className="welcome-brand welcome-settle">
          <GatherMark size="lg" lockup />
          <p className="welcome-promise">Find. Book. Gather.</p>
        </div>
        <p className="welcome-sentence welcome-fade">
          The heart of Birmingham&apos;s events, in your pocket.
        </p>

        {cellNumbers ? (
          <section id="sign-in" className="welcome-signin" aria-label="Sign in">
            {cellNumbers.length === 0 ? (
              <p className="muted login-hint">
                No accounts yet. Ask your cell leader to create yours.
              </p>
            ) : (
              <LoginForm cellNumbers={cellNumbers} embedded autoFocus={focusSignIn} />
            )}
          </section>
        ) : null}
      </div>
    </main>
  );
}
