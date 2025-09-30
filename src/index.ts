import 'reflect-metadata';
import * as express from 'express';
import { AppDataSource } from './config/ormconfig';
import authRoutes from './routes/authRoutes';
import * as dotenv from 'dotenv';
import * as cors from 'cors';



dotenv.config();


const app = express();
const port = process.env['PORT'] ;

// Initialize database connection
AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization:', err);
  });



app.use(express.json());
app.use(cors({
  // Use the port your Next.js development server is running on (usually 3000 or 3001)
  origin: 'http://localhost:3000', // Use the URL/port of your frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


// Use the authentication routes
app.use('/auth', authRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);

});
