import { AppHeader, PrimaryButton } from "../components/ui";
export function Welcome({
  onStart,
  error,
  busy,
}: {
  onStart: (restore: boolean) => void;
  error: string;
  busy: boolean;
}) {
  return (
    <div className="welcome-shell">
      <AppHeader onProfile={() => onStart(true)} />
      <main className="welcome-content">
        <img
          src={`${import.meta.env.BASE_URL}assets/hero-reference.png`}
          alt="Basketball athlete and the approved Achilles Return app design"
          className="welcome-art"
        />
        <div className="welcome-copy">
          <p className="eyebrow">REHAB / PROGRESS / PLAY AGAIN</p>
          <h1>Return to basketball with a smarter rehab plan.</h1>
          <p>Criteria-based. Progressive. Built around your actual capacity.</p>
          <PrimaryButton disabled={busy} onClick={() => onStart(false)}>
            Get Started <span aria-hidden="true">→</span>
          </PrimaryButton>
          <button
            className="text-button"
            disabled={busy}
            onClick={() => onStart(true)}
          >
            Restore Backup
          </button>
          {error && <p role="alert">{error}</p>}
          <p className="welcome-note">
            Your data stays on this device. Your baseline guides the starting
            point.
          </p>
        </div>
      </main>
    </div>
  );
}
