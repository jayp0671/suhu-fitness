import { formatNiceDate, getLocalDate } from "@/lib/utils";

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-6 flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-[#c8f065]">{formatNiceDate(getLocalDate())}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">{title}</h1>
        {subtitle ? <p className="mt-2 text-sm leading-6 text-neutral-400">{subtitle}</p> : null}
      </div>
    </header>
  );
}
