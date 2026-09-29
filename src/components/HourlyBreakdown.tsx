import React from 'react';
import { WeatherApiResponse } from '../types/weather';
import { getWeatherInfo, getWindCompassDirection } from '../utils/weatherCodes';
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
  Navigation,
} from 'lucide-react';

interface HourlyBreakdownProps {
  data: WeatherApiResponse;
  selectedDayIndex: number;
}

export const HourlyBreakdown: React.FC<HourlyBreakdownProps> = ({
  data,
  selectedDayIndex,
}) => {
  const hourly = data.hourly;
  const tempUnit = data.current_units.temperature_2m || '°C';
  const windUnit = data.current_units.wind_speed_10m || 'km/h';

  // Get 24-hour slice for the selected day
  const startIndex = Math.min(selectedDayIndex * 24, Math.max(0, hourly.time.length - 24));
  const endIndex = Math.min(startIndex + 24, hourly.time.length);

  const selectedDayDate = data.daily.time[selectedDayIndex]
    ? new Date(data.daily.time[selectedDayIndex] + 'T00:00:00')
    : new Date();

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
    <section className="w-full space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-white">
            24-Hour Synoptic Progression
          </h3>
          <span className="text-xs text-slate-400">
            (
            {selectedDayIndex === 0
              ? 'Today'
              : selectedDayDate.toLocaleDateString([], {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                })}
            )
          </span>
        </div>
        <span className="text-xs text-slate-400">Scroll horizontally to inspect full diurnal cycle</span>
      </div>

      {/* Horizontal scrollable hourly timeline */}
      <div className="relative overflow-x-auto pb-2 scrollbar-thin">
        <div className="flex gap-2 min-w-max">
          {hourly.time.slice(startIndex, endIndex).map((timeStr, idx) => {
            const actualIdx = startIndex + idx;
            const time = new Date(timeStr);
            const hourLabel = time.toLocaleTimeString([], { hour: 'numeric' });
            const code = hourly.weather_code[actualIdx] ?? 0;
            const info = getWeatherInfo(code);
            const temp = Math.round(hourly.temperature_2m[actualIdx]);
            const feelsLike = Math.round(hourly.apparent_temperature?.[actualIdx] ?? temp);
            const rainProb = hourly.precipitation_probability[actualIdx] ?? 0;
            const wind = Math.round(hourly.wind_speed_10m[actualIdx] ?? 0);
            const windDir = hourly.wind_direction_10m[actualIdx] ?? 0;
            const compass = getWindCompassDirection(windDir);
            const uv = hourly.uv_index?.[actualIdx] ?? 0;

            const isCurrentHour =
              selectedDayIndex === 0 &&
              new Date().getHours() === time.getHours() &&
              new Date().getDate() === time.getDate();

            return (
              <div
                key={timeStr}
                className={`flex w-24 flex-col items-center justify-between rounded-xl p-3 text-center transition-all ${
                  isCurrentHour
                    ? 'bg-sky-500/15 ring-1 ring-sky-500/40 shadow-sm'
                    : 'bg-slate-900/70 ring-1 ring-slate-800/80 hover:bg-slate-900'
                }`}
              >
                {/* Time */}
                <div className="text-xs font-semibold text-slate-300">
                  {isCurrentHour ? (
                    <span className="text-sky-400 font-bold">Now</span>
                  ) : (
                    hourLabel
                  )}
                </div>

                {/* Icon */}
                <div className="my-2.5 text-sky-400">
                  {renderWeatherIcon(info.iconName, 'h-6 w-6')}
                </div>

                {/* Temp */}
                <div className="font-tabular text-sm font-bold text-white">
                  {temp}{tempUnit}
                </div>

                <div className="text-[10px] text-slate-400 font-tabular">
                  Feels {feelsLike}°
                </div>

                {/* Rain chance */}
                <div className="mt-2.5 flex items-center gap-1 text-[11px] text-sky-400 font-tabular">
                  <Droplets className="h-3 w-3 shrink-0" />
                  <span>{rainProb}%</span>
                </div>

                {/* Wind */}
                <div className="mt-1 flex items-center gap-1 text-[10px] text-slate-400 font-tabular">
                  <Navigation
                    className="h-2.5 w-2.5 text-slate-400 shrink-0"
                    style={{ transform: `rotate(${windDir}deg)` }}
                  />
                  <span>{wind} {windUnit}</span>
                </div>

                {/* UV if daylight */}
                {uv > 0 && (
                  <div className="mt-1 text-[10px] text-amber-400 font-tabular">
                    UV {uv.toFixed(1)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
