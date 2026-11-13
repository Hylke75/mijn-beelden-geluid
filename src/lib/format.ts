const MONTHS = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december']
export const fmtDate = (iso: string) => {
  const d = new Date(iso + (iso.length === 10 ? 'T12:00:00' : ''))
  if (Number.isNaN(d.getTime())) return iso
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}
export const fmtMonthYear = (iso: string) => {
  const d = new Date(iso + 'T12:00:00')
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}
export const monthName = (m: number) => MONTHS[m]
export const yearOf = (iso: string) => Number(iso.slice(0, 4))
export const fmtDuration = (s?: number) => (s == null ? '' : `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`)
export const plural = (n: number, one: string, many: string) => `${n.toLocaleString('nl-NL')} ${n === 1 ? one : many}`
export const cx = (...c: (string | false | null | undefined)[]) => c.filter(Boolean).join(' ')
export const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
