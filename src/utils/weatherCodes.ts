export interface WeatherCodeInfo {
  code: number;
  label: string;
  description: string;
  iconName: 'Sun' | 'CloudSun' | 'Cloud' | 'CloudFog' | 'CloudDrizzle' | 'CloudRain' | 'CloudSnow' | 'CloudLightning' | 'CloudHail';
  accentColor: string; // e.g., emerald, amber, sky, violet, slate
  badgeBg: string;
  isRain: boolean;
  isSnow: boolean;
}

export const WMO_WEATHER_CODES: Record<number, WeatherCodeInfo> = {
  0: {
    code: 0,
    label: 'Clear Sky',
    description: 'Cloudless, unobstructed clear skies',
    iconName: 'Sun',
    accentColor: 'text-amber-400',
    badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    isRain: false,
    isSnow: false,
  },
  1: {
    code: 1,
    label: 'Mainly Clear',
    description: 'Predominantly clear with few scattered clouds',
    iconName: 'CloudSun',
    accentColor: 'text-amber-300',
    badgeBg: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
    isRain: false,
    isSnow: false,
  },
  2: {
    code: 2,
    label: 'Partly Cloudy',
    description: 'Scattered clouds with periodic bright intervals',
    iconName: 'CloudSun',
    accentColor: 'text-sky-300',
    badgeBg: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
    isRain: false,
    isSnow: false,
  },
  3: {
    code: 3,
    label: 'Overcast',
    description: 'Continuous cloud cover obscuring direct sunlight',
    iconName: 'Cloud',
    accentColor: 'text-slate-300',
    badgeBg: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
    isRain: false,
    isSnow: false,
  },
  45: {
    code: 45,
    label: 'Foggy',
    description: 'Low visibility due to dense surface condensation',
    iconName: 'CloudFog',
    accentColor: 'text-zinc-300',
    badgeBg: 'bg-zinc-500/10 text-zinc-300 border-zinc-500/20',
    isRain: false,
    isSnow: false,
  },
  48: {
    code: 48,
    label: 'Rime Fog',
    description: 'Freezing fog depositing ice crystals on exposed surfaces',
    iconName: 'CloudFog',
    accentColor: 'text-cyan-300',
    badgeBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
    isRain: false,
    isSnow: false,
  },
  51: {
    code: 51,
    label: 'Light Drizzle',
    description: 'Fine mist-like droplets with minimal ground accumulation',
    iconName: 'CloudDrizzle',
    accentColor: 'text-blue-300',
    badgeBg: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    isRain: true,
    isSnow: false,
  },
  53: {
    code: 53,
    label: 'Moderate Drizzle',
    description: 'Steady fine precipitation dampening surfaces',
    iconName: 'CloudDrizzle',
    accentColor: 'text-blue-400',
    badgeBg: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    isRain: true,
    isSnow: false,
  },
  55: {
    code: 55,
    label: 'Dense Drizzle',
    description: 'Substantial persistent drizzle restricting visibility',
    iconName: 'CloudDrizzle',
    accentColor: 'text-blue-400',
    badgeBg: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    isRain: true,
    isSnow: false,
  },
  56: {
    code: 56,
    label: 'Light Freezing Drizzle',
    description: 'Supercooled drizzle forming thin glaze on contact',
    iconName: 'CloudSnow',
    accentColor: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
    isRain: true,
    isSnow: true,
  },
  57: {
    code: 57,
    label: 'Dense Freezing Drizzle',
    description: 'Heavy supercooled drizzle causing hazardous icing',
    iconName: 'CloudSnow',
    accentColor: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
    isRain: true,
    isSnow: true,
  },
  61: {
    code: 61,
    label: 'Slight Rain',
    description: 'Gentle intermittent rain showers',
    iconName: 'CloudRain',
    accentColor: 'text-sky-400',
    badgeBg: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
    isRain: true,
    isSnow: false,
  },
  63: {
    code: 63,
    label: 'Moderate Rain',
    description: 'Steady soaking rainfall with puddle formation',
    iconName: 'CloudRain',
    accentColor: 'text-sky-400',
    badgeBg: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
    isRain: true,
    isSnow: false,
  },
  65: {
    code: 65,
    label: 'Heavy Rain',
    description: 'Intense downpour with reduced road traction',
    iconName: 'CloudRain',
    accentColor: 'text-indigo-400',
    badgeBg: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
    isRain: true,
    isSnow: false,
  },
  66: {
    code: 66,
    label: 'Light Freezing Rain',
    description: 'Cold rain freezing upon contact creating slick paths',
    iconName: 'CloudSnow',
    accentColor: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
    isRain: true,
    isSnow: true,
  },
  67: {
    code: 67,
    label: 'Heavy Freezing Rain',
    description: 'Significant ice glaze accumulation on trees & roadways',
    iconName: 'CloudSnow',
    accentColor: 'text-cyan-400',
    badgeBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
    isRain: true,
    isSnow: true,
  },
  71: {
    code: 71,
    label: 'Slight Snow',
    description: 'Light fluttering snow flurries',
    iconName: 'CloudSnow',
    accentColor: 'text-slate-100',
    badgeBg: 'bg-white/10 text-white border-white/20',
    isRain: false,
    isSnow: true,
  },
  73: {
    code: 73,
    label: 'Moderate Snow',
    description: 'Consistent snowfall accumulating rapidly',
    iconName: 'CloudSnow',
    accentColor: 'text-slate-100',
    badgeBg: 'bg-white/10 text-white border-white/20',
    isRain: false,
    isSnow: true,
  },
  75: {
    code: 75,
    label: 'Heavy Snow',
    description: 'Dense snowfall causing low visibility and snowpack',
    iconName: 'CloudSnow',
    accentColor: 'text-slate-100',
    badgeBg: 'bg-white/10 text-white border-white/20',
    isRain: false,
    isSnow: true,
  },
  77: {
    code: 77,
    label: 'Snow Grains',
    description: 'Small opaque ice grains bouncing on impact',
    iconName: 'CloudSnow',
    accentColor: 'text-cyan-200',
    badgeBg: 'bg-cyan-500/10 text-cyan-200 border-cyan-500/20',
    isRain: false,
    isSnow: true,
  },
  80: {
    code: 80,
    label: 'Slight Showers',
    description: 'Brief passing light rain showers',
    iconName: 'CloudRain',
    accentColor: 'text-sky-300',
    badgeBg: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
    isRain: true,
    isSnow: false,
  },
  81: {
    code: 81,
    label: 'Moderate Showers',
    description: 'Intermittent brisk downpours with clear spells',
    iconName: 'CloudRain',
    accentColor: 'text-sky-400',
    badgeBg: 'bg-sky-500/10 text-sky-300 border-sky-500/20',
    isRain: true,
    isSnow: false,
  },
  82: {
    code: 82,
    label: 'Violent Showers',
    description: 'Heavy localized torrential rain bursts',
    iconName: 'CloudRain',
    accentColor: 'text-blue-400',
    badgeBg: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
    isRain: true,
    isSnow: false,
  },
  85: {
    code: 85,
    label: 'Light Snow Showers',
    description: 'Intermittent brief snow showers',
    iconName: 'CloudSnow',
    accentColor: 'text-slate-200',
    badgeBg: 'bg-slate-400/10 text-slate-200 border-slate-400/20',
    isRain: false,
    isSnow: true,
  },
  86: {
    code: 86,
    label: 'Heavy Snow Showers',
    description: 'Sudden squalls of heavy blowing snow',
    iconName: 'CloudSnow',
    accentColor: 'text-slate-100',
    badgeBg: 'bg-slate-400/15 text-white border-slate-400/30',
    isRain: false,
    isSnow: true,
  },
  95: {
    code: 95,
    label: 'Thunderstorm',
    description: 'Electrical activity with gusty localized rain',
    iconName: 'CloudLightning',
    accentColor: 'text-violet-400',
    badgeBg: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
    isRain: true,
    isSnow: false,
  },
  96: {
    code: 96,
    label: 'Thunderstorm with Hail',
    description: 'Severe electrical storm accompanied by small hailstones',
    iconName: 'CloudLightning',
    accentColor: 'text-purple-400',
    badgeBg: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    isRain: true,
    isSnow: false,
  },
  99: {
    code: 99,
    label: 'Severe Hailstorm',
    description: 'Violent thunderstorm producing damaging hailstones',
    iconName: 'CloudLightning',
    accentColor: 'text-rose-400',
    badgeBg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    isRain: true,
    isSnow: false,
  },
};

export function getWeatherInfo(code: number): WeatherCodeInfo {
  return (
    WMO_WEATHER_CODES[code] ?? {
      code,
      label: 'Atmospheric State',
      description: 'Standard atmospheric conditions',
      iconName: 'Cloud',
      accentColor: 'text-slate-300',
      badgeBg: 'bg-slate-500/10 text-slate-300 border-slate-500/20',
      isRain: false,
      isSnow: false,
    }
  );
}

export function getWindCompassDirection(degrees: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(((degrees % 360) / 22.5)) % 16;
  return directions[index];
}

export function getUVClassification(uv: number): {
  level: 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme';
  color: string;
  bg: string;
} {
  if (uv <= 2) return { level: 'Low', color: 'text-emerald-400', bg: 'bg-emerald-500' };
  if (uv <= 5) return { level: 'Moderate', color: 'text-amber-400', bg: 'bg-amber-500' };
  if (uv <= 7) return { level: 'High', color: 'text-orange-400', bg: 'bg-orange-500' };
  if (uv <= 10) return { level: 'Very High', color: 'text-rose-400', bg: 'bg-rose-500' };
  return { level: 'Extreme', color: 'text-purple-400', bg: 'bg-purple-500' };
}

export function getDewPointComfort(dewPointC: number): string {
  if (dewPointC < 10) return 'Crisp & Dry';
  if (dewPointC < 16) return 'Comfortable';
  if (dewPointC < 20) return 'Humid';
  if (dewPointC < 24) return 'Muggy';
  return 'Oppressive';
}

export function getBarometricTrend(currentPressure: number): string {
  if (currentPressure > 1022) return 'High Pressure (Settled)';
  if (currentPressure < 1008) return 'Low Pressure (Unstable)';
  return 'Normal Pressure (Stable)';
}
