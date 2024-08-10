import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Define a City class with name and id properties
class City {
  constructor(public id: string, public name: string) {}
}

// Define the path to the searchHistory.json file
const historyFilePath = path.join(__dirname, '../../searchHistory.json');

class HistoryService {
  // Read from the searchHistory.json file
  private async read(): Promise<City[]> {
    const data = await fs.readFile(historyFilePath, 'utf8');
    return JSON.parse(data);
  }

  // Write the updated cities array to the searchHistory.json file
  private async write(cities: City[]): Promise<void> {
    await fs.writeFile(historyFilePath, JSON.stringify(cities));
  }

  // Get cities from the searchHistory.json file and return them as an array of City objects
  async getCities(): Promise<City[]> {
    return this.read();
  }

  // Add a city to the searchHistory.json file
  async addCity(cityName: string): Promise<City> {
    const cities = await this.read();
    const city = new City(uuidv4(), cityName);
    cities.push(city);
    await this.write(cities);
    return city;
  }

  // Remove a city from the searchHistory.json file
  async removeCity(id: string): Promise<void> {
    let cities = await this.read();
    cities = cities.filter(city => city.id !== id);
    await this.write(cities);
  }
}

export default new HistoryService();