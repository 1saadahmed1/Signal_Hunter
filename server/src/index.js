import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import compression from 'compression';
import analysisRoutes from './routes/analysis.js';
import { TwitterService } from './services/twitterService.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize TwitterService and pre-cache
const twitterService = new TwitterService();

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    env: {
      hasApiKey: !!process.env.RAPIDAPI_KEY,
      apiHost: process.env.RAPIDAPI_HOST || 'not set'
    }
  });
});

// Routes
app.use('/api', analysisRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  console.log('404 - Not Found:', req.method, req.url);
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.url,
    method: req.method
  });
});

app.listen(PORT, async () => {
  console.log(`\n========================================`);
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Environment variables loaded:`, {
    RAPIDAPI_KEY: process.env.RAPIDAPI_KEY ? 'Present' : 'MISSING!',
    RAPIDAPI_HOST: process.env.RAPIDAPI_HOST || 'Using default',
    PORT: PORT
  });
  console.log(`========================================\n`);
  
  // Start pre-caching popular experts
  if (process.env.RAPIDAPI_KEY) {
    twitterService.precacheExperts().catch(console.error);
  }
});