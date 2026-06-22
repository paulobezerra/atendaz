export interface Step {
  key: string;
  label: string;
  descricao?: string;
}

/** Stepper vertical (docs/10): estados concluído / atual / futuro. */
export default function Stepper({
  steps,
  current,
}: {
  steps: Step[];
  current: number;
}) {
  return (
    <ol>
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        const last = i === steps.length - 1;
        return (
          <li key={s.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={[
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                  done ? "bg-indigo-400 text-indigo-950" : "",
                  active ? "border-2 border-white bg-white text-indigo-900" : "",
                  !done && !active
                    ? "border border-indigo-400 text-indigo-300 opacity-60"
                    : "",
                ].join(" ")}
              >
                {done ? "✓" : i + 1}
              </span>
              {!last && (
                <span
                  className={`my-1 w-px flex-1 ${done ? "bg-indigo-400" : "bg-indigo-400/30"}`}
                  style={{ minHeight: 24 }}
                />
              )}
            </div>
            <div className="pb-6">
              <p
                className={
                  active
                    ? "font-semibold text-white"
                    : done
                      ? "text-indigo-200"
                      : "text-indigo-300 opacity-60"
                }
              >
                {s.label}
              </p>
              {active && s.descricao && (
                <p className="mt-0.5 text-sm text-indigo-200">{s.descricao}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
