import express from 'express';
import orderRoutes from './routes/orderRoutes.js';

const app = express();

app.use(express.json());
app.use('/api/orders', orderRoutes);

// ... other middleware and routes ...

export default app;