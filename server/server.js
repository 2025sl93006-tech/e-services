require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

const authRoutes     = require('./routes/authRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const providerRoutes = require('./routes/providerRoutes');
const orderRoutes    = require('./routes/orderRoutes');
const reviewRoutes   = require('./routes/reviewRoutes');

connectDB();

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3001', credentials: true }));
app.use(express.json());

app.use('/api/auth',      authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/providers',  providerRoutes);
app.use('/api/orders',     orderRoutes);
app.use('/api/reviews',    reviewRoutes);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'e-Services API Docs',
  swaggerOptions: { persistAuthorization: true },
}));

app.get('/api/health', (req, res) => res.json({ status: 'ok', project: 'e-Services' }));

app.use(errorHandler);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`e-Services server running on port ${PORT}`));
