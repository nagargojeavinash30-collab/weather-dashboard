import { Router } from 'express';

import {
  getHistory,
  deleteHistoryItem,
  clearHistory,
} from '../controllers/history.controller.js';

const router = Router();

router.get('/', getHistory);

router.delete('/', clearHistory);

router.delete('/:id', deleteHistoryItem);

export default router;