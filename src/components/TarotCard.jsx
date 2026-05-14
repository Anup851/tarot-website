export default function TarotCard({ card, isFlipped, onClick }) {
  return (
    <button className={`tarot-card ${isFlipped ? 'is-flipped' : ''}`} onClick={onClick} type="button">
      <span className="tarot-card-inner block">
        <span className="tarot-card-face flex flex-col justify-between border-violet-300/60 bg-slate-950 text-white dark:border-amber-200/40">
          <span className="flex items-center justify-between text-[10px] uppercase tracking-[0.32em] text-violet-100">
            Oracle
            <span>{card.id.slice(0, 2).toUpperCase()}</span>
          </span>
          <span className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-white/20 bg-white/10">
            <span className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-300 via-fuchsia-300 to-amber-200 shadow-[0_0_45px_rgba(216,180,254,0.7)]" />
          </span>
          <span className="h-20 rounded-xl border border-white/10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.16),transparent_58%)]" />
        </span>

        <span className="tarot-card-face tarot-card-back flex flex-col justify-between border-slate-200 bg-white text-left text-slate-950 dark:border-white/10 dark:bg-slate-900 dark:text-white">
          <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-violet-600 dark:text-amber-200">
            {card.theme}
          </span>
          <span>
            <span className="block text-lg font-bold leading-tight">{card.name}</span>
            <span className="mt-3 block text-sm leading-6 text-slate-600 dark:text-slate-300">{card.meaning}</span>
          </span>
          <span className="h-1 w-16 rounded-full bg-gradient-to-r from-violet-500 to-rose-500" />
        </span>
      </span>
    </button>
  )
}
