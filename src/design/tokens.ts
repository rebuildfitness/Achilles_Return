import tokens from "../../spec/design-tokens-v1.json";

export function applyDesignTokens() {
  const root = document.documentElement;
  const set = (name: string, value: string | number) =>
    root.style.setProperty(`--${name}`, String(value));
  Object.entries(tokens.colors).forEach(([name, value]) => set(name, value));
  Object.entries(tokens.radii).forEach(([name, value]) =>
    set(`radius-${name}`, `${value}px`),
  );
  tokens.spacing.forEach((value) => set(`space-${value}`, `${value}px`));
  Object.entries(tokens.layout).forEach(([name, value]) =>
    set(name, `${value}px`),
  );
  set("font-family", tokens.type.family);
  Object.entries(tokens.type).forEach(([name, value]) => {
    if (typeof value === "string") return;
    set(`type-${name}-size`, `${value.size / 16}rem`);
    set(`type-${name}-weight`, value.weight);
    set(`type-${name}-line`, value.lineHeight);
  });
  set("shadow", tokens.shadow);
}
