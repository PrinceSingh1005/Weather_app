import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MdDarkMode, MdLightMode, MdOutlineWbSunny } from "react-icons/md";

const API_KEY = '3e07b69da025f62c779cf6822af60bd1';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

const App = () => {
  const [city, setCity] = useState('Patna');
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode !== null) {
      setDarkMode(savedMode === 'true');
    }
    fetchWeather(city);
  }, []);

  const fetchWeather = async (cityName) => {
    try {
      setLoading(true);
      setError('');

      const res = await axios.get(`${BASE_URL}/weather`, {
        params: {
          q: cityName,
          units: 'metric',
          appid: API_KEY,
        },
      });

      const forecastRes = await axios.get(`${BASE_URL}/forecast`, {
        params: {
          lat: res.data.coord.lat,
          lon: res.data.coord.lon,
          units: 'metric',
          appid: API_KEY,
        },
      });

      const dailyData = [];
      const seenDates = new Set();
      const today = new Date().toLocaleDateString();

      forecastRes.data.list.forEach((item) => {
        const date = new Date(item.dt * 1000).toLocaleDateString();
        if (date !== today && !seenDates.has(date)) {
          seenDates.add(date);
          dailyData.push(item);
        }
      });

      console.log('dailyData:', dailyData);

      setWeather(res.data);
      setForecast(dailyData.slice(0, 6));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch weather');
    } finally {
      setLoading(false);
    }
  };

  const fetchByLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          setLoading(true);
          const res = await axios.get(`${BASE_URL}/weather`, {
            params: {
              lat: latitude,
              lon: longitude,
              units: 'metric',
              appid: API_KEY,
            },
          });
          setCity(res.data.name);
          fetchWeather(res.data.name);
        } catch (error) {
          setError('Failed to fetch location-based weather.');
        } finally {
          setLoading(false);
        }
      }, () => setError('Geolocation not available'));
    } else {
      setError('Geolocation is not supported by this browser.');
    }
  };

  const handleSearch = () => {
    if (city.trim()) fetchWeather(city);
    else setError('Please enter a city name.');
  };

  const formatDate = () => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
  };


  return (
    <div
      className={`min-h-screen flex flex-col items-center p-4 bg-cover bg-no-repeat bg-center transition-all duration-500 ease-in-out`}
      style={{
        backgroundImage: `url('${darkMode ? "background2.jpeg" : "background.jpeg"}')`
      }}
    >
      <div className="flex justify-between items-center w-full max-w-5xl mb-6">
        <img src="logo.jpeg" alt="Weather App Logo" className="w-12 h-12 rounded-full" />
        <button
          onClick={toggleDarkMode}
          className={`p-2 rounded-full bg-white/80 backdrop-blur-md ${!darkMode ? 'text-yellow-400' : 'text-black'} hover:bg-white/50 transition-all duration-300`}
        >
          {darkMode ? <MdDarkMode className="text-2xl" /> : <MdLightMode className="text-2xl" />}
        </button>
      </div>

      <div className="flex flex-wrap gap-3 justify-center mb-8 w-full max-w-5xl">
        <input
          className={`px-4 py-2 rounded-xl bg-white/20 backdrop-blur-md ${darkMode ? 'text-white placeholder-gray-400' : 'text-slate-800 placeholder-gray-600'} font-medium text-xl border border-white/30 focus:ring-2 focus:ring-blue-300 focus:outline-none w-64 transition-all duration-300 hover:bg-white/30`}
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          onKeyDownCapture={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Enter city"
        />
        <button
          onClick={handleSearch}
          className="px-5 py-2 rounded-xl bg-blue-500/80 backdrop-blur-md text-white font-semibold hover:bg-blue-600/90 transition-all duration-300"
        >
          Search
        </button>
        <button
          onClick={fetchByLocation}
          className="px-5 py-2 rounded-xl bg-yellow-400/80 backdrop-blur-md text-gray-900 font-semibold hover:bg-yellow-500/90 transition-all duration-300"
        >
          Use My Location
        </button>
        <button
          onClick={() => fetchWeather(city)}
          className="px-5 py-2 rounded-xl bg-green-500/80 backdrop-blur-md text-white font-semibold hover:bg-green-600/90 transition-all duration-300"
        >
          Refresh
        </button>
      </div>

      {loading && <div className="text-lg font-medium text-white/80 animate-pulse">Loading...</div>}

      {error && (
        <div className="bg-red-500/80 backdrop-blur-md px-6 py-3 rounded-xl mb-6 text-white font-medium shadow-lg">
          {error}
        </div>
      )}

      {weather && (
        <div className={`${darkMode ? 'bg-gray-900/50 text-white' : 'bg-white/10 text-black'
          } rounded-2xl p-6 mb-6 w-full max-w-md shadow-xl backdrop-blur-md border border-white/20 transition-all duration-300 hover:shadow-2xl`}>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-3xl font-bold">{weather.name}, {weather.sys.country}</h2>
              <p className="text-sm">{formatDate()}</p>
              <p className="capitalize text-lg mt-1 font-medium">{weather.weather[0].description}</p>
            </div>
            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt={weather.weather[0].main}
              className="w-24 h-24 transform hover:scale-110 transition-transform duration-300"
            />
          </div>
          <div className="mt-4 space-y-2">
            <p className="text-lg">Temperature: <span className="font-semibold">{Math.round(weather.main.temp)}°C</span></p>
            <p className="text-lg">Feels Like: <span className="font-semibold">{Math.round(weather.main.feels_like)}°C</span></p>
            <p className="text-lg">Humidity: <span className="font-semibold">{weather.main.humidity}%</span></p>
            <p className="text-lg">Wind: <span className="font-semibold">{weather.wind.speed} m/s</span></p>
            <p className="text-lg">Pressure: <span className="font-semibold">{weather.main.pressure} hPa</span></p>
          </div>
        </div>
      )}

      {forecast.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 w-full max-w-5xl">
          {forecast.map((day, idx) => {
            const date = new Date(day.dt * 1000);
            return (
              <div
                key={idx}
                className={`${darkMode ? 'bg-gray-800/50 text-white' : 'bg-white/30 text-gray-800'
                  } p-4 rounded-xl shadow-lg backdrop-blur-md border border-white/20 text-center transition-all duration-300 hover:scale-105 hover:shadow-xl`}
              >
                <div className="font-semibold">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}<br />
                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
                <img
                  className="mx-auto my-2 w-12 h-12"
                  src={`https://openweathermap.org/img/wn/${day.weather[0].icon}.png`}
                  alt={day.weather[0].main}
                />
                <div className="capitalize text-sm font-medium">{day.weather[0].description}</div>
                <div className="mt-2">
                  <span className="font-bold text-lg">{Math.round(day.main.temp_max)}°</span> /
                  <span className="text-gray-600 dark:text-gray-300"> {Math.round(day.main.temp_min)}°</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default App;