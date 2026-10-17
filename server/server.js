import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import translateRouter from './routes/translate.js';
import { SUPPORTED_LANGUAGES } from './languages.js';
import { translationService } from './services/translationService.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Trust reverse proxies if deployed
app.set('trust proxy', 1);

// 1. CORS Configuration
const allowedOrigins = [
  CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error('CORS policy: This origin is not allowed.'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 2. Request body parsing with strict size limits (50kb limit to prevent payload abuse)
app.use(express.json({ limit: '50kb' }));
app.use(express.urlencoded({ extended: true, limit: '50kb' }));

// 3. Rate limiting for translation endpoint (100 requests per 15 minutes per IP)
const translationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many translation requests from this IP, please try again after 15 minutes.'
  }
});

// 4. API Routes
app.use('/api', translationLimiter, translateRouter);

/**
 * GET /api/languages
 * Returns all supported languages with flags, codes, and directions
 */
app.get('/api/languages', (req, res) => {
  res.json({
    success: true,
    count: SUPPORTED_LANGUAGES.length,
    languages: SUPPORTED_LANGUAGES
  });
});

/**
 * GET /api/status
 * Returns API health and current translation provider status
 */
app.get('/api/status', (req, res) => {
  const serviceStatus = translationService.getStatus();
  res.json({
    success: true,
    service: 'LinguaTranslate Backend API',
    status: 'online',
    timestamp: new Date().toISOString(),
    ...serviceStatus
  });
});

/**
 * Root health check
 */
app.get('/', (req, res) => {
  res.json({
    name: 'LinguaTranslate API',
    version: '1.0.0',
    documentation: 'See README.md for endpoint details',
    status: 'running'
  });
});

// 5. 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// 6. Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Error]:', err.message);
  res.status(err.status || 500).json({
    success: false,
    error: 'SERVER_ERROR',
    message: err.message || 'An internal server error occurred.'
  });
});

// 7. Start the server
const server = app.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 LinguaTranslate Server running on port ${PORT}`);
  console.log(`🌐 API Endpoint: http://localhost:${PORT}/api/translate`);
  console.log(`📋 Languages:    http://localhost:${PORT}/api/languages`);
  console.log(`⚙️ Status:       http://localhost:${PORT}/api/status`);
  console.log(`===============================================`);
});

export default app;
