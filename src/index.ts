import express from 'express';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './lib/swagger';
import { chatRouter } from './routes/chat';

const app = express();
const port = process.env.PORT || 3000;

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
