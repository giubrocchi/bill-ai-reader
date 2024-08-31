import { Router } from 'express';
import { uploadReading, confirmReading, listReadings } from '../controllers/billReader';

const router = Router();

router.post('/upload', uploadReading);
router.patch('/confirm', confirmReading);
router.get('/:customer_code/list', listReadings);

export default router;
