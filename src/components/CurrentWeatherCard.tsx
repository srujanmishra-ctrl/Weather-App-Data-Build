import React from 'react';
import { GeoLocationResult, WeatherApiResponse } from '../types/weather';
import {
  getWeatherInfo,
  getWindCompassDirection,
  getUVClassification,
  getDewPointComfort,
  getBarometricTrend,
} from '../utils/weatherCodes';
import {
  Sun,
  CloudSun,
  Cloud,
  CloudFog,
  CloudDrizzle,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Droplets,
  Eye,
  Compass,
  Gauge,
  Sunrise,
  Sunset,
  ArrowUp,
  ArrowDown,
  Navigation,
} from 'lucide-react';

interface CurrentWeatherCardProps {
  location: GeoLocationResult;
  data: WeatherApiResponse;
}

export const CurrentWeatherCard: React.FC<CurrentWeatherCardProps> = ({ location, data }) => {
  const current = data.current;
  const daily = data.daily;
  const hourly = data.hourly;
  const weatherInfo = getWeatherInfo(current.weather_code);

  const tempUnit = data.current_units.temperature_2m || '°C';
  const windUnit = data.current_units.wind_speed_10m || 'km/h';
  const precipUnit = data.current_units.precipitation || 'mm';

  const todayHigh = daily.temperature_2m_max?.[0] ?? Math.round(current.temperature_2m);
  const todayLow = daily.temperature_2m_min?.[0] ?? Math.round(current.temperature_2m);
  const todaySunrise = daily.sunrise?.[0] ? new Date(daily.sunrise[0]) : null;
  const todaySunset = daily.sunset?.[0] ? new Date(daily.sunset[0]) : null;

  // Dew point calculation (from hourly closest to current hour)
  const currentDewPoint = hourly.dew_point_2m?.[0] ?? (current.temperature_2m - ((100 - current.relative_humidity_2m) / 5));
  const dewComfort = getDewPointComfort(tempUnit.includes('F') ? (currentDewPoint - 32) * (5 / 9) : currentDewPoint);

  // Visibility from hourly (meters to km)
  const rawVisibility = hourly.visibility?.[0] ?? 10000;
  const visibilityFormatted = (rawVisibility / 1000).toFixed(1);

  // UV Index & classification
  const uvMaxToday = daily.uv_index_max?.[0] ?? (hourly.uv_index?.[0] ?? 3);
  const uvClass = getUVClassification(uvMaxToday);

  // Daylight progress calculation (0% to 100%)
  let daylightPercent = 0;
  if (todaySunrise && todaySunset) {
    const now = new Date();
    const riseTime = todaySunrise.getTime();
    const setTime = todaySunset.getTime();
    if (now.getTime() < riseTime) {
      daylightPercent = 0;
    } else if (now.getTime() > setTime) {
      daylightPercent = 100;
    } else {
      daylightPercent = Math.round(((now.getTime() - riseTime) / (setTime - riseTime)) * 100);
    }
  }

  // Weather Icon Component
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

  const windDirectionCompass = getWindCompassDirection(current.wind_direction_10m);
  const pressureTrend = getBarometricTrend(current.pressure_msl);

  // Formatted local time
  const localTime = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: data.timezone,
  });

  return (
    <section id="current-overview" className="w-full space-y-4">
      {/* Location Bar & Quick Time */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {location.name}
            </h1>
            {location.country_code && (
              <span className="font-tabular rounded bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-300">
                {location.country_code}
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
            <span>{[location.admin1, location.country].filter(Boolean).join(', ') || 'Global Observation'}</span>
            <span aria-hidden="true">·</span>
            <span className="font-tabular">
              {location.latitude.toFixed(2)}°N, {location.longitude.toFixed(2)}°E
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-tabular">{data.elevation}m ASL</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Local Station Time:</span>
          <span className="font-tabular font-semibold text-slate-200">{localTime}</span>
          <span className="text-slate-500">({data.timezone_abbreviation || data.timezone})</span>
        </div>
      </div>

      {/* Main Atmospheric Overview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Primary Hero Card: Temperature & Visual Condition (5 cols) */}
        <div className="lg:col-span-5 relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 p-6 ring-1 ring-slate-800 shadow-xl">
          {/* Subtle Ambient Radial Light */}
          <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />

          <div className="relative flex flex-col justify-between h-full space-y-6">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
                  Current Condition
                </span>
                <h2 className="mt-1 text-xl font-semibold text-white">
                  {weatherInfo.label}
                </h2>
                <p className="mt-0.5 text-xs text-slate-400 max-w-[280px]">
                  {weatherInfo.description}
                </p>
              </div>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800/80 text-sky-400 ring-1 ring-slate-700/60 shadow-lg">
                {renderWeatherIcon(weatherInfo.iconName, 'h-9 w-9')}
              </div>
            </div>

            {/* Big Temperature Hero */}
            <div className="flex items-baseline gap-3">
              <span className="font-tabular text-6xl font-bold tracking-tight text-white sm:text-7xl">
                {Math.round(current.temperature_2m)}
              </span>
              <span className="text-3xl font-light text-slate-400">{tempUnit}</span>
            </div>

            {/* Apparent Temp & Daily Range */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/80 pt-4 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Feels like</span>
                <span className="font-tabular font-semibold text-white">
                  {Math.round(current.apparent_temperature)}{tempUnit}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-rose-300">
                  <ArrowUp className="h-3.5 w-3.5" />
                  <span className="font-tabular font-medium">H: {Math.round(todayHigh)}{tempUnit}</span>
                </div>
                <div className="flex items-center gap-1 text-sky-300">
                  <ArrowDown className="h-3.5 w-3.5" />
                  <span className="font-tabular font-medium">L: {Math.round(todayLow)}{tempUnit}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 7 Atmospheric Telemetry Cards Grid (7 cols) */}
        <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {/* 1. Humidity & Dew Point */}
          <div className="rounded-xl bg-slate-900/80 p-4 ring-1 ring-slate-800/80 hover:ring-slate-700/80 transition-all">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Humidity</span>
              <Droplets className="h-4 w-4 text-sky-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-tabular text-2xl font-bold text-white">
                {current.relative_humidity_2m}
              </span>
              <span className="text-xs text-slate-400">%</span>
            </div>
            <div className="mt-1.5 text-[11px] text-slate-400 truncate">
              Dew point {Math.round(currentDewPoint)}{tempUnit} · {dewComfort}
            </div>
          </div>

          {/* 2. Wind & Direction */}
          <div className="rounded-xl bg-slate-900/80 p-4 ring-1 ring-slate-800/80 hover:ring-slate-700/80 transition-all">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Wind Flow</span>
              <Wind className="h-4 w-4 text-sky-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-tabular text-2xl font-bold text-white">
                {Math.round(current.wind_speed_10m)}
              </span>
              <span className="text-xs text-slate-400">{windUnit}</span>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-slate-400">
              <Navigation
                className="h-3 w-3 text-sky-400 shrink-0"
                style={{ transform: `rotate(${current.wind_direction_10m}deg)` }}
              />
              <span className="font-tabular font-semibold text-slate-300">{windDirectionCompass}</span>
              <span>· Gusts {Math.round(current.wind_gusts_10m)} {windUnit}</span>
            </div>
          </div>

          {/* 3. UV Index */}
          <div className="rounded-xl bg-slate-900/80 p-4 ring-1 ring-slate-800/80 hover:ring-slate-700/80 transition-all">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">UV Index</span>
              <Sun className="h-4 w-4 text-amber-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="font-tabular text-2xl font-bold text-white">
                {uvMaxToday.toFixed(1)}
              </span>
              <span className={`text-xs font-medium ${uvClass.color}`}>
                {uvClass.level}
              </span>
            </div>
            {/* Visual UV Tier Bar */}
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className={`h-full rounded-full ${uvClass.bg}`}
                style={{ width: `${Math.min(100, (uvMaxToday / 11) * 100)}%` }}
              />
            </div>
          </div>

          {/* 4. Atmospheric Pressure */}
          <div className="rounded-xl bg-slate-900/80 p-4 ring-1 ring-slate-800/80 hover:ring-slate-700/80 transition-all">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Air Pressure</span>
              <Gauge className="h-4 w-4 text-sky-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-tabular text-2xl font-bold text-white">
                {Math.round(current.pressure_msl)}
              </span>
              <span className="text-xs text-slate-400">hPa</span>
            </div>
            <div className="mt-1.5 text-[11px] text-slate-400 truncate">
              {pressureTrend}
            </div>
          </div>

          {/* 5. Cloud Cover */}
          <div className="rounded-xl bg-slate-900/80 p-4 ring-1 ring-slate-800/80 hover:ring-slate-700/80 transition-all">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Cloud Cover</span>
              <Cloud className="h-4 w-4 text-slate-300" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-tabular text-2xl font-bold text-white">
                {current.cloud_cover}
              </span>
              <span className="text-xs text-slate-400">%</span>
            </div>
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-slate-400"
                style={{ width: `${current.cloud_cover}%` }}
              />
            </div>
          </div>

          {/* 6. Visibility */}
          <div className="rounded-xl bg-slate-900/80 p-4 ring-1 ring-slate-800/80 hover:ring-slate-700/80 transition-all">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-medium">Visibility</span>
              <Eye className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="font-tabular text-2xl font-bold text-white">
                {visibilityFormatted}
              </span>
              <span className="text-xs text-slate-400">km</span>
            </div>
            <div className="mt-1.5 text-[11px] text-slate-400">
              {rawVisibility >= 10000 ? 'Crystal clear vista' : 'Partially reduced sightline'}
            </div>
          </div>

          {/* 7. Daylight Arc / Solar Progression (spans across all 3 cols or 2 on mobile) */}
          <div className="col-span-2 sm:col-span-3 rounded-xl bg-slate-900/80 p-4 ring-1 ring-slate-800/80">
            <div className="flex items-center justify-between text-slate-400">
              <div className="flex items-center gap-1.5 text-xs font-medium">
                <Sun className="h-3.5 w-3.5 text-amber-400" />
                <span>Daylight Progression</span>
              </div>
              <span className="text-xs text-slate-400">
                {daylightPercent > 0 && daylightPercent < 100 ? `${daylightPercent}% solar day elapsed` : daylightPercent === 100 ? 'Night period' : 'Pre-dawn'}
              </span>
            </div>

            <div className="mt-3 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2">
                <Sunrise className="h-4 w-4 text-amber-400 shrink-0" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Sunrise</div>
                  <div className="font-tabular font-medium text-slate-200">
                    {todaySunrise ? todaySunrise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                  </div>
                </div>
              </div>

              {/* Linear Daylight Timeline Bar */}
              <div className="relative flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-sky-400 to-indigo-500 transition-all duration-500"
                  style={{ width: `${daylightPercent}%` }}
                />
              </div>

              <div className="flex items-center gap-2 text-right">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Sunset</div>
                  <div className="font-tabular font-medium text-slate-200">
                    {todaySunset ? todaySunset.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                  </div>
                </div>
                <Sunset className="h-4 w-4 text-indigo-400 shrink-0" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
