import { WeatherApiResponse, WeatherIntelligence } from '../types/weather';
import { getUVClassification } from './weatherCodes';

export function computeWeatherIntelligence(data: WeatherApiResponse): WeatherIntelligence {
  const current = data.current;
  const hourly = data.hourly;
  const daily = data.daily;

  // Normalized temperature in Celsius for internal thresholds
  const tempUnit = data.current_units.temperature_2m || '°C';
  const currentTempC = tempUnit.includes('F')
    ? (current.temperature_2m - 32) * (5 / 9)
    : current.temperature_2m;
  const currentApparentTempC = tempUnit.includes('F')
    ? (current.apparent_temperature - 32) * (5 / 9)
    : current.apparent_temperature;

  // Next 12 hours window analysis
  const next12HoursPrecipProb = (hourly.precipitation_probability || []).slice(0, 12);
  const maxPrecipProb12h = next12HoursPrecipProb.length > 0 ? Math.max(...next12HoursPrecipProb) : 0;
  const next12HoursRain = (hourly.precipitation || []).slice(0, 12);
  const totalRain12h = next12HoursRain.reduce((acc, v) => acc + (v || 0), 0);
  const next12HoursWind = (hourly.wind_speed_10m || []).slice(0, 12);
  const maxWind12h = next12HoursWind.length > 0 ? Math.max(...next12HoursWind) : current.wind_speed_10m;

  // 1. Outdoor Activity Score (0 - 100)
  // Ideal: 16°C - 23°C, 35% - 60% humidity, wind < 20 km/h, 0% rain, UV < 6
  let outdoorScore = 100;

  // Temperature penalty
  if (currentApparentTempC < 5) outdoorScore -= Math.min(45, (5 - currentApparentTempC) * 2.5);
  else if (currentApparentTempC < 14) outdoorScore -= (14 - currentApparentTempC) * 1.5;
  else if (currentApparentTempC > 25 && currentApparentTempC <= 32) outdoorScore -= (currentApparentTempC - 25) * 2.5;
  else if (currentApparentTempC > 32) outdoorScore -= 20 + (currentApparentTempC - 32) * 5;

  // Rain penalty
  if (maxPrecipProb12h > 70 || totalRain12h > 2.5) outdoorScore -= 45;
  else if (maxPrecipProb12h > 40 || totalRain12h > 0.5) outdoorScore -= 25;
  else if (maxPrecipProb12h > 20) outdoorScore -= 10;

  // Wind penalty (km/h)
  const windKmh = data.current_units.wind_speed_10m?.includes('mp') ? current.wind_speed_10m * 1.609 : current.wind_speed_10m;
  if (windKmh > 40) outdoorScore -= 30;
  else if (windKmh > 25) outdoorScore -= 15;

  // Humidity extreme penalty
  if (current.relative_humidity_2m > 85) outdoorScore -= 15;
  else if (current.relative_humidity_2m < 20) outdoorScore -= 10;

  outdoorScore = Math.max(10, Math.min(100, Math.round(outdoorScore)));

  let outdoorLevel: WeatherIntelligence['outdoorLevel'] = 'Optimal';
  if (outdoorScore < 40) outdoorLevel = 'Hazardous';
  else if (outdoorScore < 65) outdoorLevel = 'Challenging';
  else if (outdoorScore < 85) outdoorLevel = 'Favorable';

  let outdoorSummary = '';
  if (outdoorLevel === 'Optimal') outdoorSummary = 'Superb meteorological conditions for running, cycling, or outdoor recreation.';
  else if (outdoorLevel === 'Favorable') outdoorSummary = 'Pleasant conditions; minor breeze or temperature adjustments recommended.';
  else if (outdoorLevel === 'Challenging') outdoorSummary = 'Sub-optimal weather with either active precipitation, chill, or elevated winds.';
  else outdoorSummary = 'Adverse atmospheric activity. Indoor workouts or sheltered venues strongly advised.';

  // Identify best outdoor hour window from hourly forecast
  let bestHourIndex = 0;
  let lowestPenalty = 999;
  for (let i = 0; i < Math.min(18, hourly.time.length); i++) {
    const hTime = new Date(hourly.time[i]);
    const hour = hTime.getHours();
    // Only daytime / evening hours (6am to 20pm)
    if (hour >= 6 && hour <= 20) {
      const pProb = hourly.precipitation_probability[i] || 0;
      const hWind = hourly.wind_speed_10m[i] || 0;
      const penalty = pProb * 1.5 + hWind;
      if (penalty < lowestPenalty) {
        lowestPenalty = penalty;
        bestHourIndex = i;
      }
    }
  }
  const bestHourDate = new Date(hourly.time[bestHourIndex] || Date.now());
  const bestOutdoorHours = `${bestHourDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} – ${new Date(bestHourDate.getTime() + 2 * 3600000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;

  // 2. Commute & Travel Advisory
  let commuteRisk: WeatherIntelligence['commuteRisk'] = 'Low';
  let commuteSummary = 'Road and transit routes expected to run at normal velocity.';
  let roadConditions = 'Dry pavement and clear visibility.';

  const isFreezing = currentTempC <= 1;
  const isHeavyRain = totalRain12h > 5 || maxPrecipProb12h > 75;
  const isHighWind = windKmh > 35;
  const isFog = current.weather_code === 45 || current.weather_code === 48;

  if (isFreezing && (isHeavyRain || current.precipitation > 0)) {
    commuteRisk = 'High';
    commuteSummary = 'High risk of slick black ice or freezing precipitation on arterial routes.';
    roadConditions = 'Icy patches, hazardous stopping distance, bridge freeze warnings.';
  } else if (isHeavyRain || isFog || isHighWind) {
    commuteRisk = 'Moderate';
    commuteSummary = isFog
      ? 'Reduced visibility due to dense surface fog; allow extra travel buffer.'
      : isHeavyRain
      ? 'Surface water buildup and spray reducing highway visibility.'
      : 'High crosswinds affecting high-profile vehicles and bridge crossings.';
    roadConditions = isFog ? 'Severely restricted sightlines (< 1km)' : isHeavyRain ? 'Wet tarmac with hydroplaning risk' : 'Gusty crosswinds';
  }

  // 3. Clothing & Wardrobe Strategy
  let layers = 'Single lightweight breathable layer';
  let outerwear = 'No jacket required';
  const accessories: string[] = [];
  let clothingSummary = 'Warm weather setup.';

  if (currentApparentTempC < 0) {
    layers = 'Heavy thermal base layer + mid-weight fleece/wool sweater';
    outerwear = 'Insulated winter parka or heavy down jacket';
    accessories.push('Thermal beanie', 'Insulated gloves', 'Warm wool scarf');
    clothingSummary = 'Sub-zero wind chill requires complete multi-layer thermal insulation.';
  } else if (currentApparentTempC < 8) {
    layers = 'Long-sleeve base + mid-weight knit sweater or hoodie';
    outerwear = 'Tailored coat, trench or mid-weight insulated shell';
    accessories.push('Light scarf', 'Fleece gloves if walking extended distances');
    clothingSummary = 'Crisp cold air; windproof outer layer prevents body heat loss.';
  } else if (currentApparentTempC < 16) {
    layers = 'Breathable shirt or oxford with lightweight knit/cardigan';
    outerwear = 'Denim jacket, bomber, or light utility windbreaker';
    clothingSummary = 'Comfortably cool; effortless layering allows easy adjustment.';
  } else if (currentApparentTempC < 24) {
    layers = 'Cotton t-shirt, linen polo, or light casual top';
    outerwear = 'Optional lightweight overshirt for evening hours';
    clothingSummary = 'Temperate goldilocks range; relaxed breathable fabrics.';
  } else {
    layers = 'Ultra-lightweight natural linens or moisture-wicking fabrics';
    outerwear = 'None; loose silhouettes recommended';
    accessories.push('Polarized sunglasses', 'Breathable sun hat');
    clothingSummary = 'Warm to hot conditions; prioritize airflow and UV-protective garments.';
  }

  if (maxPrecipProb12h > 40) {
    outerwear = outerwear.includes('parka') ? outerwear : `${outerwear} (Water-resistant / repellent outer shell recommended)`;
    accessories.push('Waterproof footwear');
  }

  // 4. UV Guidance
  const todayUvMax = daily.uv_index_max?.[0] ?? current.cloud_cover > 70 ? 2 : 5;
  const uvClassification = getUVClassification(todayUvMax);
  let burnTimeEstimate = '60+ minutes';
  let spfRecommendation = 'SPF 15 (Daily basic)';
  let uvAction = 'Minimal sun protection required for normal exposure.';

  if (todayUvMax >= 11) {
    burnTimeEstimate = 'Under 10 minutes without barrier';
    spfRecommendation = 'SPF 50+ with broad UVA/UVB spectrum';
    uvAction = 'Avoid direct midday sun from 10:00 to 16:00. Wear protective sunglasses & wide-brim hat.';
  } else if (todayUvMax >= 8) {
    burnTimeEstimate = '15–20 minutes without barrier';
    spfRecommendation = 'SPF 30 to SPF 50';
    uvAction = 'Seek shade during peak daylight; apply sunscreen every 2 hours.';
  } else if (todayUvMax >= 6) {
    burnTimeEstimate = '25–35 minutes';
    spfRecommendation = 'SPF 30';
    uvAction = 'Wear sunglasses and apply sunscreen if outdoors for extended periods.';
  } else if (todayUvMax >= 3) {
    burnTimeEstimate = '45–60 minutes';
    spfRecommendation = 'SPF 15+ to 30';
    uvAction = 'Standard daytime protection; sunglasses recommended on clear days.';
  }

  // 5. Umbrella & Precipitation Alert
  let umbrellaUrgency: WeatherIntelligence['umbrellaAdvice']['urgency'] = 'None';
  let umbrellaNeeded = false;
  let umbrellaSummary = 'Clear forecast; zero need for rain gear.';
  let umbrellaTimeframe = 'No precipitation expected across the forecast horizon.';

  if (maxPrecipProb12h >= 70 || totalRain12h > 3) {
    umbrellaUrgency = 'Essential';
    umbrellaNeeded = true;
    umbrellaSummary = 'Significant precipitation imminent. Keep a sturdy umbrella or rain shell on hand.';
    umbrellaTimeframe = 'Active showers expected during morning & afternoon cycles.';
  } else if (maxPrecipProb12h >= 45 || totalRain12h > 0.8) {
    umbrellaUrgency = 'Recommended';
    umbrellaNeeded = true;
    umbrellaSummary = 'Passing showers probable. A compact folding umbrella is smart insurance.';
    umbrellaTimeframe = 'Intermittent scattered dampness across the next 12 hours.';
  } else if (maxPrecipProb12h >= 25) {
    umbrellaUrgency = 'Optional';
    umbrellaNeeded = false;
    umbrellaSummary = 'Low rain likelihood; isolated drops possible but largely dry.';
    umbrellaTimeframe = 'Minor 20-30% chance during transitional cloud periods.';
  }

  // 6. Car Wash Index
  // Check next 3 days precipitation probability and sum
  const next3DaysPrecipSum = (daily.precipitation_sum || []).slice(0, 3);
  const next3DaysMaxProb = (daily.precipitation_probability_max || []).slice(0, 3);
  let consecutiveDryDays = 0;
  for (let i = 0; i < Math.min(5, next3DaysMaxProb.length); i++) {
    if (next3DaysMaxProb[i] < 30 && (next3DaysPrecipSum[i] || 0) < 0.5) {
      consecutiveDryDays++;
    } else {
      break;
    }
  }

  let carWashRating: WeatherIntelligence['carWashIndex']['rating'] = 'Fair';
  let carWashReason = 'Uncertain conditions with mixed cloud patterns.';
  if (consecutiveDryDays >= 3) {
    carWashRating = 'Great Day';
    carWashReason = `Clean window ahead with at least ${consecutiveDryDays} continuous dry days predicted.`;
  } else if (consecutiveDryDays === 1 || consecutiveDryDays === 2) {
    carWashRating = 'Fair';
    carWashReason = `Short dry spell of ${consecutiveDryDays} day(s), but showers return later in the week.`;
  } else {
    carWashRating = 'Not Recommended';
    carWashReason = 'Imminent rain or wet road spray will undo cleaning within 24 hours.';
  }

  // 7. Ventilation Index (Airing the house out)
  let ventilationStatus: WeatherIntelligence['ventilationIndex']['status'] = 'Ideal';
  let ventilationSummary = 'Pleasant ambient air quality and temperature for natural ventilation.';
  let optimalWindow = 'Late morning (09:00 - 11:30)';

  if (current.relative_humidity_2m > 85 || current.precipitation > 0 || currentTempC > 30) {
    ventilationStatus = 'Keep Closed';
    ventilationSummary = current.precipitation > 0
      ? 'Active rainfall dampness; keep windows sealed to prevent moisture ingress.'
      : currentTempC > 30
      ? 'High external heat; maintain closed windows to preserve interior cooling.'
      : 'Excessive ambient humidity (>85%); AC dehumidification preferred.';
    optimalWindow = 'Postpone until precipitation clears';
  } else if (currentTempC < 8) {
    ventilationStatus = 'Moderate';
    ventilationSummary = 'Cold external atmosphere; perform quick 5-minute air flush to refresh room air.';
    optimalWindow = 'Midday peak (12:00 - 14:00) during highest ambient warmth';
  } else {
    ventilationStatus = 'Ideal';
    ventilationSummary = 'Optimal temperature & humidity balance for refreshing indoor air circulation.';
    optimalWindow = 'Morning window (08:30 - 11:00) & early dusk';
  }

  // 8. Golden Hour Calculations (from sunrise/sunset)
  const sunriseStr = daily.sunrise?.[0] ? new Date(daily.sunrise[0]) : null;
  const sunsetStr = daily.sunset?.[0] ? new Date(daily.sunset[0]) : null;

  const morningGolden = sunriseStr
    ? `${sunriseStr.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} – ${new Date(sunriseStr.getTime() + 45 * 60000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
    : '06:15 – 07:00';
  const eveningGolden = sunsetStr
    ? `${new Date(sunsetStr.getTime() - 45 * 60000).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })} – ${sunsetStr.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
    : '17:45 – 18:30';

  const cloudCover = current.cloud_cover;
  let goldenQuality = 'Optimal warm directional sunlight with minimal obstruction.';
  if (cloudCover > 80) goldenQuality = 'Diffused illumination through dense overcast; muted sunset colors.';
  else if (cloudCover > 40) goldenQuality = 'Dramatic high-contrast sky with picturesque cloud reflections.';

  return {
    outdoorScore,
    outdoorLevel,
    outdoorSummary,
    bestOutdoorHours,
    commuteRisk,
    commuteSummary,
    roadConditions,
    clothingAdvice: {
      layers,
      outerwear,
      accessories,
      summary: clothingSummary,
    },
    uvGuidance: {
      maxIndex: todayUvMax,
      category: uvClassification.level,
      burnTimeEstimate,
      spfRecommendation,
      action: uvAction,
    },
    umbrellaAdvice: {
      needed: umbrellaNeeded,
      urgency: umbrellaUrgency,
      maxProbability: maxPrecipProb12h,
      timeframe: umbrellaTimeframe,
      summary: umbrellaSummary,
    },
    carWashIndex: {
      rating: carWashRating,
      reason: carWashReason,
      consecutiveDryDays,
    },
    ventilationIndex: {
      status: ventilationStatus,
      summary: ventilationSummary,
      optimalWindow,
    },
    goldenHour: {
      morning: morningGolden,
      evening: eveningGolden,
      quality: goldenQuality,
    },
  };
}
