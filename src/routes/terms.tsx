import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/nidus/LegalPage";

export const Route = createFileRoute("/terms")({ component: Terms });

function Terms() {
  return (
    <LegalPage title="TERMS">
      <p>NIDUS is an idle game. You play it. You do not buy other players.</p>
      <p>
        <strong className="text-gilt">Purchases.</strong> Sovereign heroes are one-time purchases through Google Play: $0.99 each or $9.99 for all twenty, in your local currency. Double Tithe is a one-time $2.99 purchase that permanently doubles ore, parts, spark, and cut income. A purchase unlocks that hero on every device signed in to the same Google account. Refunds follow Google Play's policy. The game stays fully playable without buying anything.
      </p>
      <p>
        <strong className="text-gilt">License.</strong> You may play the hive for yourself. Art, music, names, and code are owned by Nytheria Nyx / NYX HIVEQUEEN unless a file says otherwise. Do not sell the hive as your own.
      </p>
      <p>
        <strong className="text-gilt">Saves.</strong> Progress is local. We are not liable if a browser wipe, OS update, or uninstall eats the nave. Use STASH if you care.
      </p>
      <p>
        <strong className="text-gilt">Music.</strong> Rules of Engagement is performed by Nytheria Nyx. Do not rip the file out of the hive for a separate release without her.
      </p>
      <p>
        <strong className="text-gilt">Content.</strong> Gothic industrial femme. Armored, not explicit. Fantasy wrecks and idle numbers. If that is not for you, leave.
      </p>
      <p>
        <strong className="text-gilt">No warranty.</strong> The hive is provided as-is. It may crash. Later rooms should not. If they do, that is a bug, not a feature.
      </p>
      <p>Last written 24 September 2026.</p>
    </LegalPage>
  );
}
