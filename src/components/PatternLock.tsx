import { cn } from "@/lib/utils";

/** Desenho de senha em grade 3x3. O valor é a sequência de pontos, ex.: "1-2-5-8". */
export function PatternLock({
  value,
  onChange,
  readOnly = false,
}: {
  value: string;
  onChange?: (next: string) => void;
  readOnly?: boolean;
}) {
  const seq = value ? value.split("-").filter(Boolean) : [];

  function toggle(point: string) {
    if (readOnly || !onChange) return;
    if (seq[seq.length - 1] === point) {
      onChange(seq.slice(0, -1).join("-"));
      return;
    }
    if (seq.includes(point)) return;
    onChange([...seq, point].join("-"));
  }

  return (
    <div className="inline-block">
      <div className="grid w-48 grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((p) => {
          const index = seq.indexOf(p);
          const active = index >= 0;
          return (
            <button
              key={p}
              type="button"
              onClick={() => toggle(p)}
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full border text-sm font-bold transition-all",
                active
                  ? "border-primary bg-brand-gradient text-primary-foreground"
                  : "border-border bg-surface text-muted-foreground hover:border-primary/60",
              )}
            >
              {active ? index + 1 : ""}
            </button>
          );
        })}
      </div>
      {!readOnly ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Toque nos pontos na ordem do desenho. Toque no último ponto para desfazer.
        </p>
      ) : null}
    </div>
  );
}
