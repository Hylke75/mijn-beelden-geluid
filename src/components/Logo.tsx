export function LogoMark({ size = 32, light }: { size?: number; light?: boolean }) {
  const c = light ? '#fff' : '#142348'
  return (
    <svg width={size * 1.9} height={size} viewBox="0 0 76 40" aria-hidden>
      <rect x="2" y="2" width="36" height="36" rx="3" fill="none" stroke={c} strokeWidth="4" />
      <rect x="11" y="11" width="18" height="18" fill="none" stroke={c} strokeWidth="4" />
      <rect x="17" y="17" width="6" height="6" fill={c} />
      <circle cx="58" cy="20" r="16" fill="none" stroke={c} strokeWidth="4" />
      <circle cx="58" cy="20" r="8" fill="none" stroke={c} strokeWidth="4" />
      <circle cx="58" cy="20" r="2.5" fill="#E60088" />
    </svg>
  )
}

export function Logo({ light }: { light?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <LogoMark size={22} light={light} />
      <span className={`leading-[1.05] font-display ${light ? 'text-white' : 'text-ink'}`}>
        <span className="block text-[11px] font-semibold tracking-wide opacity-70">Mijn</span>
        <span className="block text-[16px] font-bold -mt-0.5">Beeld &amp; Geluid</span>
      </span>
    </span>
  )
}
