import { errorHandler } from '#middleware/error.middleware.ts';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import authRoutes from './routes/auth.routes';
import dashboardRoutes from './routes/dashboard.routes';
import expenseRoutes from './routes/expense.routes';
import productRoutes from './routes/product.routes';
import userRoutes from './routes/user.routes';

// CONFIGURATION
dotenv.config();
const app = express();
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use(morgan('common'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

// ROUTES
app.use('/dashboard', dashboardRoutes);
app.use('/products', productRoutes);
app.use('/users', userRoutes);
app.use('/auth', authRoutes);
app.use('/expenses', expenseRoutes);

// Error Handler
app.use(errorHandler);

// SERVER
const port = Number(process.env.PORT) || 3001;
app.listen(port, '0.0.0.0', () => {
	console.log(`server is running on port ${port}`);
});
