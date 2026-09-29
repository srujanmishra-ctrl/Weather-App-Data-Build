# Weather Intelligence App

A web application that provides real-time weather information, 7-day forecasts, and planning recommendations using the public Open-Meteo API.

---

## Deployment & Setup Guide

### 1. AI App Generation (Google AI Studio)
- Generated the Weather Intelligence App using **Google AI Studio App Build**.
- Integrated Open-Meteo Geocoding (`https://geocoding-api.open-meteo.com/v1/search`) and Forecast (`https://api.open-meteo.com/v1/forecast`) APIs.

### 2. Source Control Sync (GitHub)
- Connected Google AI Studio directly to this GitHub repository.
- Synchronized source code, components, and configuration files (`package.json`, `vite.config.ts`).

### 3. Live Deployment (Cloudflare Pages)
- Connected this GitHub repository to **Cloudflare Pages**.
- **Framework Preset**: React (Vite)
- **Build Command**: `npm run build`
- **Build Output Directory**: `dist`
- **Live URL**: `https://weather-app-data-buildv1.pages.dev/`
