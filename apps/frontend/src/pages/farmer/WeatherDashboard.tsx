import React, { useState, useEffect } from 'react';
import { Sun, CloudRain, CloudSun, Wind, Droplets, Thermometer, AlertTriangle, ShieldCheck } from 'lucide-react';
import { apiClient } from '../../api/client';

export const WeatherDashboard: React.FC = () => {
  const [district, setDistrict] = useState('Amritsar');
  const [stateName, setStateName] = useState('Punjab');
  const [weatherData, setWeatherData] = useState<any | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiClient.get(`/weather/${district}/${stateName}`);
        setWeatherData(res.data);
      } catch {
        // fallback
      }
    }
    load();
  }, [district, stateName]);

  const forecast = weatherData?.forecast || [];
  const todayForecast = forecast[0] || {
    temp_max: 32,
    temp_min: 24,
    condition: 'Clear Skies',
    humidity_pct: 55,
    rainfall_mm: 0,
    advisory: 'Optimal weather for harvesting and grain delivery.',
  };

  return (
    <div className="container mx-auto px-4 lg:px-8 py-8 max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <div className="section-label">IMD Agricultural Meteorology</div>
        <h1 className="font-heading text-2xl sm:text-3xl font-bold">
          Weather-Aware Mandi Forecast
        </h1>
        <p className="text-xs text-text-muted mt-1">
          Plan your harvesting and mandi transport based on live Indian Meteorological Department (IMD) rain alerts.
        </p>
      </div>

      {/* Today's Hero Weather Card */}
      <div className="rounded-3xl bg-gradient-to-br from-primary to-primary-dark text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-light">
              Today's District Outlook · {district}, {stateName}
            </span>
            <div className="flex items-center gap-4">
              <span className="font-heading text-5xl sm:text-6xl font-black">
                {todayForecast.temp_max}°C
              </span>
              <div className="text-sm font-semibold">
                <p>{todayForecast.condition}</p>
                <p className="text-primary-pale text-xs">Min: {todayForecast.temp_min}°C</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 bg-white/10 backdrop-blur p-4 rounded-2xl border border-white/15 text-xs">
            <div className="flex items-center gap-2">
              <Droplets className="w-4 h-4 text-blue-300" />
              <span>Humidity: {todayForecast.humidity_pct}%</span>
            </div>
            <div className="flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-blue-300" />
              <span>Rain: {todayForecast.rainfall_mm} mm</span>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="w-4 h-4 text-gray-300" />
              <span>Wind: 12 km/h</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-300" />
              <span>Mandi Open</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/15 text-xs text-primary-pale flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-gold shrink-0" />
          <span>{todayForecast.advisory}</span>
        </div>
      </div>

      {/* 7-Day Forecast Grid */}
      <div className="space-y-3">
        <h3 className="font-heading text-lg font-bold">7-Day Agricultural Forecast</h3>
        <div className="grid grid-cols-1 sm:grid-cols-7 gap-2">
          {forecast.map((day: any, idx: number) => (
            <div
              key={idx}
              className={`p-3 rounded-2xl border text-center space-y-2 flex flex-col justify-between ${
                day.is_adverse
                  ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300'
                  : 'card-farm p-3'
              }`}
            >
              <div className="text-xs font-bold uppercase text-text-muted">{day.day}</div>
              <div className="my-1 flex justify-center">
                {day.condition.includes('Rain') ? (
                  <CloudRain className="w-6 h-6 text-blue-500" />
                ) : (
                  <Sun className="w-6 h-6 text-amber-500" />
                )}
              </div>
              <div>
                <span className="font-bold text-sm text-text-primary dark:text-white">
                  {day.temp_max}°
                </span>
                <span className="text-xs text-text-muted ml-1">{day.temp_min}°</span>
              </div>
              <span className="text-[10px] text-text-muted truncate block">{day.condition}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherDashboard;
