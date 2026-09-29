export interface GeoLocationResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  feature_code?: string;
  country_code?: string;
  country?: string;
  country_id?: number;
  admin1?: string;
  admin2?: string;
  timezone?: string;
  population?: number;
}

export type TemperatureUnit = 'celsius' | 'fahrenheit';
export type WindSpeedUnit = 'kmh' | 'mph' | 'ms';
export type PrecipitationUnit = 'mm' | 'inch';

export interface UnitPreferences {
  temperature: TemperatureUnit;
  windSpeed: WindSpeedUnit;
  precipitation: PrecipitationUnit;
}

export interface CurrentWeather {
  time: string;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  is_day: number;
  precipitation: number;
  weather_code: number;
  cloud_cover: number;
  pressure_msl: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
  wind_gusts_10m: number;
}

export interface HourlyWeather {
  time: string[];
  temperature_2m: number[];
  relative_humidity_2m: number[];
  dew_point_2m: number[];
  apparent_temperature: number[];
  precipitation_probability: number[];
  precipitation: number[];
  weather_code: number[];
  pressure_msl: number[];
  cloud_cover: number[];
  visibility: number[];
  wind_speed_10m: number[];
  wind_direction_10m: number[];
  uv_index: number[];
}

export interface DailyWeather {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  apparent_temperature_max: number[];
  apparent_temperature_min: number[];
  sunrise: string[];
  sunset: string[];
  uv_index_max: number[];
  precipitation_sum: number[];
  precipitation_probability_max: number[];
  wind_speed_10m_max: number[];
  wind_gusts_10m_max?: number[];
  wind_direction_10m_dominant?: number[];
}

export interface WeatherApiResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: Record<string, string>;
  current: CurrentWeather;
  hourly_units: Record<string, string>;
  hourly: HourlyWeather;
  daily_units: Record<string, string>;
  daily: DailyWeather;
}

export interface WeatherIntelligence {
  outdoorScore: number; // 0 - 100
  outdoorLevel: 'Optimal' | 'Favorable' | 'Challenging' | 'Hazardous';
  outdoorSummary: string;
  bestOutdoorHours: string;

  commuteRisk: 'Low' | 'Moderate' | 'High';
  commuteSummary: string;
  roadConditions: string;

  clothingAdvice: {
    layers: string;
    outerwear: string;
    accessories: string[];
    summary: string;
  };

  uvGuidance: {
    maxIndex: number;
    category: 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extreme';
    burnTimeEstimate: string;
    spfRecommendation: string;
    action: string;
  };

  umbrellaAdvice: {
    needed: boolean;
    urgency: 'None' | 'Optional' | 'Recommended' | 'Essential';
    maxProbability: number;
    timeframe: string;
    summary: string;
  };

  carWashIndex: {
    rating: 'Great Day' | 'Fair' | 'Not Recommended';
    reason: string;
    consecutiveDryDays: number;
  };

  ventilationIndex: {
    status: 'Ideal' | 'Moderate' | 'Keep Closed';
    summary: string;
    optimalWindow: string;
  };

  goldenHour: {
    morning: string;
    evening: string;
    quality: string;
  };
}
