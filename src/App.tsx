import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  GeoLocationResult,
  UnitPreferences,
  WeatherApiResponse,
  WeatherIntelligence,
} from './types/weather';
import {
  POPULAR_CITIES,
  fetchWeather,
  reverseGeocodeCoordinates,
  WeatherApiError,
} from './services/weatherApi';
import { computeWeatherIntelligence } from './utils/intelligenceEngine';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { CurrentWeatherCard } from './components/CurrentWeatherCard';
import { ForecastDaily } from './components/ForecastDaily';
import { HourlyBreakdown } from './components/HourlyBreakdown';
import { WeatherCharts } from './components/WeatherCharts';
import { PlanningIntelligence } from './components/PlanningIntelligence';
import { ErrorBanner } from './components/ErrorBanner';
import { Loader2 } from 'lucide-react';

const LAST_LOCATION_KEY = 'aura_weather_last_location_v1';
const PREFERENCES_KEY = 'aura_weather_preferences_v1';

export default function App() {
  // Stored unit preferences
  const [units, setUnits] = useState<UnitPreferences>(() => {
    try {
      const saved = localStorage.getItem(PREFERENCES_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return {
      temperature: 'celsius',
      windSpeed: 'kmh',
      precipitation: 'mm',
    };
  });

  // Stored location or default to Tokyo
  const [currentLocation, setCurrentLocation] = useState<GeoLocationResult>(() => {
    try {
      const saved = localStorage.getItem(LAST_LOCATION_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return POPULAR_CITIES[0]; // Tokyo default
  });

  const [weatherData, setWeatherData] = useState<WeatherApiResponse | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Compute Weather Intelligence when data arrives
  const intelligence: WeatherIntelligence | null = useMemo(() => {
    if (!weatherData) return null;
    return computeWeatherIntelligence(weatherData);
  }, [weatherData]);

  // Fetch weather data for the current location & units
  const loadWeather = useCallback(
    async (loc: GeoLocationResult, currentUnits: UnitPreferences) => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const data = await fetchWeather(
          loc.latitude,
          loc.longitude,
          currentUnits,
          loc.timezone || 'auto'
        );
        setWeatherData(data);
      } catch (err: unknown) {
        if (err instanceof WeatherApiError) {
          setErrorMessage(err.message);
        } else if (err instanceof Error) {
          setErrorMessage(err.message);
        } else {
          setErrorMessage('Unable to retrieve weather forecast for this location. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    loadWeather(currentLocation, units);
  }, [currentLocation, units, loadWeather]);

  // Save location to storage
  const handleSelectLocation = (loc: GeoLocationResult) => {
    setCurrentLocation(loc);
    setSelectedDayIndex(0);
    try {
      localStorage.setItem(LAST_LOCATION_KEY, JSON.stringify(loc));
    } catch {
      // Ignore
    }
  };

  // Update units
  const handleUpdateUnits = (newUnits: Partial<UnitPreferences>) => {
    const updated = { ...units, ...newUnits };
    setUnits(updated);
    try {
      localStorage.setItem(PREFERENCES_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  // Refresh
  const handleRefresh = () => {
    loadWeather(currentLocation, units);
  };

  // Browser Geolocation
  const handleLocateMe = () => {
    if (!('geolocation' in navigator)) {
      setErrorMessage('Geolocation is not supported by your browser environment.');
      return;
    }

    setIsLocating(true);
    setErrorMessage(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const locResult = await reverseGeocodeCoordinates(lat, lon);
          handleSelectLocation(locResult);
        } catch {
          // Fallback to coordinates
          const fallbackLoc: GeoLocationResult = {
            id: Date.now(),
            name: 'Local Position',
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
            country: 'GPS Fix',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          };
          handleSelectLocation(fallbackLoc);
        } finally {
          setIsLocating(false);
        }
      },
      (err) => {
        setIsLocating(false);
        let msg = 'Unable to acquire location.';
        if (err.code === 1) {
          msg = 'Geolocation access was denied. Please permit location permissions or search your city manually.';
        } else if (err.code === 2) {
          msg = 'Location position unavailable. Please search your city using the search bar.';
        } else if (err.code === 3) {
          msg = 'Location request timed out. Please try searching manually.';
        }
        setErrorMessage(msg);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Bar following design constitution */}
      <Header
        units={units}
        onUpdateUnits={handleUpdateUnits}
        onLocateMe={handleLocateMe}
        onRefresh={handleRefresh}
        isLocating={isLocating}
        isLoading={isLoading}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* City Search Bar & Popular Chips */}
        <section aria-label="City Search">
          <SearchBar
            currentLocation={currentLocation}
            onSelectLocation={handleSelectLocation}
            isLoading={isLoading}
          />
        </section>

        {/* Error notification banner if needed */}
        {errorMessage && (
          <ErrorBanner
            message={errorMessage}
            onRetry={handleRefresh}
            onDismiss={() => setErrorMessage(null)}
            onSelectDefault={() => handleSelectLocation(POPULAR_CITIES[0])}
          />
        )}

        {/* Loading Skeleton */}
        {isLoading && !weatherData && (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-sky-400" />
            <p className="text-sm text-slate-400">
              Querying Open-Meteo High-Resolution Atmospheric Model...
            </p>
          </div>
        )}

        {/* Populated Data Dashboard */}
        {weatherData && (
          <div className="space-y-8 animate-fade-in">
            {/* 1. Current Weather Hero & Telemetry Grid */}
            <CurrentWeatherCard
              location={currentLocation}
              data={weatherData}
            />

            {/* 2. 7-Day Synoptic Forecast Cards */}
            <ForecastDaily
              data={weatherData}
              selectedDayIndex={selectedDayIndex}
              onSelectDay={setSelectedDayIndex}
            />

            {/* 3. 24-Hour Synoptic Progression for Selected Day */}
            <HourlyBreakdown
              data={weatherData}
              selectedDayIndex={selectedDayIndex}
            />

            {/* 4. Atmospheric Dynamic SVG Trends & Charts */}
            <WeatherCharts
              data={weatherData}
              selectedDayIndex={selectedDayIndex}
            />

            {/* 5. Planning Intelligence & Recommendation Engine */}
            {intelligence && (
              <PlanningIntelligence intelligence={intelligence} />
            )}
          </div>
        )}
      </main>

      {/* Clean quiet footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950/60 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>Aura Weather Intelligence</span>
            <span aria-hidden="true">·</span>
            <span>Data powered by Open-Meteo Public APIs</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>WMO Synoptic Standards</span>
            <span aria-hidden="true">·</span>
            <span>Non-commercial Open Data</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
