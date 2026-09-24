import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/nidus/LegalPage";
import { EraseData } from "@/components/nidus/SettingsPanel";
import { ACK_URL } from "@/lib/nidus/support";

export const Route = createFileRoute("/privacy")({ component: Privacy });

function Privacy() {
  return (
    <LegalPage title="PRIVACY">
      <p>NIDUS is a single-player idle hive. It does not want your name, mail, or face.</p>
      <p>
        <strong className="text-gilt">What stays on your device.</strong> The hive (ore, rooms, commanders, song prefs) lives in this browser’s local storage under keys that start with <em>nidus.</em> We do not upload it. There is no account and no cloud save. To play offline, the browser also keeps a copy of the game's own files (code, art, music); that copy holds nothing about you. EXPORT writes a save file that only you keep.
      </p>
      <p>
        <strong className="text-gilt">What we do not collect.</strong> No analytics SDK. No advertising ID. No contacts, location, camera, or microphone. Audio plays on-device. SPARK, ECHO, and commanders are game numbers, not people.
      </p>
      <p>
        <strong className="text-gilt">Music.</strong> The anthem is <em>Rules of Engagement</em> by Nytheria Nyx, played from files that ship with the hive. The Spotify button opens Spotify in your browser. Spotify’s own privacy policy applies there. We do not receive your Spotify data. The NYX WEBSITE button, when shown, opens Nytheria Nyx's own site in your browser under that site's policy.
      </p>
      <p>
        <strong className="text-gilt">Purchases.</strong> Sovereign heroes and Double Tithe are one-time purchases handled entirely by Google Play on Android or the Microsoft Store on Windows. We never see your card, name, or account. The app asks the store which heroes you own and keeps that list on this device so the court works offline. Refunds and receipts follow that store's rules.
      </p>
      {ACK_URL && (
        <p>
          <strong className="text-gilt">Purchase check.</strong> Google Play refunds a purchase unless the game confirms it within three days. After you buy, the app sends Google's purchase code for that item (not your name, email, or card) to this site's own server, which passes it to Google Play to confirm the purchase. The server stores nothing.
        </p>
      )}
      <p>
        <strong className="text-gilt">If you wrap NIDUS as an Android app.</strong> The Play listing is a window onto the same hive. The wrapper does not add tracking. Game progress still lives on the device. Uninstalling the app deletes that copy of the hive unless you stashed a slot somewhere else.
      </p>
      <p>
        <strong className="text-gilt">Erase.</strong> SETTINGS → SAVE → ERASE MY DATA, or the button below, removes everything NIDUS keeps on this device. NEW HIVE wipes only the live hive. Clearing site data or uninstalling does the same. Three local slots (STASH / LOAD) are also only on-device.
      </p>
      <p>
        <strong className="text-gilt">Children.</strong> NIDUS is not directed at children under 13. It is a gothic industrial idle. No social features.
      </p>
      <p>
        <strong className="text-gilt">Contact.</strong> Nytheria Nyx / NYX HIVEQUEEN. GitHub: NYXHIVEQUEEN. Spotify: Nytheria Nyx. For a Play listing, put a mail you actually read on the store form — the hive itself does not collect mail.
      </p>
      <EraseData />
      <p>Last written 24 September 2026. This page is the policy.</p>
    </LegalPage>
  );
}
