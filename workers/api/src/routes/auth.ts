import { Hono } from 'hono';
import { getCookie, setCookie, deleteCookie } from 'hono/cookie';
import type { Env, GitHubUser, GitHubTokenResponse, SessionData } from '../types';

export const auth = new Hono<{ Bindings: Env }>();

// Generate random session ID
function generateSessionId(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

// GitHub OAuth: Initiate login
auth.get('/login', (c) => {
  const env = c.env;
  const state = generateSessionId();

  // Store state in cookie for CSRF protection
  setCookie(c, 'oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    maxAge: 600, // 10 minutes
  });

  const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
  githubAuthUrl.searchParams.set('client_id', env.GITHUB_CLIENT_ID);
  githubAuthUrl.searchParams.set('redirect_uri', env.GITHUB_CALLBACK_URL);
  githubAuthUrl.searchParams.set('scope', 'read:user user:email');
  githubAuthUrl.searchParams.set('state', state);

  return c.redirect(githubAuthUrl.toString());
});

// GitHub OAuth: Callback handler
auth.get('/callback', async (c) => {
  const env = c.env;
  const code = c.req.query('code');
  const state = c.req.query('state');
  const storedState = getCookie(c, 'oauth_state');

  // Validate state (CSRF protection)
  if (!code || !state || state !== storedState) {
    return c.redirect(`${env.FRONTEND_URL}?error=invalid_state`);
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: env.GITHUB_CALLBACK_URL,
      }),
    });

    const tokenData: GitHubTokenResponse = await tokenResponse.json();

    if (!tokenData.access_token) {
      throw new Error('No access token received');
    }

    // Fetch user data from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/json',
      },
    });

    const githubUser: GitHubUser = await userResponse.json();

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
        tokenData.access_token,
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
        tokenData.access_token
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

    // Set session cookie
    setCookie(c, 'session_id', sessionId, {
      httpOnly: true,
      secure: true,
      sameSite: 'Lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    // Clear OAuth state cookie
    deleteCookie(c, 'oauth_state');

    // Redirect to frontend
    return c.redirect(`${env.FRONTEND_URL}/dashboard`);

  } catch (error) {
    console.error('OAuth error:', error);
    return c.redirect(`${env.FRONTEND_URL}?error=auth_failed`);
  }
});

// Get current user
auth.get('/me', async (c) => {
  const env = c.env;
  const sessionId = getCookie(c, 'session_id');

  if (!sessionId) {
    return c.json({ error: 'Not authenticated' }, 401);
  }

  try {
    // Get session from KV
    const sessionDataStr = await env.SESSIONS.get(sessionId);

    if (!sessionDataStr) {
      return c.json({ error: 'Invalid session' }, 401);
    }

    const sessionData: SessionData = JSON.parse(sessionDataStr);

    // Check if session expired
    if (Date.now() > sessionData.expiresAt) {
      await env.SESSIONS.delete(sessionId);
      return c.json({ error: 'Session expired' }, 401);
    }

    // Get user from database
    const user = await env.DB.prepare(
      'SELECT id, github_id, username, email, avatar_url, created_at FROM users WHERE id = ?'
    ).bind(sessionData.userId).first();

    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    return c.json({ user });

  } catch (error) {
    console.error('Auth check error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Logout
auth.post('/logout', async (c) => {
  const env = c.env;
  const sessionId = getCookie(c, 'session_id');

  if (sessionId) {
    // Delete session from KV
    await env.SESSIONS.delete(sessionId);

    // Delete session from D1
    await env.DB.prepare('DELETE FROM sessions WHERE id = ?').bind(sessionId).run();
  }

  // Clear session cookie
  deleteCookie(c, 'session_id');

  return c.json({ message: 'Logged out successfully' });
});
