import { useState, useEffect } from 'react';
import axios from 'axios';
import { Typography } from '@mui/material';
import PropTypes from 'prop-types';

const Weather = ({ location }) => {
  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchWeather = async () => {
      try {
        // Paso 1: Obtener coordenadas de la ciudad proporcionada como prop
        const geocodeResponse = await axios.get('https://api.openweathermap.org/geo/1.0/direct', {
          params: {
            q: encodeURIComponent(location),
            limit: 1,
            appid: apiKey
          }
        });

        if (!isMounted) return;

        const { lat, lon } = geocodeResponse.data && geocodeResponse.data[0] ? 
          geocodeResponse.data[0] : { lat: null, lon: null };

        if (!lat || !lon) {
          throw new Error('No se pudieron obtener las coordenadas.');
        }

        // Paso 2: Usar coordenadas para obtener el clima actual
        const weatherResponse = await axios.get('https://api.openweathermap.org/data/2.5/weather', {
          params: {
            lat,
            lon,
            units: 'metric',
            appid: apiKey
          }
        });

        if (isMounted) {
          setWeather({
            temp: weatherResponse.data.main.temp.toFixed(1),
            tempMin: weatherResponse.data.main.temp_min.toFixed(1),
            tempMax: weatherResponse.data.main.temp_max.toFixed(1),
          });
        }
      } catch (err) {
        if (isMounted) {
          setError(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchWeather();

    return () => {
      isMounted = false;
    };
  }, [location, apiKey]);

  if (loading) {
    return (
      <Typography variant="body1">
        Cargando datos del clima...
      </Typography>
    );
  }

  if (error) {
    console.error('Error al obtener los datos del clima:', error);
    return (
      <Typography variant="body1" color="error">
        Error al cargar datos del clima.
      </Typography>
    );
  }

  return (
    <div>
      <Typography variant="h6">
        Clima en {location}
      </Typography>
      <Typography variant="body1">
        Actual: {weather.temp} °C
      </Typography>
      <Typography variant="body2">
        Mínima: {weather.tempMin} °C
      </Typography>
      <Typography variant="body2">
        Máxima: {weather.tempMax} °C
      </Typography>
    </div>
  );
};

Weather.propTypes = {
  location: PropTypes.string.isRequired,
};

export default Weather;
