export function SectionSwitch({
  value,
  options,
  onChange,
  label,
}: {
  value: string;
  options: [string, string][];
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <div className="section-switch" role="group" aria-label={label}>
      {options.map(([id, title]) => (
        <button
          key={id}
          aria-pressed={value === id}
          onClick={() => onChange(id)}
        >
          {title}
        </button>
      ))}
    </div>
  );
}
