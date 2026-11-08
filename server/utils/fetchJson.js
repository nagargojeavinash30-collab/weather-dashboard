import AppError from './AppError.js';

async function fetchJson(url, options = {}) {
  try {
    const response = await fetch(url, {
      ...options,
      signal: options.signal || AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      throw new AppError(
        `External API request failed with status ${response.status}`,
        502
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      throw new AppError('Weather service request timed out.', 504);
    }

    throw new AppError('Unable to connect to the weather service.', 502);
  }
}

export default fetchJson;