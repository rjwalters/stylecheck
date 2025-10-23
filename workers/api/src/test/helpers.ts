/**
 * Testing utilities and helpers for VibeCov API
 *
 * Provides fixtures, mock data, and helper functions for testing.
 */

import type { User, Repository, Profile } from '../types';

/**
 * Mock GitHub user data
 */
export const mockGithubUsers = {
  alice: {
    id: 1001,
    login: 'alice-dev',
    email: 'alice@example.com',
    avatar_url: 'https://avatars.githubusercontent.com/u/1001',
    name: 'Alice Developer',
  },
  bob: {
    id: 1002,
    login: 'bob-coder',
    email: 'bob@example.com',
    avatar_url: 'https://avatars.githubusercontent.com/u/1002',
    name: 'Bob Coder',
  },
  charlie: {
    id: 1003,
    login: 'charlie-tester',
    email: 'charlie@example.com',
    avatar_url: 'https://avatars.githubusercontent.com/u/1003',
    name: 'Charlie Tester',
  },
};

/**
 * Mock GitHub access tokens
 */
export const mockGithubTokens = {
  alice: 'ghu_fake_token_alice_dev',
  bob: 'ghu_fake_token_bob_coder',
  charlie: 'ghu_fake_token_charlie_tester',
};

/**
 * Mock repository data
 */
export const mockRepositories = {
  publicRepo: {
    github_repo_id: 2001,
    owner: 'alice-dev',
    name: 'awesome-library',
    full_name: 'alice-dev/awesome-library',
    is_private: false,
  },
  privateRepo: {
    github_repo_id: 2002,
    owner: 'alice-dev',
    name: 'secret-project',
    full_name: 'alice-dev/secret-project',
    is_private: true,
  },
  testRepo: {
    github_repo_id: 2003,
    owner: 'bob-coder',
    name: 'test-suite',
    full_name: 'bob-coder/test-suite',
    is_private: false,
  },
};

/**
 * Mock style profile preferences
 */
export const mockProfilePreferences = {
  strict: {
    naming: {
      variables: 'camelCase',
      functions: 'camelCase',
      classes: 'PascalCase',
      constants: 'UPPER_SNAKE_CASE',
    },
    documentation: {
      required: ['classes', 'public_methods', 'interfaces'],
      style: 'jsdoc',
      minLength: 10,
    },
    structure: {
      max_file_length: 300,
      max_function_length: 50,
      max_complexity: 10,
    },
    style: {
      indent: 2,
      quotes: 'single',
      semicolons: true,
      trailing_commas: true,
    },
  },
  relaxed: {
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
  },
  google: {
    naming: {
      variables: 'camelCase',
      functions: 'camelCase',
      classes: 'PascalCase',
      constants: 'UPPER_SNAKE_CASE',
    },
    documentation: {
      required: ['classes', 'public_methods'],
      style: 'jsdoc',
      minLength: 20,
    },
    structure: {
      max_file_length: 400,
      max_function_length: 80,
    },
    style: {
      indent: 2,
      quotes: 'single',
      semicolons: true,
    },
  },
};

/**
 * Generate a random session ID
 */
export function generateMockSessionId(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Create a mock user object
 */
export function createMockUser(
  username: keyof typeof mockGithubUsers
): User {
  const githubUser = mockGithubUsers[username];
  return {
    id: githubUser.id,
    github_id: githubUser.id,
    username: githubUser.login,
    email: githubUser.email,
    avatar_url: githubUser.avatar_url,
    access_token: mockGithubTokens[username],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Create a mock repository object
 */
export function createMockRepository(
  userId: number,
  repoKey: keyof typeof mockRepositories
): Repository {
  const repo = mockRepositories[repoKey];
  return {
    id: repo.github_repo_id,
    user_id: userId,
    github_repo_id: repo.github_repo_id,
    owner: repo.owner,
    name: repo.name,
    full_name: repo.full_name,
    is_private: repo.is_private,
    created_at: new Date().toISOString(),
  };
}

/**
 * Create a mock profile object
 */
export function createMockProfile(
  userId: number,
  profileKey: keyof typeof mockProfilePreferences
): Profile {
  return {
    id: Math.floor(Math.random() * 10000),
    user_id: userId,
    name: profileKey.charAt(0).toUpperCase() + profileKey.slice(1) + ' Style',
    preferences: mockProfilePreferences[profileKey],
    created_at: new Date().toISOString(),
  };
}

/**
 * Wait for a specified duration (useful for testing timeouts)
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Create a mock GitHub OAuth code
 */
export function createMockOAuthCode(): string {
  const array = new Uint8Array(20);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Create a mock OAuth state token
 */
export function createMockOAuthState(): string {
  return generateMockSessionId();
}

/**
 * Assert helper for testing
 */
export function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

/**
 * Compare two objects deeply
 */
export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== typeof b) return false;

  if (typeof a === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;

    return keysA.every(key => deepEqual(a[key], b[key]));
  }

  return false;
}
