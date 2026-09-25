import { useEffect, useState } from "react";
import { MoreScreen } from "./MoreScreen";
import { get, exportAll } from "../db.js";
export default function SettingsV2({ navigate }: any) {
  const [profile, setProfile] = useState<any>(null),
    [error, setError] = useState("");
  async function reload() {
    setProfile(await get("profile", "athlete"));
  }
  useEffect(() => {
    reload().catch((e) => setError(String(e)));
  }, []);
  async function backup() {
    try {
      const b = await exportAll(),
        url = URL.createObjectURL(
          new Blob([JSON.stringify(b, null, 2)], { type: "application/json" }),
        ),
        a = document.createElement("a");
      a.href = url;
      a.download = "achilles-return-backup.json";
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) {
      setError(String(e));
    }
  }
  return (
    <section className="final-screen">
      {error && <p role="alert">{error}</p>}
      <MoreScreen
        key={profile ? "loaded" : "loading"}
        settingsMode
        profile={profile || undefined}
        onReload={reload}
        onExport={backup}
        onMovement={() => navigate("Train")}
      />
      <p>
        Owned equipment is saved in your profile. Available-today and preferred
        equipment are not assumed from ownership; separate management is not yet
        available.
      </p>
      <button onClick={() => navigate("Train")}>
        Manage custom exercises in Train
      </button>
    </section>
  );
}
