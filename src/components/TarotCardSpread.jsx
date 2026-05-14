import { RefreshCcw, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { tarotDeck } from '../data/siteData'
import ScrollReveal from './ScrollReveal'
import TarotCard from './TarotCard'

const spreadPositions = ['Past pattern', 'Present energy', 'Next action']

export default function TarotCardSpread() {
  const [flipped, setFlipped] = useState({})
  const [seed, setSeed] = useState(1)

  const cards = useMemo(() => {
    return [...tarotDeck].sort((a, b) => (a.id + seed).localeCompare(b.id + seed)).slice(0, 3)
  }, [seed])

  const resetCards = () => {
    setFlipped({})
    setSeed((value) => value + 1)
  }

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white/70 p-5 shadow-sm dark:border-white/10 dark:bg-white/[0.04] sm:p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.24em] text-violet-700 dark:text-amber-200">
            <Sparkles size={16} />
            Daily Card Pull
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Choose your three-card message.</h2>
        </div>
        <button className="btn-secondary w-full sm:w-auto" onClick={resetCards} type="button">
          <RefreshCcw size={16} />
          New spread
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {cards.map((card, index) => (
          <ScrollReveal key={card.id} delay={index * 120} className="depth-hover flex flex-col items-center gap-4 rounded-3xl bg-stone-100/80 p-5 dark:bg-slate-950/50">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              {spreadPositions[index]}
            </p>
            <TarotCard card={card} isFlipped={Boolean(flipped[card.id])} onClick={() => setFlipped((prev) => ({ ...prev, [card.id]: !prev[card.id] }))} />
          </ScrollReveal>
        ))}
      </div>
    </div>
  )
}
