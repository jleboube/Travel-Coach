// Weather API integration for CoachHub Baseball
// Uses OpenWeatherMap API for 72-hour forecasts

export interface WeatherData {
  temp: number
  feelsLike: number
  description: string
  icon: string
  humidity: number
  windSpeed: number
  precipitation: number
}

export async function getWeatherForecast(
  location: string
): Promise<WeatherData | null> {
  const apiKey = process.env.WEATHER_API_KEY

  if (!apiKey) {
    console.warn("Weather API key not configured")
    return null
  }

  try {
    // Geocode location first
    const geoResponse = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${apiKey}`
    )

    if (!geoResponse.ok) {
      throw new Error("Failed to geocode location")
    }

    const geoData = await geoResponse.json()

    if (!geoData || geoData.length === 0) {
      return null
    }

    const { lat, lon } = geoData[0]

    // Get weather data
    const weatherResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`
    )

    if (!weatherResponse.ok) {
      throw new Error("Failed to fetch weather data")
    }

    const weatherData = await weatherResponse.json()

    return {
      temp: Math.round(weatherData.main.temp),
      feelsLike: Math.round(weatherData.main.feels_like),
      description: weatherData.weather[0].description,
      icon: weatherData.weather[0].icon,
      humidity: weatherData.main.humidity,
      windSpeed: Math.round(weatherData.wind.speed),
      precipitation: weatherData.rain?.["1h"] || 0,
    }
  } catch (error) {
    console.error("Error fetching weather:", error)
    return null
  }
}

export async function get3DayForecast(
  location: string
): Promise<WeatherData[] | null> {
  const apiKey = process.env.WEATHER_API_KEY

  if (!apiKey) {
    console.warn("Weather API key not configured")
    return null
  }

  try {
    // Geocode location first
    const geoResponse = await fetch(
      `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(location)}&limit=1&appid=${apiKey}`
    )

    if (!geoResponse.ok) {
      throw new Error("Failed to geocode location")
    }

    const geoData = await geoResponse.json()

    if (!geoData || geoData.length === 0) {
      return null
    }

    const { lat, lon } = geoData[0]

    // Get 3-day forecast
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=imperial&appid=${apiKey}`
    )

    if (!forecastResponse.ok) {
      throw new Error("Failed to fetch forecast data")
    }

    const forecastData = await forecastResponse.json()

    // Get one forecast per day (noon time)
    const dailyForecasts: WeatherData[] = []
    const processedDays = new Set<string>()

    for (const item of forecastData.list) {
      const date = new Date(item.dt * 1000)
      const dateString = date.toDateString()

      if (!processedDays.has(dateString) && date.getHours() === 12) {
        dailyForecasts.push({
          temp: Math.round(item.main.temp),
          feelsLike: Math.round(item.main.feels_like),
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          humidity: item.main.humidity,
          windSpeed: Math.round(item.wind.speed),
          precipitation: item.rain?.["3h"] || 0,
        })
        processedDays.add(dateString)

        if (dailyForecasts.length === 3) break
      }
    }

    return dailyForecasts
  } catch (error) {
    console.error("Error fetching forecast:", error)
    return null
  }
}
