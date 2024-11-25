import express from 'express';
import axios from 'axios';
import { validateCoordinates } from '../utils/utils.js'

const router = express.Router();
router.use(express.json());

router.get('/data', async (req, res) => {
  const { latitude, longitude } = req.query;

  if (!validateCoordinates(latitude, longitude)) {
    return res.status(400).json({ error: "Please provide correct latitude and longitude" });
  }

  const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=weathercode,temperature_2m_min,temperature_2m_max,sunshine_duration&timezone=auto`;

  try {
    const resp = await axios.get(apiUrl);
    const data = resp.data.daily;

    const result = data.time.map((date, i) => {
      const weatherCode = data.weathercode[i];
      const minTemp = data.temperature_2m_min[i];
      const maxTemp = data.temperature_2m_max[i];
      const sunshineDuration = data.sunshine_duration[i] || 0; // seconds

      // Calculation of the generated energy
      const INSTALLATION_POWER = 2.5; // kWt
      const PANEL_EFFICIENCY = 0.2; // 20%
      const generatedEnergy = INSTALLATION_POWER * (sunshineDuration / 3600) * PANEL_EFFICIENCY; // kWh

      return {
        id: i,
        date: new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(date)),
        weatherCode, // https://open-meteo.com/en/docs/dwd-api - WMO Weather interpretation codes (WW) section
        minTemp,
        maxTemp,
        sunshineDuration: Math.round(sunshineDuration / 60), // minutes
        generatedEnergy: generatedEnergy.toFixed(2) // kWh
      };
    });

    res.json(result);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Failed to get weather data" });
  }
});


router.get('/summary', async (req, res) => {
  const { latitude, longitude } = req.query;

  if (!validateCoordinates(latitude, longitude)) {
    return res.status(400).json({ error: "Please provide correct latitude and longitude" });
  }

  const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=sunshine_duration,temperature_2m_max,temperature_2m_min,weather_code&hourly=surface_pressure&timezone=auto`;

  try {
    const response = await axios.get(apiUrl);
    const data = response.data;

    // Average pressure
    const pressures = data.hourly.surface_pressure;
    const avgPressure = pressures.reduce((sum, pressure) => sum + pressure, 0) / pressures.length;

    // Average Sunshine
    const sunDurations = data.daily.sunshine_duration;
    // mins - not sure what is preferred
    const avgSunshine = (sunDurations.reduce((sum, duration) => sum + duration, 0) / sunDurations.length) / 60;

    const minMaxTemps = {
      minTemp: Math.min(...data.daily.temperature_2m_min),
      maxTemp: Math.max(...data.daily.temperature_2m_max)
    };

    // Weather summary by the week
    const weatherCodes = data.daily.weather_code;
    // weather codes 51-99 are precipitation
    const precipitationDays = weatherCodes.filter(code => code >= 51 && code <= 99).length;
    const summary = precipitationDays >= 4 ? 'Week with precipitation' : 'Week without precipitation';

    res.json({
      avgPressure: Math.round(avgPressure),
      avgSunshine: Math.round(avgSunshine),
      minTemp: minMaxTemps.minTemp,
      maxTemp: minMaxTemps.maxTemp,
      summary
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to get weather data" });
  }
});

export default router;
