import type { Env } from '../types';

export interface SeedResult {
  users: number;
  repositories: number;
  profiles: number;
}

/**
 * Seed the database with test data for development
 */
export async function seedDatabase(env: Env): Promise<SeedResult> {
  // Clear existing data
  await env.DB.prepare('DELETE FROM profiles').run();
  await env.DB.prepare('DELETE FROM repositories').run();
  await env.DB.prepare('DELETE FROM sessions').run();
  await env.DB.prepare('DELETE FROM users').run();

  // Create test users
  const users = [
    {
      github_id: 1234567,
      username: 'demo-user',
      email: 'demo@example.com',
      avatar_url: 'https://avatars.githubusercontent.com/u/1234567',
      access_token: 'ghu_fake_token_demo_user',
    },
    {
      github_id: 7654321,
      username: 'test-developer',
      email: 'dev@example.com',
      avatar_url: 'https://avatars.githubusercontent.com/u/7654321',
      access_token: 'ghu_fake_token_test_dev',
    },
  ];

  const userIds: number[] = [];
  for (const user of users) {
    const result = await env.DB.prepare(
      `INSERT INTO users (github_id, username, email, avatar_url, access_token)
       VALUES (?, ?, ?, ?, ?)`
    ).bind(
      user.github_id,
      user.username,
      user.email,
      user.avatar_url,
      user.access_token
    ).run();
    userIds.push(result.meta.last_row_id);
  }

  // Create test repositories
  const repositories = [
    {
      user_id: userIds[0],
      github_repo_id: 111111,
      owner: 'demo-user',
      name: 'awesome-project',
      full_name: 'demo-user/awesome-project',
      is_private: false,
    },
    {
      user_id: userIds[0],
      github_repo_id: 222222,
      owner: 'demo-user',
      name: 'private-api',
      full_name: 'demo-user/private-api',
      is_private: true,
    },
    {
      user_id: userIds[1],
      github_repo_id: 333333,
      owner: 'test-developer',
      name: 'test-repo',
      full_name: 'test-developer/test-repo',
      is_private: false,
    },
  ];

  for (const repo of repositories) {
    await env.DB.prepare(
      `INSERT INTO repositories (user_id, github_repo_id, owner, name, full_name, is_private)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).bind(
      repo.user_id,
      repo.github_repo_id,
      repo.owner,
      repo.name,
      repo.full_name,
      repo.is_private ? 1 : 0
    ).run();
  }

  // Create test profiles
  const profiles = [
    {
      user_id: userIds[0],
      name: 'Strict TypeScript',
      preferences: JSON.stringify({
        naming: {
          variables: 'camelCase',
          functions: 'camelCase',
          classes: 'PascalCase',
          constants: 'UPPER_SNAKE_CASE',
        },
        documentation: {
          required: ['classes', 'public_methods'],
          style: 'jsdoc',
        },
        structure: {
          max_file_length: 300,
          max_function_length: 50,
        },
        style: {
          indent: 2,
          quotes: 'single',
          semicolons: true,
        },
      }),
    },
    {
      user_id: userIds[1],
      name: 'Relaxed JavaScript',
      preferences: JSON.stringify({
        naming: {
          variables: 'camelCase',
          functions: 'camelCase',
        },
        documentation: {
          required: ['classes'],
          style: 'inline',
        },
        structure: {
          max_file_length: 500,
        },
        style: {
          indent: 2,
          quotes: 'double',
          semicolons: false,
        },
      }),
    },
  ];

  for (const profile of profiles) {
    await env.DB.prepare(
      `INSERT INTO profiles (user_id, name, preferences)
       VALUES (?, ?, ?)`
    ).bind(
      profile.user_id,
      profile.name,
      profile.preferences
    ).run();
  }

  return {
    users: users.length,
    repositories: repositories.length,
    profiles: profiles.length,
  };
}
