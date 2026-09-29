import React from 'react';
import { WeatherIntelligence } from '../types/weather';
import {
  Activity,
  Car,
  Shirt,
  Sun,
  Umbrella,
  Wind,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  Clock,
  Compass,
} from 'lucide-react';

interface PlanningIntelligenceProps {
  intelligence: WeatherIntelligence;
}

export const PlanningIntelligence: React.FC<PlanningIntelligenceProps> = ({ intelligence }) => {
  const {
    outdoorScore,
    outdoorLevel,
    outdoorSummary,
    bestOutdoorHours,
    commuteRisk,
    commuteSummary,
    roadConditions,
    clothingAdvice,
    uvGuidance,
    umbrellaAdvice,
    carWashIndex,
    ventilationIndex,
    goldenHour,
  } = intelligence;

  // Outdoor score visual colors
  const outdoorColor =
    outdoorScore >= 80
      ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10'
      : outdoorScore >= 60
      ? 'text-sky-400 border-sky-500/20 bg-sky-500/10'
      : outdoorScore >= 40
      ? 'text-amber-400 border-amber-500/20 bg-amber-500/10'
      : 'text-rose-400 border-rose-500/20 bg-rose-500/10';

  const commuteColor =
    commuteRisk === 'Low'
      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
      : commuteRisk === 'Moderate'
      ? 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      : 'text-rose-400 bg-rose-500/10 border-rose-500/20';

  const umbrellaColor =
    umbrellaAdvice.urgency === 'Essential'
      ? 'text-indigo-400 bg-indigo-500/15 border-indigo-500/30'
      : umbrellaAdvice.urgency === 'Recommended'
      ? 'text-sky-400 bg-sky-500/10 border-sky-500/20'
      : 'text-slate-400 bg-slate-800/60 border-slate-700/40';

  return (
    <section id="planning-intelligence" className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight text-white">
              Planning Intelligence & Decision Engine
            </h2>
            <span className="flex items-center gap-1 rounded bg-sky-500/10 px-2 py-0.5 text-[11px] font-medium text-sky-400 ring-1 ring-sky-500/20">
              <Sparkles className="h-3 w-3" /> Realtime Algorithmic Advice
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Meteorologically computed recommendations tailored to current conditions, UV index, and 7-day outlook
          </p>
        </div>
      </div>

      {/* Grid of Intelligence Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {/* Card 1: Outdoor Recreation & Sports Index */}
        <div className="rounded-xl bg-slate-900/80 p-5 ring-1 ring-slate-800/80 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/20">
                  <Activity className="h-4 w-4" />
                </div>
                <span>Outdoor Activity & Sports</span>
              </div>
              <span className={`rounded-md px-2 py-0.5 text-xs font-semibold border ${outdoorColor}`}>
                {outdoorLevel}
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-tabular text-4xl font-bold text-white">
                {outdoorScore}
              </span>
              <span className="text-xs text-slate-400">/ 100 Index</span>
            </div>

            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              {outdoorSummary}
            </p>
          </div>

          <div className="rounded-lg bg-slate-950/60 p-2.5 text-[11px] text-slate-400 border border-slate-800/60">
            <span className="text-slate-300 font-medium">Optimal Window Today:</span>{' '}
            <span className="text-sky-300 font-tabular">{bestOutdoorHours}</span>
          </div>
        </div>

        {/* Card 2: Commute & Highway Road Safety */}
        <div className="rounded-xl bg-slate-900/80 p-5 ring-1 ring-slate-800/80 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20">
                  <Car className="h-4 w-4" />
                </div>
                <span>Commute & Road Safety</span>
              </div>
              <span className={`rounded-md px-2 py-0.5 text-xs font-semibold border ${commuteColor}`}>
                {commuteRisk} Disruption
              </span>
            </div>

            <p className="mt-4 text-xs text-slate-300 leading-relaxed">
              {commuteSummary}
            </p>

            <div className="mt-3 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-400 border-t border-slate-800/80 pt-2">
                <span>Pavement State:</span>
                <span className="font-medium text-slate-200">{roadConditions}</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-slate-950/60 p-2.5 text-[11px] text-slate-400 border border-slate-800/60 flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>Regular highway transit intervals expected without major delays.</span>
          </div>
        </div>

        {/* Card 3: Wardrobe & Layering Strategy */}
        <div className="rounded-xl bg-slate-900/80 p-5 ring-1 ring-slate-800/80 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20">
                  <Shirt className="h-4 w-4" />
                </div>
                <span>Wardrobe & Layering Guide</span>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-300 leading-relaxed">
              {clothingAdvice.summary}
            </p>

            <div className="mt-3 space-y-2 text-xs border-t border-slate-800/80 pt-2.5">
              <div>
                <span className="text-[11px] text-slate-400">Layers: </span>
                <span className="text-slate-200 font-medium">{clothingAdvice.layers}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400">Outer Shell: </span>
                <span className="text-slate-200 font-medium">{clothingAdvice.outerwear}</span>
              </div>
            </div>
          </div>

          {clothingAdvice.accessories.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {clothingAdvice.accessories.map((acc, i) => (
                <span
                  key={i}
                  className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-300"
                >
                  {acc}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Card 4: Umbrella & Rain Readiness */}
        <div className="rounded-xl bg-slate-900/80 p-5 ring-1 ring-slate-800/80 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/20">
                  <Umbrella className="h-4 w-4" />
                </div>
                <span>Umbrella & Rain Readiness</span>
              </div>
              <span className={`rounded-md px-2 py-0.5 text-xs font-semibold border ${umbrellaColor}`}>
                {umbrellaAdvice.urgency}
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-tabular text-4xl font-bold text-white">
                {umbrellaAdvice.maxProbability}%
              </span>
              <span className="text-xs text-slate-400">Peak 12h Rain Risk</span>
            </div>

            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              {umbrellaAdvice.summary}
            </p>
          </div>

          <div className="rounded-lg bg-slate-950/60 p-2.5 text-[11px] text-slate-400 border border-slate-800/60">
            <span className="text-slate-300 font-medium">Precipitation Timeline:</span>{' '}
            <span>{umbrellaAdvice.timeframe}</span>
          </div>
        </div>

        {/* Card 5: Solar & UV Radiation Protocol */}
        <div className="rounded-xl bg-slate-900/80 p-5 ring-1 ring-slate-800/80 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20">
                  <Sun className="h-4 w-4" />
                </div>
                <span>Solar UV Exposure Protocol</span>
              </div>
              <span className="rounded-md bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 text-xs font-semibold text-amber-300">
                {uvGuidance.category} UV
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="font-tabular text-4xl font-bold text-white">
                {uvGuidance.maxIndex.toFixed(1)}
              </span>
              <span className="text-xs text-slate-400">Peak Daylight Value</span>
            </div>

            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              {uvGuidance.action}
            </p>
          </div>

          <div className="space-y-1 text-xs border-t border-slate-800/80 pt-2.5">
            <div className="flex items-center justify-between text-slate-400">
              <span>Sunscreen Factor:</span>
              <span className="font-medium text-slate-200">{uvGuidance.spfRecommendation}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Unprotected Threshold:</span>
              <span className="font-medium text-slate-200">{uvGuidance.burnTimeEstimate}</span>
            </div>
          </div>
        </div>

        {/* Card 6: Car Wash & Dry Streak Outlook */}
        <div className="rounded-xl bg-slate-900/80 p-5 ring-1 ring-slate-800/80 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                  <Car className="h-4 w-4" />
                </div>
                <span>Car Wash & Exterior Care</span>
              </div>
              <span className={`rounded-md px-2 py-0.5 text-xs font-semibold border ${
                carWashIndex.rating === 'Great Day'
                  ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10'
                  : carWashIndex.rating === 'Fair'
                  ? 'text-amber-400 border-amber-500/20 bg-amber-500/10'
                  : 'text-rose-400 border-rose-500/20 bg-rose-500/10'
              }`}>
                {carWashIndex.rating}
              </span>
            </div>

            <p className="mt-4 text-xs text-slate-300 leading-relaxed">
              {carWashIndex.reason}
            </p>

            <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-2.5">
              <span>Consecutive Dry Days:</span>
              <span className="font-tabular font-bold text-slate-200">
                {carWashIndex.consecutiveDryDays} Days
              </span>
            </div>
          </div>

          <div className="rounded-lg bg-slate-950/60 p-2.5 text-[11px] text-slate-400 border border-slate-800/60">
            {carWashIndex.consecutiveDryDays >= 2
              ? 'Excellent multi-day dry window ahead; washes will stay spotless.'
              : 'Hold off on detailing; wash likely to be compromised within 48h.'}
          </div>
        </div>

        {/* Card 7: Home Ventilation & Air Exchange */}
        <div className="rounded-xl bg-slate-900/80 p-5 ring-1 ring-slate-800/80 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/10 text-teal-400 ring-1 ring-teal-500/20">
                  <Wind className="h-4 w-4" />
                </div>
                <span>Natural Home Ventilation</span>
              </div>
              <span className="rounded-md bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 text-xs font-semibold text-teal-300">
                {ventilationIndex.status}
              </span>
            </div>

            <p className="mt-4 text-xs text-slate-300 leading-relaxed">
              {ventilationIndex.summary}
            </p>
          </div>

          <div className="rounded-lg bg-slate-950/60 p-2.5 text-[11px] text-slate-400 border border-slate-800/60">
            <span className="text-slate-300 font-medium">Optimal Window:</span>{' '}
            <span className="text-teal-300 font-tabular">{ventilationIndex.optimalWindow}</span>
          </div>
        </div>

        {/* Card 8: Photography Golden Hour & Dusk */}
        <div className="rounded-xl bg-slate-900/80 p-5 ring-1 ring-slate-800/80 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20">
                  <Camera className="h-4 w-4" />
                </div>
                <span>Golden Hour & Photography</span>
              </div>
            </div>

            <p className="mt-4 text-xs text-slate-300 leading-relaxed">
              {goldenHour.quality}
            </p>

            <div className="mt-3 space-y-1.5 text-xs border-t border-slate-800/80 pt-2.5">
              <div className="flex items-center justify-between text-slate-400">
                <span>Morning Golden Window:</span>
                <span className="font-tabular font-medium text-amber-300">{goldenHour.morning}</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>Evening Dusk Window:</span>
                <span className="font-tabular font-medium text-amber-300">{goldenHour.evening}</span>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-slate-950/60 p-2.5 text-[11px] text-slate-400 border border-slate-800/60 flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-sky-400 shrink-0" />
            <span>Optimal sun angle for portrait and architectural photography.</span>
          </div>
        </div>
      </div>
    </section>
  );
};
