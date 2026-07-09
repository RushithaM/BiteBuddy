import { CalendarDays } from 'lucide-react'
import { formatFullDate } from '../lib/dates'

/** Green date line under the Day Plan title. */
export function DayPlanDateLine({ date }: { date: string }) {
  return (
    <div className="-mt-1 flex items-center justify-center gap-2 pb-1">
      <CalendarDays size={17} strokeWidth={2.2} className="text-brand" />
      <span className="text-[15.5px] font-extrabold text-brand">{formatFullDate(date)}</span>
    </div>
  )
}
