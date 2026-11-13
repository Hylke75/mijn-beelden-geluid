import { useEffect, useRef, useState } from 'react'
import { Pause, Play, RotateCcw } from 'lucide-react'
import type { DemoMedia } from '../data/types'
import { Img } from './ui'
import { Waveform } from './Media'
import { cx, fmtDuration } from '../lib/format'

/** Voorbeeldspeler: er wordt geen echt beeld/geluid afgespeeld, wel een transcript in de tijd. */
export function DemoPlayer({ m, dark }: { m: DemoMedia; dark?: boolean }) {
  const [playing, setPlaying] = useState(false)
  const [t, setT] = useState(0)
  const dur = m.duration ?? 30
  const raf = useRef<number | null>(null)
  const last = useRef<number>(0)
  useEffect(() => { setPlaying(false); setT(0) }, [m.id])
  useEffect(() => {
    if (!playing) return
    last.current = performance.now()
    const tick = (now: number) => {
      setT((x) => {
        const n = x + (now - last.current) / 1000
        last.current = now
        if (n >= dur) { setPlaying(false); return dur }
        return n
      })
      raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [playing, dur])
  const lines = m.transcript ?? []
  const idx = Math.min(lines.length - 1, Math.floor((t / dur) * lines.length))
  const done = t >= dur
  const toggle = () => { if (done) { setT(0); setPlaying(true) } else setPlaying((p) => !p) }

  return (
    <div className={cx('relative w-full h-full flex flex-col', dark ? 'text-white' : '')}>
      <div className="relative flex-1 min-h-0 rounded-2xl overflow-hidden bg-black">
        {m.kind === 'video' ? (
          <div className={cx('absolute inset-0', playing && 'animate-kenburns')} style={{ animationPlayState: playing ? 'running' : 'paused' }}>
            <Img src={m.src} alt={m.alt} eager era={m.era} grain className="absolute inset-0" imgClassName="object-contain" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#2a47c9,#142348_70%)] flex items-center justify-center p-8">
            <Waveform seed={m.id} progress={t / dur} className="w-full max-w-xl h-28 text-white/50" bars={64} />
          </div>
        )}
        <span className="absolute top-3 left-3 pill bg-[#FFF3D6] text-[#6B4A00]">Voorbeeld · {m.kind === 'video' ? 'geen echte video' : 'geen echte opname'}</span>
        {lines.length > 0 && (playing || t > 0) && (
          <div className="absolute left-0 right-0 bottom-0 p-5 bg-gradient-to-t from-black/80 to-transparent">
            <p className="text-white text-center text-[17px] leading-snug max-w-2xl mx-auto animate-fadeIn" key={idx}>{lines[Math.max(0, idx)]}</p>
          </div>
        )}
        {!playing && t === 0 && (
          <button onClick={toggle} className="absolute inset-0 flex items-center justify-center group" aria-label={`Speel voorbeeld af: ${m.title}`}>
            <span className="h-20 w-20 rounded-full bg-white/95 text-ink flex items-center justify-center shadow-lift group-hover:scale-105 transition-transform"><Play size={32} fill="currentColor" className="ml-1" /></span>
          </button>
        )}
      </div>
      <div className="flex items-center gap-3 pt-3">
        <button onClick={toggle} className={cx('h-11 w-11 rounded-full flex items-center justify-center shrink-0', dark ? 'bg-white text-ink' : 'bg-brand text-white')} aria-label={playing ? 'Pauzeer' : done ? 'Opnieuw afspelen' : 'Afspelen'}>
          {playing ? <Pause size={20} fill="currentColor" /> : done ? <RotateCcw size={19} /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
        </button>
        <input type="range" min={0} max={dur} step={0.1} value={t} onChange={(e) => setT(Number(e.target.value))} aria-label="Positie in voorbeeld"
          className="flex-1 accent-[#E60088]" />
        <span className={cx('text-sm tabular-nums w-[88px] text-right', dark ? 'text-white/80' : 'text-meta')}>{fmtDuration(t)} / {fmtDuration(dur)}</span>
      </div>
    </div>
  )
}
