import 'dotenv/config';
import express from 'express';
import { POST as chatHandler } from './service/chat';

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Chat completion endpoint
app.post('/api/chat', chatHandler);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
