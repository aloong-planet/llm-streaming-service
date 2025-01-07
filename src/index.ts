import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './lib/swagger';
import { chatRouter } from './routes/chat';

const app = express();
const port = process.env.PORT || 8000;

// Configure CORS with dynamic origin validation
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      callback(null, true);
      return;
    }

    // Check if it's a Chrome extension
    if (origin.match(/^chrome-extension:\/\/[a-z]{32}$/)) {
      callback(null, true);
      return;
    }

    // Allow localhost with any port
    if (origin.match(/^http:\/\/localhost(:\d+)?$/)) {
      callback(null, true);
      return;
    }

    // Default: reject other origins
    callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// Serve Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Serve OpenAPI spec as JSON
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Mount routes
app.use('/api/chat', chatRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
