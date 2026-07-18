'use client';

import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  createConsentPreference,
  persistConsentPreference,
  readConsentPreference,
} from '@/lib/consent/preferences';

export function CookiePreferences() {
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const current = readConsentPreference();
    setAnalytics(current?.categories.analytics ?? false);
    setMarketing(current?.categories.marketing ?? false);
  }, []);

  async function save() {
    const current = readConsentPreference();
    await persistConsentPreference(
      createConsentPreference(
        'configure',
        { analytics, marketing },
        current?.sessionRef,
      ),
    );
    setSaved(true);
  }

  return (
    <section className="cherie-surface mt-8 rounded-card-lg p-6" aria-labelledby="cookie-settings-title">
      <h2 id="cookie-settings-title" className="font-display text-2xl text-cherie-ink">
        Teknik tercihler
      </h2>
      <div className="mt-6 space-y-4">
        <Preference
          label="Gerekli"
          description="Oturum, güvenlik ve tercih kaydı için zorunludur."
          checked
          disabled
          onChange={() => undefined}
        />
        <Preference
          label="Analitik"
          description="İzin verilirse birinci taraf kullanım ölçümüne olanak tanır."
          checked={analytics}
          onChange={setAnalytics}
        />
        <Preference
          label="Pazarlama"
          description="İzin verilmedikçe pazarlama amaçlı teknikler çalıştırılmaz."
          checked={marketing}
          onChange={setMarketing}
        />
      </div>
      <div className="mt-6 flex items-center gap-4">
        <Button onClick={save}>Tercihleri Kaydet</Button>
        {saved && <p role="status" className="text-sm text-cherie-success">Tercihler kaydedildi.</p>}
      </div>
    </section>
  );
}

function Preference({
  label,
  description,
  checked,
  disabled = false,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3 rounded-control border border-cherie-lace p-4">
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="cherie-check mt-1"
      />
      <span>
        <span className="block font-semibold text-cherie-ink">{label}</span>
        <span className="mt-1 block text-sm text-cherie-soft-ink">{description}</span>
      </span>
    </label>
  );
}
