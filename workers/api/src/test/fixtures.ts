/**
 * Test fixtures for VibeCov API
 *
 * Pre-configured test data that can be used in development and testing.
 */

import type { User, Repository, Profile, SessionData } from '../types';

/**
 * Fixture: Complete user with all fields
 */
export const fixtureUser: User = {
  id: 1,
  github_id: 12345678,
  username: 'fixture-user',
  email: 'fixture@example.com',
  avatar_url: 'https://avatars.githubusercontent.com/u/12345678',
  access_token: 'ghu_fake_fixture_token',
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
};

/**
 * Fixture: User without optional fields
 */
export const fixtureUserMinimal: User = {
  id: 2,
  github_id: 87654321,
  username: 'minimal-user',
  email: null,
  avatar_url: null,
  access_token: 'ghu_fake_minimal_token',
  created_at: '2025-01-01T00:00:00.000Z',
  updated_at: '2025-01-01T00:00:00.000Z',
};

/**
 * Fixture: Public repository
 */
export const fixturePublicRepo: Repository = {
  id: 1,
  user_id: 1,
  github_repo_id: 100001,
  owner: 'fixture-user',
  name: 'public-repo',
  full_name: 'fixture-user/public-repo',
  is_private: false,
  created_at: '2025-01-01T00:00:00.000Z',
};

/**
 * Fixture: Private repository
 */
export const fixturePrivateRepo: Repository = {
  id: 2,
  user_id: 1,
  github_repo_id: 100002,
  owner: 'fixture-user',
  name: 'private-repo',
  full_name: 'fixture-user/private-repo',
  is_private: true,
  created_at: '2025-01-01T00:00:00.000Z',
};

/**
 * Fixture: Strict TypeScript profile
 */
export const fixtureProfileStrict: Profile = {
  id: 1,
  user_id: 1,
  name: 'Strict TypeScript',
  preferences: {
    naming: {
      variables: 'camelCase',
      functions: 'camelCase',
      classes: 'PascalCase',
      constants: 'UPPER_SNAKE_CASE',
      interfaces: 'PascalCase',
      types: 'PascalCase',
    },
    documentation: {
      required: ['classes', 'public_methods', 'interfaces', 'types'],
      style: 'jsdoc',
      minLength: 15,
      includeExamples: true,
    },
    structure: {
      max_file_length: 300,
      max_function_length: 50,
      max_class_length: 200,
      max_complexity: 10,
      prefer_named_exports: true,
    },
    style: {
      indent: 2,
      quotes: 'single',
      semicolons: true,
      trailing_commas: true,
      arrow_parens: 'always',
    },
    typescript: {
      strict: true,
      no_implicit_any: true,
      no_unused_vars: true,
    },
  },
  created_at: '2025-01-01T00:00:00.000Z',
};

/**
 * Fixture: Relaxed JavaScript profile
 */
export const fixtureProfileRelaxed: Profile = {
  id: 2,
  user_id: 1,
  name: 'Relaxed JavaScript',
  preferences: {
    naming: {
      variables: 'camelCase',
      functions: 'camelCase',
    },
    documentation: {
      required: ['classes'],
      style: 'inline',
      minLength: 5,
    },
    structure: {
      max_file_length: 500,
      max_function_length: 100,
    },
    style: {
      indent: 2,
      quotes: 'double',
      semicolons: false,
    },
  },
  created_at: '2025-01-01T00:00:00.000Z',
};

/**
 * Fixture: Valid session data
 */
export const fixtureSession: SessionData = {
  userId: 1,
  username: 'fixture-user',
  expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days from now
};

/**
 * Fixture: Expired session data
 */
export const fixtureExpiredSession: SessionData = {
  userId: 1,
  username: 'fixture-user',
  expiresAt: Date.now() - (24 * 60 * 60 * 1000), // 1 day ago
};

/**
 * Fixture: GitHub user response
 */
export const fixtureGithubUserResponse = {
  id: 12345678,
  login: 'fixture-user',
  email: 'fixture@example.com',
  avatar_url: 'https://avatars.githubusercontent.com/u/12345678',
  name: 'Fixture User',
  company: 'Test Corp',
  location: 'San Francisco, CA',
  bio: 'A test user for fixtures',
  public_repos: 42,
  followers: 100,
  following: 50,
  created_at: '2020-01-01T00:00:00Z',
};

/**
 * Fixture: GitHub OAuth token response
 */
export const fixtureGithubTokenResponse = {
  access_token: 'ghu_fake_fixture_token',
  token_type: 'bearer',
  scope: 'read:user,user:email',
};

/**
 * Collection of all fixtures for easy import
 */
export const fixtures = {
  users: {
    full: fixtureUser,
    minimal: fixtureUserMinimal,
  },
  repositories: {
    public: fixturePublicRepo,
    private: fixturePrivateRepo,
  },
  profiles: {
    strict: fixtureProfileStrict,
    relaxed: fixtureProfileRelaxed,
  },
  sessions: {
    valid: fixtureSession,
    expired: fixtureExpiredSession,
  },
  github: {
    user: fixtureGithubUserResponse,
    token: fixtureGithubTokenResponse,
  },
};
