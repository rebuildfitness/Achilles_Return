import { useState } from 'react';
export function DailyBrand() {
  const [failed, setFailed] = useState(false);
  const day = String(new Date().getDate()).padStart(2, '0');
  return <figure className="daily-brand">
    <img key={day} loading="lazy" decoding="async" width="768" height="512"
      src={`${import.meta.env.BASE_URL}assets/${failed ? 'daily-brand/day-01.webp' : `daily-brand/day-${day}.webp`}`}
      alt="Fitness and return-to-sport inspiration" onError={() => setFailed(true)} />
    <figcaption><strong>Achilles Return</strong><span>Build strength. Restore confidence.</span></figcaption>
  </figure>;
}
