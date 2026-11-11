const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth.routes');
const foodRoutes = require('./routes/food.routes');
const foodPartnerRoutes = require('./routes/food.partner.routes');

const app = express();

const allowedOrigins = new Set([
  'https://zomato-food-reels-lyart.vercel.app',
]);

app.use((req, res, next) => {
  const origin = req.get('Origin');

  if (!origin || !allowedOrigins.has(origin)) {
    return next();
  }

  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Vary', 'Origin');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.sendStatus(204);
  }

  return next();
});

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.send('Hello from express');
});

app.use('/api/auth', authRoutes);
app.get('/api/auth/test', (req, res) => {
  res.send('Auth route is working');
});

app.use('/api/food', foodRoutes);

app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      message: 'Invalid request body. Send valid JSON or use form-urlencoded fields.',
    });
  }

  return next(err);
});

app.use('/api/food-partner', foodPartnerRoutes);


module.exports = app;
