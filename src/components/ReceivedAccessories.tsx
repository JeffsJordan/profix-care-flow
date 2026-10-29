import { accessoriesFor } from "@/lib/profix";

export function ReceivedAccessories({ deviceType, value, onChange, disabled = false }: {
  deviceType: string;
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}) {
  const options = Array.from(new Set([...accessoriesFor(deviceType), ...value]));
  return (
    <fieldset disabled={disabled}>
      <legend className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Acessórios entregues pelo cliente · {deviceType || "Aparelho"}
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((item) => (
          <label key={item} className="flex cursor-pointer items-center gap-3 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 shrink-0 accent-primary"
              checked={value.includes(item)}
              onChange={(e) => onChange(e.target.checked ? [...value, item] : value.filter((v) => v !== item))}
            />
            {item}
          </label>
        ))}
      </div>
    </fieldset>
  );
}