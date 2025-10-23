import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { auth } from './routes/auth';
import { dev } from './routes/dev';
import type { Env } from './types';

const app = new Hono<{ Bindings: Env }>();

// CORS configuration
app.use('/*', cors({
  origin: (origin) => origin, // Allow all origins in development, restrict in production
  credentials: true,
}));

// Health check
app.get('/', (c) => {
  return c.json({
    status: 'ok',
    service: 'vibecov-api',
    version: '0.1.0'
  });
});

// Auth routes
app.route('/auth', auth);

// Development routes (only active in dev environment)
app.route('/dev', dev);

// 404 handler
app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

// Error handler
app.onError((err, c) => {
  console.error('Error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

export default app;
