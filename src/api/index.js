import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { testConnection } from '../db/client.js';
import { auth } from '../lib/auth.js';
import router from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());

// Custom auth routes first — must be before the Better Auth wildcard
app.use('/api', router);

// Better Auth — handles sign-up, sign-in, sign-out, session, etc.
// Routes: POST /api/auth/sign-up/email, POST /api/auth/sign-in/email, POST /api/auth/sign-out ...
app.all('/api/auth/*path', toNodeHandler(auth));

app.get('/', (req, res) => {
  res.send('FlipFlag API');
});

const dbConnected = await testConnection();
if (!dbConnected) {
  console.error('Could not connect to database. Exiting.');
  process.exit(1);
}

app.listen(PORT, () => {
  console.log('Server listening on port', PORT);
});
