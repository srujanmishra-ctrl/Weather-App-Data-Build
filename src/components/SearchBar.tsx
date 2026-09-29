import React, { useState, useEffect, useRef } from 'react';
import { GeoLocationResult } from '../types/weather';
import { searchCities, POPULAR_CITIES } from '../services/weatherApi';
import { Search, X, MapPin, History, Clock, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';

interface SearchBarProps {
  currentLocation: GeoLocationResult;
  onSelectLocation: (location: GeoLocationResult) => void;
  isLoading: boolean;
}

const SEARCH_HISTORY_KEY = 'aura_weather_recent_searches_v1';

export const SearchBar: React.FC<SearchBarProps> = ({
  currentLocation,
  onSelectLocation,
  isLoading,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeoLocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [recentSearches, setRecentSearches] = useState<GeoLocationResult[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch {
      // localStorage may fail in restricted sandboxes
    }
  }, []);

  const saveToHistory = (loc: GeoLocationResult) => {
    try {
      const updated = [loc, ...recentSearches.filter((item) => item.id !== loc.id)].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
    } catch {
      // Ignore storage errors
    }
  };

  const removeHistoryItem = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    const updated = recentSearches.filter((item) => item.id !== id);
    setRecentSearches(updated);
    try {
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const clearAllHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch {
      // Ignore
    }
  };

  // Debounced search
  useEffect(() => {
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setIsSearching(false);
      setSearchError(null);
      return;
    }

    const abortController = new AbortController();
    setIsSearching(true);
    setSearchError(null);

    const timer = setTimeout(async () => {
      try {
        const hits = await searchCities(query, abortController.signal);
        setResults(hits);
        if (hits.length === 0) {
          setSearchError(`No cities found matching "${query}". Please check spelling or try a country name.`);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== 'AbortError') {
          setSearchError(err.message || 'Error communicating with geocoding service.');
        }
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      abortController.abort();
    };
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (loc: GeoLocationResult) => {
    saveToHistory(loc);
    onSelectLocation(loc);
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelect(results[selectedIndex]);
      } else if (results.length > 0) {
        handleSelect(results[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl mx-auto">
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
          {isSearching || isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
          ) : (
            <Search className="h-4 w-4" />
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search any global city or territory (e.g. Reykjavik, Kyoto, Melbourne, Vancouver)..."
          className="w-full rounded-xl bg-slate-900/90 py-3 pl-10 pr-10 text-sm text-slate-100 placeholder:text-slate-500 ring-1 ring-slate-800 transition-all focus:outline-none focus:ring-2 focus:ring-sky-500/50 shadow-lg shadow-black/20"
        />

        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setResults([]);
              setSearchError(null);
              inputRef.current?.focus();
            }}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-200"
            aria-label="Clear search input"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Autocomplete / Recent Searches Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 overflow-hidden rounded-xl border border-slate-800 bg-slate-900/95 shadow-2xl backdrop-blur-xl">
          {/* Active Search Results */}
          {results.length > 0 && (
            <div className="p-2">
              <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                Geocoded Locations
              </div>
              <ul className="space-y-0.5">
                {results.map((loc, idx) => (
                  <li key={`${loc.id}-${idx}`}>
                    <button
                      type="button"
                      onClick={() => handleSelect(loc)}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        selectedIndex === idx
                          ? 'bg-sky-500/20 text-white'
                          : 'text-slate-200 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-sky-400" />
                        <span className="font-medium text-slate-100">{loc.name}</span>
                        {(loc.admin1 || loc.country) && (
                          <span className="text-xs text-slate-400 truncate">
                            {[loc.admin1, loc.country].filter(Boolean).join(', ')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0 text-xs text-slate-500">
                        {loc.country_code && (
                          <span className="font-tabular font-semibold text-[11px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                            {loc.country_code}
                          </span>
                        )}
                        <ArrowRight className="h-3 w-3 text-slate-600" />
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Graceful Error / No Results State */}
          {searchError && (
            <div className="flex items-start gap-2.5 p-4 text-xs text-rose-300 bg-rose-500/10 border-t border-rose-500/20">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium">{searchError}</p>
                <p className="text-slate-400">
                  Tip: Ensure standard spelling or search major metropolitan administrative centers.
                </p>
              </div>
            </div>
          )}

          {/* Recent Searches (when query is empty) */}
          {!query && recentSearches.length > 0 && (
            <div className="p-2 border-b border-slate-800/80">
              <div className="flex items-center justify-between px-3 py-1.5">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                  <History className="h-3 w-3" /> Recent Searches
                </span>
                <button
                  type="button"
                  onClick={clearAllHistory}
                  className="text-[11px] text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Clear history
                </button>
              </div>
              <ul className="space-y-0.5">
                {recentSearches.map((loc) => (
                  <li key={`recent-${loc.id}`}>
                    <div
                      onClick={() => handleSelect(loc)}
                      className="group flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-left text-sm text-slate-200 transition-colors hover:bg-slate-800/80"
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Clock className="h-3.5 w-3.5 shrink-0 text-slate-500 group-hover:text-sky-400" />
                        <span className="font-medium">{loc.name}</span>
                        {loc.country && <span className="text-xs text-slate-400">· {loc.country}</span>}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => removeHistoryItem(e, loc.id)}
                        className="rounded p-1 text-slate-500 opacity-60 hover:opacity-100 hover:text-slate-300"
                        title="Remove from history"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Quick Picks / Popular Metropolises */}
          {!query && (
            <div className="p-3 bg-slate-950/40">
              <div className="px-1 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
                Global Meteorological Stations
              </div>
              <div className="flex flex-wrap gap-1.5">
                {POPULAR_CITIES.map((city) => (
                  <button
                    key={city.id}
                    type="button"
                    onClick={() => handleSelect(city)}
                    className="flex items-center gap-1.5 rounded-lg bg-slate-800/60 px-2.5 py-1 text-xs text-slate-300 ring-1 ring-slate-700/50 hover:bg-slate-800 hover:text-white transition-colors"
                  >
                    <span>{city.name}</span>
                    <span className="text-[10px] text-slate-500">{city.country_code}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Quick City Bar below input when dropdown closed */}
      <div className="mt-2.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
        <span className="text-slate-500 shrink-0">Popular:</span>
        {POPULAR_CITIES.slice(0, 6).map((c) => {
          const isSelected = c.name.toLowerCase() === currentLocation.name.toLowerCase();
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => handleSelect(c)}
              className={`rounded-md px-2 py-0.5 text-xs transition-colors ${
                isSelected
                  ? 'bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/30'
                  : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              {c.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};
