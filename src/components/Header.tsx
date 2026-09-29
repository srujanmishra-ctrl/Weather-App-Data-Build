import React from 'react';
import { UnitPreferences } from '../types/weather';
import { CloudSun, Navigation, RefreshCw } from 'lucide-react';

interface HeaderProps {
  units: UnitPreferences;
  onUpdateUnits: (newUnits: Partial<UnitPreferences>) => void;
  onLocateMe: () => void;
  onRefresh: () => void;
  isLocating: boolean;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  units,
  onUpdateUnits,
  onLocateMe,
  onRefresh,
  isLocating,
  isLoading,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Brand title, one line wordmark */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 text-sky-400 ring-1 ring-sky-500/20">
            <CloudSun className="h-4.5 w-4.5" />
          </div>
          <span className="text-base font-semibold tracking-tight text-slate-100">
            Aura Weather
          </span>
        </div>

        {/* Zone 2: 4 nav links, clean text with subtle hover underlines */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-400">
          <a
            href="#current-overview"
            className="hover:text-slate-100 transition-colors whitespace-nowrap"
          >
            Overview
          </a>
          <a
            href="#daily-forecast"
            className="hover:text-slate-100 transition-colors whitespace-nowrap"
          >
            7-Day Forecast
          </a>
          <a
            href="#weather-charts"
            className="hover:text-slate-100 transition-colors whitespace-nowrap"
          >
            Atmospheric Trends
          </a>
          <a
            href="#planning-intelligence"
            className="hover:text-slate-100 transition-colors whitespace-nowrap"
          >
            Planning Intelligence
          </a>
        </nav>

        {/* Zone 3: Primary interactive controls & unit toggles */}
        <div className="flex items-center gap-2">
          {/* Unit Toggle: Celsius / Fahrenheit */}
          <div className="flex items-center rounded-lg bg-slate-900 p-0.5 ring-1 ring-slate-800">
            <button
              type="button"
              onClick={() => onUpdateUnits({ temperature: 'celsius', windSpeed: 'kmh', precipitation: 'mm' })}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                units.temperature === 'celsius'
                  ? 'bg-slate-800 text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Metric (°C, km/h, mm)"
            >
              °C
            </button>
            <button
              type="button"
              onClick={() => onUpdateUnits({ temperature: 'fahrenheit', windSpeed: 'mph', precipitation: 'inch' })}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                units.temperature === 'fahrenheit'
                  ? 'bg-slate-800 text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Imperial (°F, mph, in)"
            >
              °F
            </button>
          </div>

          {/* Current Geolocation Trigger */}
          <button
            type="button"
            onClick={onLocateMe}
            disabled={isLocating}
            className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 ring-1 ring-slate-800 hover:bg-slate-800/80 hover:text-white transition-colors disabled:opacity-50"
            title="Locate via GPS"
          >
            <Navigation className={`h-3.5 w-3.5 ${isLocating ? 'animate-spin text-sky-400' : 'text-slate-400'}`} />
            <span className="hidden sm:inline">My Location</span>
          </button>

          {/* Refresh Data */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-slate-400 ring-1 ring-slate-800 hover:bg-slate-800/80 hover:text-slate-100 transition-colors disabled:opacity-50"
            title="Refresh forecast"
            aria-label="Refresh forecast"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin text-sky-400' : ''}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
