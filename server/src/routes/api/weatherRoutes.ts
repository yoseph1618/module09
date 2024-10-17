import { Router } from 'express';
import historyService from '../../service/historyService.js';
import weatherService from '../../service/weatherService.js';

const router = Router();

router.post('/', async (req, res) => {
  const { cityName } = req.body;
  if (!cityName) {
    return res.status(400).send('City name is required');
  }

  try {
    const weatherData = await weatherService.getWeatherForCity(cityName);
    await historyService.addCity(cityName);
    res.json(weatherData);
  } catch (error) {
    console.log(error);
    res.status(500).send('Error retrieving weather data');
  }
});

router.get('/history', async (req, res) => {
  try {
    const history = await historyService.getCities();
    res.json(history);
  } catch (error) {
    res.status(500).send('Error retrieving history');
  }
});

router.delete('/history/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await historyService.removeCity(id);
    res.sendStatus(204);
  } catch (error) {
    res.status(500).send('Error removing city from history');
  }
});

export default router;