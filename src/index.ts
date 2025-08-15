import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { healthRouter } from './routes/health';
import { TelegramBot } from './services/TelegramBot';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/health', healthRouter);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The requested route ${req.originalUrl} was not found on this server.`
  });
});

// Initialize Telegram Bot
const telegramBot = new TelegramBot();

// Start server
const server = app.listen(PORT, () => {
  logger.info(`🚀 Rodrigo Lanes Telegram Bot is running on port ${PORT}`);
  logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🤖 Telegram Bot initialized`);
});

// Graceful shutdown
const shutdown = () => {
  logger.info('Shutting down gracefully...');
  telegramBot.stop();
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default app;