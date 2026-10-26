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
          <GatherMark size="lg" />
          <p className="wordmark">Gather</p>
          <p className="welcome-promise">Find. Book. Gather.</p>
        </div>
        <p className="welcome-sentence welcome-fade">
          The heart of Birmingham&apos;s events, in your pocket.
        </p>
        <a className="button welcome-cta" href="#sign-in">
          Sign in
        </a>

        {cellNumbers ? (
          <section id="sign-in" className="welcome-signin">
            <h2 className="welcome-signin-title">Sign in</h2>
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
