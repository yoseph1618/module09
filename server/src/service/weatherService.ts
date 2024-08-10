import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// Define an interface for the Coordinates object
interface Coordinates {
  lat: number;
  lon: number;
}

// Define a class for the Weather object
class Weather {
  constructor(
    public city: string,
    public date: string,
    public icon: string,
    public description: string,
    public temperature: number,
    public humidity: number,
    public windSpeed: number
  ) {}
}

class WeatherService {
  private baseURL = 'http://api.openweathermap.org/data/2.5';
  private apiKey = process.env.WEATHER_API_KEY;

  // Fetch location data from OpenWeather API
  private async fetchLocationData(query: string): Promise<any> {
    const response = await axios.get(`${this.baseURL}/weather`, {
      params: {
        q: query,
        appid: this.apiKey,
        units: 'metric'
      }
    });
    return response.data;
  }

  // Extract and return coordinates from location data
  private destructureLocationData(locationData: any): Coordinates {
    return {
      lat: locationData.coord.lat,
      lon: locationData.coord.lon
    };
  }

  // Build query string for geocoding API
  private buildGeocodeQuery(city: string): string {
    return `q=${city}&appid=${this.apiKey}&units=metric`;
  }

  // Build query string for weather API
  private buildWeatherQuery(coordinates: Coordinates): string {
    return `lat=${coordinates.lat}&lon=${coordinates.lon}&appid=${this.apiKey}&units=metric`;
  }

  // Fetch and extract coordinates for a given city
  private async fetchAndDestructureLocationData(city: string): Promise<Coordinates> {
    const locationData = await this.fetchLocationData(city);
    return this.destructureLocationData(locationData);
  }

  // Fetch weather data for given coordinates
  private async fetchWeatherData(coordinates: Coordinates): Promise<any> {
    const response = await axios.get(`${this.baseURL}/onecall`, {
      params: {
        lat: coordinates.lat,
        lon: coordinates.lon,
        exclude: 'minutely,hourly,alerts',
        appid: this.apiKey,
        units: 'metric'
      }
    });
    return response.data;
  }

  // Parse current weather data from API response
  private parseCurrentWeather(response: any): Weather {
    const current = response.current;
    const city = response.timezone;
    const date = new Date(current.dt * 1000).toLocaleDateString();
    const icon = current.weather[0].icon;
    const description = current.weather[0].description;
    const temperature = current.temp;
    const humidity = current.humidity;
    const windSpeed = current.wind_speed;

    return new Weather(city, date, icon, description, temperature, humidity, windSpeed);
  }

  // Build array of forecast data
  private buildForecastArray(weatherData: any): Weather[] {
    return weatherData.daily.slice(1, 6).map((day: any) => {
      const date = new Date(day.dt * 1000).toLocaleDateString();
      const icon = day.weather[0].icon;
      const description = day.weather[0].description;
      const temperature = day.temp.day;
      const humidity = day.humidity;
      const windSpeed = day.wind_speed;

      return new Weather('', date, icon, description, temperature, humidity, windSpeed);
    });
  }

  // Get weather for a given city
  async getWeatherForCity(city: string): Promise<{ current: Weather; forecast: Weather[] }> {
    const coordinates = await this.fetchAndDestructureLocationData(city);
    const weatherData = await this.fetchWeatherData(coordinates);

    const currentWeather = this.parseCurrentWeather(weatherData);
    const forecastWeather = this.buildForecastArray(weatherData);

    return { current: currentWeather, forecast: forecastWeather };
  }
}

export default new WeatherService();