require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Routes
const authRoutes = require('./routes/auth.js');
const scoreRoutes = require('./routes/scores.js');
const drawRoutes = require('./routes/draws.js');
const charityRoutes = require('./routes/charities.js');
const subscriptionRoutes = require('./routes/subscriptions.js');
const winnerRoutes = require('./routes/winners.js');
const adminRoutes = require('./routes/admin.js');
const stripeWebhook = require('./webhooks/stripe.js');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Stripe webhook (must be before express.json())
app.post(
  '/api/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  stripeWebhook
);

// ── Global middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server)
    if (!origin) return callback(null, true);
    const allowed = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://[::1]:5173',
    ].filter(Boolean);
    if (allowed.includes(origin)) return callback(null, true);
    // Also allow any localhost/127.0.0.1 port in dev
    if (/^http:\/\/(localhost|127\.0\.0\.1|\[::1\]):\d+$/.test(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// ── API routes
app.use('/api/auth',          authRoutes);
app.use('/api/scores',        scoreRoutes);
app.use('/api/draws',         drawRoutes);
app.use('/api/charities',     charityRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/winners',       winnerRoutes);
app.use('/api/admin',         adminRoutes);

// ── 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ── Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

app.listen(PORT, () => {
  console.log(`\n🚀 Digital Heroes API running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
