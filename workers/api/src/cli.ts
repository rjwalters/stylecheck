#!/usr/bin/env node
/**
 * VibeCov CLI - Headless development tool
 *
 * Allows programmatic access to the API for testing and debugging
 * without requiring browser-based OAuth flow.
 */

import { createClient } from './client';
import type { Env } from './types';

interface CLIEnv extends Env {
  // For CLI, we'll use fetch directly
}

const API_URL = process.env.API_URL || 'http://localhost:8787';
const SESSION_FILE = '.vibecov-session';

// CLI Commands
const commands = {
  async login(githubToken: string) {
    console.log('🔐 Authenticating with GitHub token...');

    // Fetch GitHub user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/json',
      },
    });

    if (!userResponse.ok) {
      throw new Error('Invalid GitHub token');
    }

    const githubUser = await userResponse.json();

    // Create session via API (we'll need a special endpoint for this)
    const sessionResponse = await fetch(`${API_URL}/dev/create-session`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        githubToken,
        githubUser,
      }),
    });

    if (!sessionResponse.ok) {
      throw new Error('Failed to create session');
    }

    const { sessionId } = await sessionResponse.json();

    // Store session
    const fs = await import('fs/promises');
    await fs.writeFile(SESSION_FILE, JSON.stringify({
      sessionId,
      githubToken,
      username: githubUser.login,
      createdAt: new Date().toISOString(),
    }), 'utf8');

    console.log(`✅ Logged in as ${githubUser.login}`);
    console.log(`📁 Session saved to ${SESSION_FILE}`);
  },

  async me() {
    const session = await loadSession();

    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Cookie': `session_id=${session.sessionId}`,
      },
    });

    if (!response.ok) {
      throw new Error('Not authenticated or session expired');
    }

    const data = await response.json();
    console.log('👤 Current user:');
    console.log(JSON.stringify(data.user, null, 2));
  },

  async logout() {
    const session = await loadSession();

    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Cookie': `session_id=${session.sessionId}`,
      },
    });

    const fs = await import('fs/promises');
    await fs.unlink(SESSION_FILE).catch(() => {});

    console.log('👋 Logged out successfully');
  },

  async request(method: string, path: string, body?: any) {
    const session = await loadSession();

    const options: RequestInit = {
      method: method.toUpperCase(),
      headers: {
        'Cookie': `session_id=${session.sessionId}`,
        'Content-Type': 'application/json',
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_URL}${path}`, options);
    const data = await response.json();

    console.log(`${response.status} ${method.toUpperCase()} ${path}`);
    console.log(JSON.stringify(data, null, 2));
  },

  async seed() {
    console.log('🌱 Seeding database...');

    const session = await loadSession();

    const response = await fetch(`${API_URL}/dev/seed`, {
      method: 'POST',
      headers: {
        'Cookie': `session_id=${session.sessionId}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to seed database');
    }

    const data = await response.json();
    console.log('✅ Database seeded:');
    console.log(JSON.stringify(data, null, 2));
  },

  async help() {
    console.log(`
VibeCov CLI - Headless Development Tool

USAGE:
  vibecov <command> [options]

COMMANDS:
  login <github-token>    Login with GitHub Personal Access Token
  me                      Show current user
  logout                  Logout and clear session
  request <method> <path> [body]  Make authenticated API request
  seed                    Seed database with test data
  help                    Show this help message

EXAMPLES:
  # Login with GitHub PAT
  vibecov login ghp_xxxxxxxxxxxx

  # Check current user
  vibecov me

  # Make API request
  vibecov request GET /auth/me
  vibecov request POST /api/repos '{"name":"test"}'

  # Seed test data
  vibecov seed

  # Logout
  vibecov logout

ENVIRONMENT:
  API_URL       API endpoint (default: http://localhost:8787)

SESSION:
  Session is stored in .vibecov-session file
  This file contains your session ID and should be kept secure
    `);
  },
};

async function loadSession() {
  const fs = await import('fs/promises');
  try {
    const data = await fs.readFile(SESSION_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    throw new Error('Not logged in. Run: vibecov login <github-token>');
  }
}

// Main CLI entry point
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === 'help') {
    await commands.help();
    return;
  }

  try {
    switch (command) {
      case 'login':
        if (!args[1]) {
          throw new Error('GitHub token required. Usage: vibecov login <token>');
        }
        await commands.login(args[1]);
        break;

      case 'me':
        await commands.me();
        break;

      case 'logout':
        await commands.logout();
        break;

      case 'request':
        if (!args[1] || !args[2]) {
          throw new Error('Usage: vibecov request <method> <path> [body]');
        }
        await commands.request(args[1], args[2], args[3] ? JSON.parse(args[3]) : undefined);
        break;

      case 'seed':
        await commands.seed();
        break;

      default:
        console.error(`Unknown command: ${command}`);
        await commands.help();
        process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { commands };
