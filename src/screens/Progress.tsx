import { useMemo, useState } from 'react'
import { Flame } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Screen } from '../components/Screen'
import { TipBanner } from '../components/TipBanner'
import { usePlans } from '../state/useAppData'
import { MEAL_LABELS, MEAL_TYPES } from '../types'
import {
  completionPercent,
  computeStreaks,
  dailyMealSlots,
  loggedMealsInRange,
  loggedMealsOnDate,
  monthWeekChartData,
  weekChartData,
} from '../lib/progressStats'
import { formatMonthYear, todayISO, weekDates, weekStart } from '../lib/dates'

type Period = 'daily' | 'weekly' | 'monthly'

const PERIOD_LABELS: Record<Period, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
}

function PeriodToggle({
  value,
  onChange,
}: {
  value: Period
  onChange: (p: Period) => void
}) {
  return (
    <div
      className="flex w-full rounded-full border border-line bg-paper p-1"
      role="tablist"
      aria-label="Progress period"
    >
      {(['daily', 'weekly', 'monthly'] as Period[]).map((period) => {
        const selected = value === period
        return (
          <button
            key={period}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(period)}
            className={`flex-1 rounded-full py-2 text-sm font-extrabold transition-colors ${
              selected ? 'bg-brand text-white shadow-card' : 'text-ink-soft active:bg-cream-dark'
            }`}
          >
            {PERIOD_LABELS[period]}
          </button>
        )
      })}
    </div>
  )
}

function BarChart({
  bars,
  max,
}: {
  bars: { label: string; value: number }[]
  max: number
}) {
  const cap = Math.max(max, 1)
  const barMaxPx = 112
  return (
    <div className="mt-4 flex items-end justify-between gap-1.5">
      {bars.map(({ label, value }) => {
        const height = value === 0 ? 4 : Math.max(12, Math.round((value / cap) * barMaxPx))
        return (
          <div key={label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <span className="text-[11px] font-bold text-brand">{value > 0 ? value : ''}</span>
            <div
              className="w-full max-w-[2rem] rounded-t-lg bg-brand transition-all"
              style={{ height: `${height}px` }}
            />
            <span className="text-[10px] font-bold text-muted">{label}</span>
          </div>
        )
      })}
    </div>
  )
}

function StreakCard({ title, days }: { title: string; days: number }) {
  return (
    <div className="flex flex-1 items-center gap-3 rounded-card border border-line-soft bg-paper p-4 shadow-card">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-100">
        <Flame size={22} className="text-orange-500" fill="currentColor" />
      </span>
      <div>
        <p className="text-[12px] font-bold text-muted">{title}</p>
        <p className="text-[22px] font-extrabold leading-tight text-ink">
          {days} <span className="text-[14px] font-bold text-ink-soft">days</span>
        </p>
      </div>
    </div>
  )
}

export function Progress() {
  const navigate = useNavigate()
  const plans = usePlans()
  const today = todayISO()
  const [period, setPeriod] = useState<Period>('weekly')

  const streaks = useMemo(() => computeStreaks(plans, today), [plans, today])

  const weeklyDays = weekDates(weekStart(today))
  const weekLogged = loggedMealsInRange(plans, weeklyDays)
  const weekTotal = weeklyDays.length * MEAL_TYPES.length
  const weekPercent = completionPercent(weekLogged, weekTotal)

  const weekBars = useMemo(
    () => weekChartData(plans, today).map((d) => ({ label: d.label, value: d.meals })),
    [plans, today],
  )

  const monthBars = useMemo(
    () => monthWeekChartData(plans, today).map((w) => ({ label: w.label, value: w.meals })),
    [plans, today],
  )

  const todaySlots = useMemo(() => dailyMealSlots(plans, today), [plans, today])
  const todayLogged = loggedMealsOnDate(plans, today)
  const todayPercent = completionPercent(todayLogged, MEAL_TYPES.length)

  return (
    <Screen withNav>
      <h1 className="pt-6 text-[22px] font-extrabold text-ink">Progress</h1>
      <p className="mt-1 text-[15px] font-semibold text-ink-soft">Meals logged over time</p>

      <div className="mt-4">
        <PeriodToggle value={period} onChange={setPeriod} />
      </div>

      {period === 'daily' && (
        <>
          <div className="mt-5 rounded-card border border-line-soft bg-paper p-5 shadow-card">
            <p className="text-[13px] font-bold text-muted">Today</p>
            <p className="mt-1 text-[42px] leading-none font-extrabold text-brand">{todayPercent}%</p>
            <p className="mt-2 text-[14px] font-semibold text-ink-soft">
              {todayLogged} of {MEAL_TYPES.length} meals logged
            </p>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-cream-dark">
              <div
                className="h-full rounded-full bg-brand transition-all"
                style={{ width: `${todayPercent}%` }}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {todaySlots.map(({ meal, logged }) => (
              <button
                key={meal}
                type="button"
                onClick={() => {
                  if (logged) {
                    navigate(`/meal/${today}/${meal}?mode=logged`)
                    return
                  }
                  navigate(`/add?date=${today}&meal=${meal}&mode=logged&returnTo=home`)
                }}
                className={`flex items-center justify-between rounded-card border px-4 py-3 text-left shadow-card active:opacity-90 ${
                  logged ? 'border-brand/30 bg-brand-tint/40' : 'border-line-soft bg-paper'
                }`}
              >
                <span className="text-[15px] font-bold text-ink">{MEAL_LABELS[meal]}</span>
                <span
                  className={`text-[13px] font-extrabold ${logged ? 'text-brand' : 'text-muted'}`}
                >
                  {logged ? 'Logged' : 'Add now'}
                </span>
              </button>
            ))}
          </div>
        </>
      )}

      {period === 'weekly' && (
        <>
          <div className="mt-5 rounded-card border border-line-soft bg-paper p-5 shadow-card">
            <p className="text-[13px] font-bold text-muted">Meals logged</p>
            <p className="mt-1 text-[42px] leading-none font-extrabold text-brand">{weekPercent}%</p>
            <p className="mt-2 text-[14px] font-semibold text-ink-soft">
              {weekLogged} of {weekTotal} meals this week
            </p>
            <BarChart bars={weekBars} max={MEAL_TYPES.length} />
          </div>
        </>
      )}

      {period === 'monthly' && (
        <div className="mt-5 rounded-card border border-line-soft bg-paper p-5 shadow-card">
          <p className="text-[13px] font-bold text-muted">{formatMonthYear(today)}</p>
          <p className="mt-2 text-[14px] font-semibold text-ink-soft">Meals logged by week</p>
          <BarChart bars={monthBars} max={monthBars.reduce((m, b) => Math.max(m, b.value), 0)} />
        </div>
      )}

      <div className="mt-4 flex gap-3">
        <StreakCard title="Current streak" days={streaks.current} />
        <StreakCard title="Best streak" days={streaks.best} />
      </div>

      <div className="mt-4 pb-2">
        <TipBanner mascot="mascot-broccoli">
          Keep logging meals to build healthy habits.
        </TipBanner>
      </div>
    </Screen>
  )
}
