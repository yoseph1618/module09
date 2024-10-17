import { Router } from 'express';
const router = Router();

import weatherRoutes from './api/weatherRoutes.js';
import htmlRoutes from './htmlRoutes.js';

router.use('/api/weather', weatherRoutes);
router.use(htmlRoutes);

export default router;