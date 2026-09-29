import React, { useState, useMemo } from 'react';
import { WeatherApiResponse } from '../types/weather';
import { getWeatherInfo } from '../utils/weatherCodes';
import { Thermometer, CloudRain, Wind, Sun, Droplets } from 'lucide-react';

interface WeatherChartsProps {
  data: WeatherApiResponse;
  selectedDayIndex: number;
}

type MetricType = 'temperature' | 'precipitation' | 'wind' | 'uv' | 'humidity';
type TimeframeType = '24h' | 'selectedDay' | '7day';

interface DataPoint {
  timeLabel: string;
  fullTime: string;
  value: number;
  secondaryValue?: number;
  weatherCode?: number;
}

export const WeatherCharts: React.FC<WeatherChartsProps> = ({ data, selectedDayIndex }) => {
  const [metric, setMetric] = useState<MetricType>('temperature');
  const [timeframe, setTimeframe] = useState<TimeframeType>('24h');
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const hourly = data.hourly;
  const daily = data.daily;
  const tempUnit = data.current_units.temperature_2m || '°C';
  const windUnit = data.current_units.wind_speed_10m || 'km/h';
  const precipUnit = data.current_units.precipitation || 'mm';

  // Compute dataset based on selected metric and timeframe
  const points: DataPoint[] = useMemo(() => {
    if (timeframe === '7day') {
      return daily.time.slice(0, 7).map((dStr, idx) => {
        const d = new Date(dStr + 'T00:00:00');
        const label = d.toLocaleDateString([], { weekday: 'short' });
        const fullTime = d.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
        let val = 0;
        let secVal = undefined;

        if (metric === 'temperature') {
          val = daily.temperature_2m_max[idx];
          secVal = daily.temperature_2m_min[idx];
        } else if (metric === 'precipitation') {
          val = daily.precipitation_probability_max?.[idx] ?? 0;
          secVal = daily.precipitation_sum?.[idx] ?? 0;
        } else if (metric === 'wind') {
          val = daily.wind_speed_10m_max?.[idx] ?? 0;
          secVal = daily.wind_gusts_10m_max?.[idx] ?? val;
        } else if (metric === 'uv') {
          val = daily.uv_index_max?.[idx] ?? 0;
        } else if (metric === 'humidity') {
          // Approximate daily humidity from hourly slice
          const sliceH = hourly.relative_humidity_2m.slice(idx * 24, (idx + 1) * 24);
          val = sliceH.length ? Math.round(sliceH.reduce((a, b) => a + b, 0) / sliceH.length) : 50;
        }

        return {
          timeLabel: label,
          fullTime,
          value: Math.round(val * 10) / 10,
          secondaryValue: secVal !== undefined ? Math.round(secVal * 10) / 10 : undefined,
          weatherCode: daily.weather_code[idx],
        };
      });
    }

    // Hourly datasets: 24h from now OR 24h for selected day
    const startIndex = timeframe === '24h' ? 0 : Math.min(selectedDayIndex * 24, Math.max(0, hourly.time.length - 24));
    const endIndex = Math.min(startIndex + 24, hourly.time.length);

    const result: DataPoint[] = [];
    for (let i = startIndex; i < endIndex; i++) {
      const t = new Date(hourly.time[i]);
      const label = t.toLocaleTimeString([], { hour: 'numeric' });
      const fullTime = `${t.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} at ${t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

      let val = 0;
      let secVal = undefined;

      if (metric === 'temperature') {
        val = hourly.temperature_2m[i];
        secVal = hourly.apparent_temperature?.[i];
      } else if (metric === 'precipitation') {
        val = hourly.precipitation_probability[i] ?? 0;
        secVal = hourly.precipitation[i] ?? 0;
      } else if (metric === 'wind') {
        val = hourly.wind_speed_10m[i] ?? 0;
      } else if (metric === 'uv') {
        val = hourly.uv_index[i] ?? 0;
      } else if (metric === 'humidity') {
        val = hourly.relative_humidity_2m[i] ?? 0;
        secVal = hourly.dew_point_2m?.[i];
      }

      result.push({
        timeLabel: label,
        fullTime,
        value: Math.round(val * 10) / 10,
        secondaryValue: secVal !== undefined ? Math.round(secVal * 10) / 10 : undefined,
        weatherCode: hourly.weather_code[i],
      });
    }

    return result;
  }, [timeframe, metric, selectedDayIndex, hourly, daily]);

  // Chart layout dimensions
  const width = 800;
  const height = 260;
  const paddingX = 40;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartW = width - paddingX * 2;
  const chartH = height - paddingTop - paddingBottom;

  // Min and max bounds for y-axis
  const values = points.map((p) => p.value);
  if (points.some((p) => p.secondaryValue !== undefined)) {
    points.forEach((p) => {
      if (p.secondaryValue !== undefined) values.push(p.secondaryValue);
    });
  }

  let minY = Math.min(...values);
  let maxY = Math.max(...values);

  // Guard against flat data
  if (minY === maxY) {
    minY -= 5;
    maxY += 5;
  }

  // Adjust for percentages (0 - 100) or UV (0 - 12)
  if (metric === 'precipitation' || metric === 'humidity') {
    minY = 0;
    maxY = Math.max(100, maxY);
  } else if (metric === 'uv') {
    minY = 0;
    maxY = Math.max(10, Math.ceil(maxY) + 1);
  } else {
    // Add padding to temperature / wind
    const span = maxY - minY;
    minY = Math.floor(minY - span * 0.15);
    maxY = Math.ceil(maxY + span * 0.15);
  }

  const getY = (val: number) => {
    return paddingTop + chartH - ((val - minY) / (maxY - minY)) * chartH;
  };

  const getX = (idx: number) => {
    if (points.length <= 1) return paddingX;
    return paddingX + (idx / (points.length - 1)) * chartW;
  };

  // Generate SVG smooth bezier curve path
  const primaryPath = useMemo(() => {
    if (points.length === 0) return '';
    const coords = points.map((p, idx) => ({ x: getX(idx), y: getY(p.value) }));

    let d = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i === 0 ? i : i - 1];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = coords[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  }, [points, minY, maxY]);

  // Secondary curve (e.g. apparent temp, min temp, gusts, or rain volume)
  const secondaryPath = useMemo(() => {
    if (points.length === 0 || !points[0].secondaryValue) return '';
    const coords = points.map((p, idx) => ({
      x: getX(idx),
      y: getY(p.secondaryValue ?? p.value),
    }));

    let d = `M ${coords[0].x} ${coords[0].y}`;
    for (let i = 0; i < coords.length - 1; i++) {
      const p0 = coords[i === 0 ? i : i - 1];
      const p1 = coords[i];
      const p2 = coords[i + 1];
      const p3 = coords[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  }, [points, minY, maxY]);

  // Fill area under curve
  const areaPath = useMemo(() => {
    if (!primaryPath || points.length === 0) return '';
    const firstX = getX(0);
    const lastX = getX(points.length - 1);
    const bottomY = paddingTop + chartH;
    return `${primaryPath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  }, [primaryPath, points]);

  // Theme colors for selected metric
  const metricColor = useMemo(() => {
    switch (metric) {
      case 'temperature':
        return { stroke: '#38bdf8', fill: 'url(#gradient-sky)', label: `Temperature (${tempUnit})` };
      case 'precipitation':
        return { stroke: '#60a5fa', fill: 'url(#gradient-blue)', label: 'Precipitation Probability (%)' };
      case 'wind':
        return { stroke: '#a78bfa', fill: 'url(#gradient-violet)', label: `Wind Velocity (${windUnit})` };
      case 'uv':
        return { stroke: '#fbbf24', fill: 'url(#gradient-amber)', label: 'Solar UV Index' };
      case 'humidity':
        return { stroke: '#34d399', fill: 'url(#gradient-emerald)', label: 'Relative Humidity (%)' };
    }
  }, [metric, tempUnit, windUnit]);

  const activePoint = hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : null;
  const activeWeather = activePoint?.weatherCode !== undefined ? getWeatherInfo(activePoint.weatherCode) : null;

  return (
    <section id="weather-charts" className="w-full space-y-3">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white">
            Atmospheric Dynamic Charts
          </h2>
          <p className="text-xs text-slate-400">
            Interactive trajectory across temperature, precipitation probability, wind dynamics, and UV
          </p>
        </div>

        {/* Timeframe segmented controls */}
        <div className="flex items-center rounded-lg bg-slate-900 p-1 ring-1 ring-slate-800 text-xs font-medium">
          <button
            type="button"
            onClick={() => setTimeframe('24h')}
            className={`rounded-md px-3 py-1 transition-all ${
              timeframe === '24h'
                ? 'bg-slate-800 text-sky-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Next 24h
          </button>
          <button
            type="button"
            onClick={() => setTimeframe('selectedDay')}
            className={`rounded-md px-3 py-1 transition-all ${
              timeframe === 'selectedDay'
                ? 'bg-slate-800 text-sky-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Day {selectedDayIndex + 1} Hours
          </button>
          <button
            type="button"
            onClick={() => setTimeframe('7day')}
            className={`rounded-md px-3 py-1 transition-all ${
              timeframe === '7day'
                ? 'bg-slate-800 text-sky-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            7-Day Synoptic
          </button>
        </div>
      </div>

      {/* Main Chart Container Card */}
      <div className="rounded-2xl bg-slate-900/90 p-5 ring-1 ring-slate-800">
        {/* Metric Selector Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setMetric('temperature')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                metric === 'temperature'
                  ? 'bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/40'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Thermometer className="h-3.5 w-3.5" />
              <span>Temperature</span>
            </button>

            <button
              type="button"
              onClick={() => setMetric('precipitation')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                metric === 'precipitation'
                  ? 'bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/40'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <CloudRain className="h-3.5 w-3.5" />
              <span>Precipitation</span>
            </button>

            <button
              type="button"
              onClick={() => setMetric('wind')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                metric === 'wind'
                  ? 'bg-purple-500/20 text-purple-300 ring-1 ring-purple-500/40'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Wind className="h-3.5 w-3.5" />
              <span>Wind Velocity</span>
            </button>

            <button
              type="button"
              onClick={() => setMetric('uv')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                metric === 'uv'
                  ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Sun className="h-3.5 w-3.5" />
              <span>UV Index</span>
            </button>

            <button
              type="button"
              onClick={() => setMetric('humidity')}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                metric === 'humidity'
                  ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40'
                  : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Droplets className="h-3.5 w-3.5" />
              <span>Humidity</span>
            </button>
          </div>

          {/* Active Hover / Realtime Metric readout */}
          <div className="flex items-center gap-2 text-xs">
            {activePoint ? (
              <div className="flex items-center gap-2 rounded-md bg-slate-800 px-2.5 py-1 text-slate-200">
                <span className="text-slate-400">{activePoint.fullTime}:</span>
                <span className="font-tabular font-bold text-white">
                  {activePoint.value}
                  {metric === 'temperature'
                    ? tempUnit
                    : metric === 'precipitation' || metric === 'humidity'
                    ? '%'
                    : metric === 'wind'
                    ? ` ${windUnit}`
                    : ''}
                </span>
                {activePoint.secondaryValue !== undefined && (
                  <span className="text-slate-400 font-tabular text-[11px]">
                    (Secondary: {activePoint.secondaryValue}
                    {metric === 'temperature' ? tempUnit : metric === 'precipitation' ? ` ${precipUnit}` : ''})
                  </span>
                )}
                {activeWeather && (
                  <span className="text-slate-400 text-[11px]">· {activeWeather.label}</span>
                )}
              </div>
            ) : (
              <span className="text-slate-500 text-xs">Hover over chart nodes to inspect values</span>
            )}
          </div>
        </div>

        {/* Responsive Interactive SVG Canvas */}
        <div className="relative mt-4 w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto overflow-visible select-none"
            onMouseLeave={() => setHoverIndex(null)}
          >
            <defs>
              {/* Gradients for area fills */}
              <linearGradient id="gradient-sky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="gradient-blue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="gradient-violet" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="gradient-amber" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="gradient-emerald" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#34d399" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#34d399" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines and Y labels */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = paddingTop + ratio * chartH;
              const val = Math.round(maxY - ratio * (maxY - minY));
              return (
                <g key={ratio}>
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={width - paddingX}
                    y2={y}
                    stroke="rgba(51, 65, 85, 0.4)"
                    strokeDasharray="4 4"
                    strokeWidth="1"
                  />
                  <text
                    x={paddingX - 8}
                    y={y + 3}
                    textAnchor="end"
                    className="fill-slate-500 font-tabular text-[10px]"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Area Fill */}
            {areaPath && <path d={areaPath} fill={metricColor.fill} />}

            {/* Secondary dashed curve (if applicable, e.g. min temp or apparent temp) */}
            {secondaryPath && (
              <path
                d={secondaryPath}
                fill="none"
                stroke="rgba(148, 163, 184, 0.5)"
                strokeWidth="1.5"
                strokeDasharray="4 3"
              />
            )}

            {/* Primary Spline Line */}
            {primaryPath && (
              <path
                d={primaryPath}
                fill="none"
                stroke={metricColor.stroke}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Interactive Data Nodes & Hover Columns */}
            {points.map((p, idx) => {
              const cx = getX(idx);
              const cy = getY(p.value);
              const isHovered = hoverIndex === idx;

              // Step width for mouse interception
              const colW = chartW / Math.max(1, points.length - 1);

              return (
                <g key={idx}>
                  {/* Invisible broad hover hit-box */}
                  <rect
                    x={cx - colW / 2}
                    y={paddingTop}
                    width={colW}
                    height={chartH + paddingBottom}
                    fill="transparent"
                    onMouseEnter={() => setHoverIndex(idx)}
                    className="cursor-pointer"
                  />

                  {/* Active Vertical Crosshair */}
                  {isHovered && (
                    <line
                      x1={cx}
                      y1={paddingTop}
                      x2={cx}
                      y2={paddingTop + chartH}
                      stroke="rgba(241, 245, 249, 0.4)"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                      pointerEvents="none"
                    />
                  )}

                  {/* Node Circle */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={isHovered ? 5.5 : 2.5}
                    fill={isHovered ? '#ffffff' : metricColor.stroke}
                    stroke={isHovered ? metricColor.stroke : '#0f172a'}
                    strokeWidth={isHovered ? 2.5 : 1}
                    className="transition-all duration-150 pointer-events-none"
                  />

                  {/* X Axis Time Labels (Render every nth label to avoid crowding) */}
                  {(timeframe === '7day' || idx % (points.length > 18 ? 3 : 2) === 0 || idx === points.length - 1) && (
                    <text
                      x={cx}
                      y={height - 12}
                      textAnchor="middle"
                      className={`font-tabular text-[10px] transition-colors pointer-events-none ${
                        isHovered ? 'fill-sky-400 font-semibold' : 'fill-slate-500'
                      }`}
                    >
                      {p.timeLabel}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend notes */}
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 border-t border-slate-800/80 pt-2.5">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-4 rounded-full" style={{ backgroundColor: metricColor.stroke }} />
              <span className="text-slate-300 font-medium">{metricColor.label}</span>
            </div>
            {points[0]?.secondaryValue !== undefined && (
              <div className="flex items-center gap-1.5">
                <span className="h-0.5 w-4 border-b border-dashed border-slate-400" />
                <span>
                  {metric === 'temperature'
                    ? timeframe === '7day'
                      ? 'Min Temp'
                      : 'Apparent Temp'
                    : metric === 'precipitation'
                    ? 'Rain Volume'
                    : metric === 'humidity'
                    ? 'Dew Point'
                    : 'Gusts'}
                </span>
              </div>
            )}
          </div>

          <div className="text-slate-500">
            Precision data source: Open-Meteo High-Resolution Numerical Model
          </div>
        </div>
      </div>
    </section>
  );
};
