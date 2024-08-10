import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';

const router = Router();
const weatherApiKey = process.env.WEATHER_API_KEY;
const historyFilePath = path.join(__dirname, '../../searchHistory.json');

const readHistory = (): any[] => {
  const data = fs.readFileSync(historyFilePath, 'utf8');
  return JSON.parse(data);
};

const writeHistory = (history: any[]): void => {
  fs.writeFileSync(historyFilePath, JSON.stringify(history));
};

router.post('/', async (req, res) => {
  const { city } = req.body;
  if (!city) {
    return res.status(400).send('City name is required');
  }

  try {
    const response = await axios.get(`http://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherApiKey}&units=metric`);
    const weatherData = response.data;

    const cityData = {
      id: uuidv4(),
      city,
      weatherData
    };

    const history = readHistory();
    history.push(cityData);
    writeHistory(history);

    res.json(weatherData);
  } catch (error) {
    res.status(500).send('Error retrieving weather data');
  }
});

router.get('/history', (req, res) => {
  const history = readHistory();
  res.json(history);
});

router.delete('/history/:id', (req, res) => {
  const { id } = req.params;
  let history = readHistory();
  history = history.filter(city => city.id !== id);
  writeHistory(history);
  res.sendStatus(204);
});

export default router;