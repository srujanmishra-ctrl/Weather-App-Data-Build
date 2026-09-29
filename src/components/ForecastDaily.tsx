import React from 'react';
import { WeatherApiResponse } from '../types/weather';
import { getWeatherInfo } from '../utils/weatherCodes';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Droplets,
  Wind,
} from 'lucide-react';

interface ForecastDailyProps {
  data: WeatherApiResponse;
  selectedDayIndex: number;
  onSelectDay: (index: number) => void;
}

export const ForecastDaily: React.FC<ForecastDailyProps> = ({
  data,
  selectedDayIndex,
  onSelectDay,
}) => {
  const daily = data.daily;
  const tempUnit = data.daily_units.temperature_2m_max || '°C';
  const windUnit = data.daily_units.wind_speed_10m_max || 'km/h';

  // Overall min and max across all 7 days for normalized temperature bar rendering
  const allMins = daily.temperature_2m_min || [];
  const allMaxs = daily.temperature_2m_max || [];
  const absoluteMin = Math.min(...allMins);
  const absoluteMax = Math.max(...allMaxs);
  const totalRange = Math.max(1, absoluteMax - absoluteMin);

  const renderWeatherIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case 'Sun':
        return <Sun className={className} />;
      case 'CloudSun':
        return <CloudSun className={className} />;
      case 'Cloud':
        return <Cloud className={className} />;
      case 'CloudFog':
        return <CloudFog className={className} />;
      case 'CloudDrizzle':
        return <CloudDrizzle className={className} />;
      case 'CloudRain':
        return <CloudRain className={className} />;
      case 'CloudSnow':
        return <CloudSnow className={className} />;
      case 'CloudLightning':
      case 'CloudHail':
        return <CloudLightning className={className} />;
      default:
        return <Sun className={className} />;
    }
  };

  return (
    <section id="daily-forecast" className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white">
            7-Day Synoptic Outlook
          </h2>
          <p className="text-xs text-slate-400">
            Select any day to inspect detailed 24-hour atmospheric breakdown
          </p>
        </div>
        <div className="text-xs text-slate-400">
          Showing 7 consecutive cycles
        </div>
      </div>

      {/* Grid of 7 Day Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
        {daily.time.slice(0, 7).map((dateStr, idx) => {
          const date = new Date(dateStr + 'T00:00:00');
          const isToday = idx === 0;
          const isSelected = selectedDayIndex === idx;
          const code = daily.weather_code[idx] ?? 0;
          const info = getWeatherInfo(code);
          const maxTemp = Math.round(daily.temperature_2m_max[idx]);
          const minTemp = Math.round(daily.temperature_2m_min[idx]);
          const precipProb = daily.precipitation_probability_max?.[idx] ?? 0;
          const maxWind = Math.round(daily.wind_speed_10m_max?.[idx] ?? 0);

          // Bar offset calculations
          const leftPercent = ((minTemp - absoluteMin) / totalRange) * 100;
          const barWidthPercent = Math.max(15, ((maxTemp - minTemp) / totalRange) * 100);

          const weekday = isToday
            ? 'Today'
            : date.toLocaleDateString([], { weekday: 'short' });
          const formattedDate = date.toLocaleDateString([], {
            month: 'short',
            day: 'numeric',
          });

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onSelectDay(idx)}
              className={`group flex flex-col justify-between rounded-xl p-3.5 text-left transition-all relative overflow-hidden ${
                isSelected
                  ? 'bg-slate-900 ring-2 ring-sky-500 shadow-lg shadow-sky-500/10'
                  : 'bg-slate-900/60 ring-1 ring-slate-800/80 hover:bg-slate-900 hover:ring-slate-700/80'
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 to-indigo-500" />
              )}

              {/* Day Header */}
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-semibold ${
                      isSelected ? 'text-sky-300' : 'text-slate-200'
                    }`}
                  >
                    {weekday}
                  </span>
                  <span className="text-[10px] text-slate-400">{formattedDate}</span>
                </div>

                {/* Weather Icon and Short Label */}
                <div className="mt-3 flex flex-col items-center py-1">
                  <div className="text-sky-400 group-hover:scale-105 transition-transform">
                    {renderWeatherIcon(info.iconName, 'h-7 w-7')}
                  </div>
                  <span className="mt-1.5 text-center text-[11px] font-medium text-slate-300 line-clamp-1">
                    {info.label}
                  </span>
                </div>
              </div>

              {/* Temperature Bar & Figures */}
              <div className="mt-3 space-y-2 border-t border-slate-800/80 pt-2.5">
                <div className="flex items-center justify-between text-xs font-tabular">
                  <span className="font-semibold text-white">{maxTemp}°</span>
                  <span className="text-slate-400">{minTemp}°</span>
                </div>

                {/* Visual Temperature Distribution Bar */}
                <div className="h-1.5 w-full rounded-full bg-slate-800 relative overflow-hidden">
                  <div
                    className="absolute h-full rounded-full bg-gradient-to-r from-sky-400 to-amber-400"
                    style={{
                      left: `${Math.max(0, leftPercent)}%`,
                      width: `${Math.min(100 - leftPercent, barWidthPercent)}%`,
                    }}
                  />
                </div>

                {/* Rain probability & Wind Speed stats */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                  <div className="flex items-center gap-1">
                    <Droplets className="h-3 w-3 text-sky-400" />
                    <span className="font-tabular">{precipProb}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Wind className="h-3 w-3 text-slate-400" />
                    <span className="font-tabular">{maxWind}</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
