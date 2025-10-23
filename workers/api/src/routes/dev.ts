import { Hono } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import type { Env, SessionData } from '../types';
import { seedDatabase } from '../utils/seed';

export const dev = new Hono<{ Bindings: Env }>();

// Generate random session ID
function generateSessionId(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Development-only endpoint to create a session without OAuth flow
 * Allows CLI tools to authenticate using GitHub Personal Access Token
 */
dev.post('/create-session', async (c) => {
  const env = c.env;

  // Only allow in development environment
  if (env.GITHUB_CALLBACK_URL?.includes('localhost') === false) {
    return c.json({ error: 'This endpoint is only available in development' }, 403);
  }

  try {
    const body = await c.req.json();
    const { githubToken, githubUser } = body;

    if (!githubToken || !githubUser) {
      return c.json({ error: 'Missing githubToken or githubUser' }, 400);
    }

    // Check if user exists in database
    const existingUser = await env.DB.prepare(
      'SELECT * FROM users WHERE github_id = ?'
    ).bind(githubUser.id).first();

    let userId: number;

    if (existingUser) {
      // Update existing user
      userId = existingUser.id as number;
      await env.DB.prepare(
        `UPDATE users SET
         username = ?,
         email = ?,
         avatar_url = ?,
         access_token = ?,
         updated_at = datetime('now')
         WHERE id = ?`
      ).bind(
        githubUser.login,
        githubUser.email,
        githubUser.avatar_url,
        githubToken,
        userId
      ).run();
    } else {
      // Create new user
      const result = await env.DB.prepare(
        `INSERT INTO users (github_id, username, email, avatar_url, access_token)
         VALUES (?, ?, ?, ?, ?)`
      ).bind(
        githubUser.id,
        githubUser.login,
        githubUser.email,
        githubUser.avatar_url,
        githubToken
      ).run();

      userId = result.meta.last_row_id;
    }

    // Create session
    const sessionId = generateSessionId();
    const expiresAt = Date.now() + (30 * 24 * 60 * 60 * 1000); // 30 days

    const sessionData: SessionData = {
      userId,
      username: githubUser.login,
      expiresAt,
    };

    // Store session in KV
    await env.SESSIONS.put(sessionId, JSON.stringify(sessionData), {
      expirationTtl: 30 * 24 * 60 * 60, // 30 days
    });

    // Also store in D1 as backup
    await env.DB.prepare(
      'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)'
    ).bind(
      sessionId,
      userId,
      new Date(expiresAt).toISOString()
    ).run();

    return c.json({
      sessionId,
      userId,
      username: githubUser.login,
      expiresAt: new Date(expiresAt).toISOString(),
    });

  } catch (error) {
    console.error('Create session error:', error);
    return c.json({ error: 'Failed to create session' }, 500);
  }
});

/**
 * Development-only endpoint to seed the database with test data
 */
dev.post('/seed', async (c) => {
  const env = c.env;

  // Only allow in development environment
  if (env.GITHUB_CALLBACK_URL?.includes('localhost') === false) {
    return c.json({ error: 'This endpoint is only available in development' }, 403);
  }

  // Require authentication
  const sessionId = getCookie(c, 'session_id');
  if (!sessionId) {
    return c.json({ error: 'Not authenticated' }, 401);
  }

  try {
    const result = await seedDatabase(env);

    return c.json({
      message: 'Database seeded successfully',
      data: result,
    });
  } catch (error) {
    console.error('Seed error:', error);
    return c.json({ error: 'Failed to seed database' }, 500);
  }
});

/**
 * Development-only endpoint to check database status
 */
dev.get('/status', async (c) => {
  const env = c.env;

  // Only allow in development environment
  if (env.GITHUB_CALLBACK_URL?.includes('localhost') === false) {
    return c.json({ error: 'This endpoint is only available in development' }, 403);
  }

  try {
    const userCount = await env.DB.prepare('SELECT COUNT(*) as count FROM users').first();
    const repoCount = await env.DB.prepare('SELECT COUNT(*) as count FROM repositories').first();
    const profileCount = await env.DB.prepare('SELECT COUNT(*) as count FROM profiles').first();
    const sessionCount = await env.DB.prepare('SELECT COUNT(*) as count FROM sessions').first();

    return c.json({
      database: {
        users: userCount?.count || 0,
        repositories: repoCount?.count || 0,
        profiles: profileCount?.count || 0,
        sessions: sessionCount?.count || 0,
      },
    });
  } catch (error) {
    console.error('Status check error:', error);
    return c.json({ error: 'Failed to check status' }, 500);
  }
});
