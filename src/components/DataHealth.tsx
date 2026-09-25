import { useEffect, useState } from 'react';
import { get } from '../db.js';
import { VERSIONS } from '../persistence/schema.js';
import { Card } from './ui';

export function DataHealth({ onExport }: { onExport: () => void }) {
  const [last, setLast] = useState('');
  const [status, setStatus] = useState('');
  useEffect(() => { get('settings', 'backup-status').then((r: any) => setLast(r?.requestedAt || '')).catch(() => setStatus('Backup status could not be read.')); }, []);
  const due = !last || Date.now() - Date.parse(last) > 7 * 86400000;
  return <Card>
    <h2>App & data status</h2>
    <p>App {VERSIONS.appVersion} · Build {(import.meta.env as Record<string, string>).VITE_BUILD_ID || 'development'}</p>
    <p>{due ? 'A backup is recommended. Keep a copy outside this browser.' : 'A backup download was requested recently. Check that the file was saved.'}</p>
    <p className="helper">Last download request: {last ? new Date(last).toLocaleString() : 'None recorded'}. The app cannot verify where your browser saved the file.</p>
    <button className="secondary-button" onClick={onExport}>Download backup</button>
    <button className="text-button" onClick={async () => {
      try { const registration = await navigator.serviceWorker?.getRegistration(); if (!registration) { setStatus('Offline installation is not active. Open the production site online.'); return; } await registration.update(); setStatus(registration.waiting ? 'Update ready. Use Update & reload above after finishing your current task.' : 'Update check finished. If an update becomes ready, the app will show Update & reload.'); }
      catch { setStatus('Could not check for updates. Reconnect and try again.'); }
    }}>Check for app update</button>
    {status && <p role="status">{status}</p>}
    <p className="helper">Updating the app is separate from backing up records. Do not clear site data to refresh. Records remain specific to this browser and address.</p>
  </Card>;
}
