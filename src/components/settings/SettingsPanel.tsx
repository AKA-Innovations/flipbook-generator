import { AnimatePresence, motion } from 'framer-motion';
import { FiX } from 'react-icons/fi';
import { useBookStore } from '@/store/bookStore';
import { useAppStore } from '@/store/appStore';

const ACCENT_PRESETS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#ef4444'];

export function SettingsPanel() {
  const settingsOpen = useBookStore((s) => s.settingsOpen);
  const toggleSettings = useBookStore((s) => s.toggleSettings);
  const settings = useBookStore((s) => s.settings);
  const updateSettings = useBookStore((s) => s.updateSettings);
  const logoDataUrl = useBookStore((s) => s.logoDataUrl);
  const setLogoDataUrl = useBookStore((s) => s.setLogoDataUrl);
  const footerText = useBookStore((s) => s.footerText);
  const setFooterText = useBookStore((s) => s.setFooterText);
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setLogoDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <AnimatePresence>
      {settingsOpen && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/30 z-30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => toggleSettings(false)}
          />
          <motion.div
            initial={{ x: 320 }}
            animate={{ x: 0 }}
            exit={{ x: 320 }}
            transition={{ type: 'tween', duration: 0.2 }}
            className="fixed right-0 top-0 h-full w-80 z-40 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-5 overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold">Settings</h2>
              <button onClick={() => toggleSettings(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                <FiX />
              </button>
            </div>

            <Section title="Appearance">
              <Row label="Theme">
                <SegmentedToggle
                  options={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]}
                  value={theme}
                  onChange={(v) => setTheme(v as 'light' | 'dark')}
                />
              </Row>
              <Row label="Accent color">
                <div className="flex gap-2">
                  {ACCENT_PRESETS.map((color) => (
                    <button
                      key={color}
                      onClick={() => updateSettings({ accentColor: color })}
                      className="h-6 w-6 rounded-full ring-offset-2 dark:ring-offset-slate-900"
                      style={{
                        backgroundColor: color,
                        boxShadow: settings.accentColor === color ? `0 0 0 2px ${color}` : undefined,
                      }}
                    />
                  ))}
                </div>
              </Row>
            </Section>

            <Section title="Layout">
              <Row label="Page mode">
                <SegmentedToggle
                  options={[{ value: 'single', label: 'Single' }, { value: 'double', label: 'Double' }]}
                  value={settings.viewMode}
                  onChange={(v) => updateSettings({ viewMode: v as 'single' | 'double' })}
                />
              </Row>
              <ToggleRow label="Hard cover" checked={settings.hardCover} onChange={(v) => updateSettings({ hardCover: v })} />
              <ToggleRow label="Show cover page" checked={settings.showCover} onChange={(v) => updateSettings({ showCover: v })} />
              <ToggleRow label="Right-to-left reading" checked={settings.rtl} onChange={(v) => updateSettings({ rtl: v })} />
              <SliderRow
                label="Page gap"
                value={settings.pageGap}
                min={0}
                max={40}
                onChange={(v) => updateSettings({ pageGap: v })}
              />
            </Section>

            <Section title="Animation">
              <SliderRow
                label="Flip speed (ms)"
                value={settings.animationSpeedMs}
                min={200}
                max={1200}
                step={50}
                onChange={(v) => updateSettings({ animationSpeedMs: v })}
              />
              <SliderRow
                label="Shadow intensity"
                value={settings.shadowIntensity}
                min={0}
                max={1}
                step={0.05}
                onChange={(v) => updateSettings({ shadowIntensity: v })}
              />
              <ToggleRow label="Page flip sound" checked={settings.soundEnabled} onChange={(v) => updateSettings({ soundEnabled: v })} />
            </Section>

            <Section title="Branding">
              <Row label="Custom Logo">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="cursor-pointer text-xs font-semibold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  {logoDataUrl ? 'Change' : 'Upload'}
                </label>
              </Row>
              {logoDataUrl && (
                <div className="flex items-center justify-between mt-1 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-lg">
                  <img src={logoDataUrl} alt="Logo" className="h-8 max-w-[120px] object-contain" />
                  <button
                    onClick={() => setLogoDataUrl(null)}
                    className="text-xs text-red-500 hover:underline font-medium"
                  >
                    Remove
                  </button>
                </div>
              )}
              <div className="mt-3">
                <span className="text-sm block mb-1">Footer text</span>
                <input
                  type="text"
                  placeholder="Designed and maintained by AKA Innovations"
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent text-xs focus:outline-none focus:border-accent text-slate-700 dark:text-slate-300"
                />
              </div>
            </Section>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs uppercase tracking-wide text-slate-400 mb-2">{title}</h3>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      {children}
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <Row label={label}>
      <button
        onClick={() => onChange(!checked)}
        className={`w-10 h-6 rounded-full transition-colors relative flex-shrink-0 ${checked ? 'bg-accent' : 'bg-slate-300 dark:bg-slate-700'}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${checked ? 'translate-x-4.5' : 'translate-x-0.5'}`}
        />
      </button>
    </Row>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm">{label}</span>
        <span className="text-xs text-slate-400 tabular-nums">{value}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-accent"
      />
    </div>
  );
}

function SegmentedToggle({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="inline-flex rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1 rounded-md text-xs transition-colors ${
            value === opt.value ? 'bg-white dark:bg-slate-700 shadow-sm' : 'text-slate-500'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
