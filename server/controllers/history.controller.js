import AppError from '../utils/AppError.js';
import historyRepository from '../repositories/history.repository.js';
import config from '../config/index.js';

export function getHistory(req, res, next) {
  try {
    const history = historyRepository.getRecent(
      config.history.visibleLimit
    );

    res.json({
      success: true,
      results: history,
    });
  } catch (error) {
    next(error);
  }
}

export function deleteHistoryItem(req, res, next) {
  try {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
      throw new AppError('Invalid history ID.', 400);
    }

    const deleted = historyRepository.deleteById(id);

    if (!deleted) {
      throw new AppError('History item not found.', 404);
    }

    res.json({
      success: true,
      message: 'Search history item deleted.',
    });
  } catch (error) {
    next(error);
  }
}

export function clearHistory(req, res, next) {
  try {
    historyRepository.clearAll();

    res.json({
      success: true,
      message: 'Search history cleared.',
    });
  } catch (error) {
    next(error);
  }
}