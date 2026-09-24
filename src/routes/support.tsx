import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/nidus/LegalPage";
import { APP_VERSION, FAQ, SUPPORT_EMAIL, SUPPORT_ISSUES } from "@/lib/nidus/support";

export const Route = createFileRoute("/support")({
  head: () => ({ meta: [{ title: "NIDUS · Support" }] }),
  component: Support,
});

function Support() {
  return (
    <LegalPage title="SUPPORT">
      <p>
        NIDUS {APP_VERSION}. In the hive, open SETTINGS → FAQ to copy a fault report. It holds the build and your screen size, never your hive name or anything about you.
      </p>
      {FAQ.map((f) => (
        <p key={f.q}>
          <strong className="text-gilt">{f.q}.</strong> {f.a}
        </p>
      ))}
      <p>
        <strong className="text-gilt">Reach the hive.</strong>{" "}
        {SUPPORT_EMAIL ? (
          <a className="underline" href={`mailto:${SUPPORT_EMAIL}`}>
            {SUPPORT_EMAIL}
          </a>
        ) : (
          <a className="underline" href={SUPPORT_ISSUES} target="_blank" rel="noopener noreferrer">
            File a fault on GitHub
          </a>
        )}
        . Paste the report. Say what you did and what you expected.
      </p>
      <p>
        <strong className="text-gilt">Refunds.</strong> Store purchases follow the store’s own refund rules.
      </p>
    </LegalPage>
  );
}
