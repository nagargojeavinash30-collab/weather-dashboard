import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import weatherRoutes from './routes/weather.routes.js';
import historyRoutes from './routes/history.routes.js';
import notFound from './middleware/notFound.js';
import errorHandler from './middleware/errorHandler.js';

const currentDir = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(currentDir, '..', 'public')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Weather Dashboard API is running.',
  });
});

// API routes
app.use('/api', weatherRoutes);
app.use('/api/history', historyRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;