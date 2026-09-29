import { GeoLocationResult, UnitPreferences, WeatherApiResponse } from '../types/weather';

export const POPULAR_CITIES: GeoLocationResult[] = [
  {
    id: 1850147,
    name: 'Tokyo',
    latitude: 35.6895,
    longitude: 139.6917,
    country: 'Japan',
    country_code: 'JP',
    admin1: 'Tokyo',
    timezone: 'Asia/Tokyo',
  },
  {
    id: 2643743,
    name: 'London',
    latitude: 51.5085,
    longitude: -0.1257,
    country: 'United Kingdom',
    country_code: 'GB',
    admin1: 'England',
    timezone: 'Europe/London',
  },
  {
    id: 5128581,
    name: 'New York',
    latitude: 40.7128,
    longitude: -74.006,
    country: 'United States',
    country_code: 'US',
    admin1: 'New York',
    timezone: 'America/New_York',
  },
  {
    id: 2988507,
    name: 'Paris',
    latitude: 48.8534,
    longitude: 2.3488,
    country: 'France',
    country_code: 'FR',
    admin1: 'Île-de-France',
    timezone: 'Europe/Paris',
  },
  {
    id: 5391959,
    name: 'San Francisco',
    latitude: 37.7749,
    longitude: -122.4194,
    country: 'United States',
    country_code: 'US',
    admin1: 'California',
    timezone: 'America/Los_Angeles',
  },
  {
    id: 2147714,
    name: 'Sydney',
    latitude: -33.8678,
    longitude: 151.2073,
    country: 'Australia',
    country_code: 'AU',
    admin1: 'New South Wales',
    timezone: 'Australia/Sydney',
  },
  {
    id: 292223,
    name: 'Dubai',
    latitude: 25.0772,
    longitude: 55.3093,
    country: 'United Arab Emirates',
    country_code: 'AE',
    admin1: 'Dubai',
    timezone: 'Asia/Dubai',
  },
  {
    id: 1880252,
    name: 'Singapore',
    latitude: 1.2897,
    longitude: 103.8501,
    country: 'Singapore',
    country_code: 'SG',
    admin1: 'Singapore',
    timezone: 'Asia/Singapore',
  },
];

export class WeatherApiError extends Error {
  constructor(message: string, public readonly code: 'NOT_FOUND' | 'NETWORK_ERROR' | 'INVALID_INPUT' | 'SERVER_ERROR') {
    super(message);
    this.name = 'WeatherApiError';
  }
}

/**
 * Searches for cities using Open-Meteo Geocoding API
 */
export async function searchCities(
  query: string,
  signal?: AbortSignal
): Promise<GeoLocationResult[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) {
    return [];
  }

  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    trimmed
  )}&count=10&language=en&format=json`;

  try {
    const response = await fetch(url, { signal });
    if (!response.ok) {
      throw new WeatherApiError(
        `Geocoding server responded with status ${response.status}`,
        'SERVER_ERROR'
      );
    }

    const data = await response.json();
    if (!data.results || !Array.isArray(data.results) || data.results.length === 0) {
      return [];
    }

    return data.results as GeoLocationResult[];
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return [];
    }
    if (err instanceof WeatherApiError) {
      throw err;
    }
    throw new WeatherApiError(
      'Unable to connect to the geocoding service. Please check your internet connection and try again.',
      'NETWORK_ERROR'
    );
  }
}

/**
 * Fetches comprehensive current, 24-hour, and 7-day forecast from Open-Meteo Forecast API
 */
export async function fetchWeather(
  latitude: number,
  longitude: number,
  units: UnitPreferences,
  timezone = 'auto',
  signal?: AbortSignal
): Promise<WeatherApiResponse> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    timezone: timezone || 'auto',
    temperature_unit: units.temperature,
    wind_speed_unit: units.windSpeed,
    precipitation_unit: units.precipitation,
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'weather_code',
      'cloud_cover',
      'pressure_msl',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
    ].join(','),
    hourly: [
      'temperature_2m',
      'relative_humidity_2m',
      'dew_point_2m',
      'apparent_temperature',
      'precipitation_probability',
      'precipitation',
      'weather_code',
      'pressure_msl',
      'cloud_cover',
      'visibility',
      'wind_speed_10m',
      'wind_direction_10m',
      'uv_index',
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'apparent_temperature_max',
      'apparent_temperature_min',
      'sunrise',
      'sunset',
      'uv_index_max',
      'precipitation_sum',
      'precipitation_probability_max',
      'wind_speed_10m_max',
      'wind_gusts_10m_max',
      'wind_direction_10m_dominant',
    ].join(','),
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;

  try {
    const response = await fetch(url, { signal });
    if (!response.ok) {
      throw new WeatherApiError(
        `Weather service responded with error HTTP ${response.status}`,
        'SERVER_ERROR'
      );
    }
    const data = (await response.json()) as WeatherApiResponse;
    if (!data.current || !data.daily || !data.hourly) {
      throw new WeatherApiError(
        'Incomplete meteorological data returned from Open-Meteo',
        'SERVER_ERROR'
      );
    }
    return data;
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err;
    }
    if (err instanceof WeatherApiError) {
      throw err;
    }
    throw new WeatherApiError(
      'Failed to fetch weather data. Check your network connection or try again shortly.',
      'NETWORK_ERROR'
    );
  }
}

/**
 * Reverse geocodes coordinates to a readable city name using reverse-geocode client
 */
export async function reverseGeocodeCoordinates(
  latitude: number,
  longitude: number
): Promise<GeoLocationResult> {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );
    if (res.ok) {
      const data = await res.json();
      const cityName = data.city || data.locality || data.principalSubdivision || 'Local Area';
      return {
        id: Math.floor(Math.random() * 1000000),
        name: cityName,
        latitude,
        longitude,
        country: data.countryName || 'Local Region',
        country_code: data.countryCode || '',
        admin1: data.principalSubdivision || '',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
    }
  } catch {
    // Graceful fallback if external reverse-geocode is unreachable
  }

  return {
    id: Math.floor(Math.random() * 1000000),
    name: `${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°`,
    latitude,
    longitude,
    country: 'GPS Location',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };
}
