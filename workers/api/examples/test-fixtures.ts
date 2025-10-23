#!/usr/bin/env tsx
/**
 * Example: Using Test Fixtures and Helpers
 *
 * This demonstrates how to use the test fixtures and helper functions
 * for testing and development.
 *
 * Run with: pnpm tsx examples/test-fixtures.ts
 */

import { fixtures } from '../src/test/fixtures';
import {
  mockGithubUsers,
  mockRepositories,
  mockProfilePreferences,
  createMockUser,
  createMockRepository,
  createMockProfile,
  generateMockSessionId,
  assert,
  deepEqual,
} from '../src/test/helpers';

function main() {
  console.log('🧪 VibeCov Test Fixtures Example\n');

  // Example 1: Using pre-built fixtures
  console.log('1️⃣  Using pre-built fixtures:');
  console.log(`   User: ${fixtures.users.full.username}`);
  console.log(`   Email: ${fixtures.users.full.email}`);
  console.log(`   Repository: ${fixtures.repositories.public.full_name}`);
  console.log(`   Profile: ${fixtures.profiles.strict.name}\n`);

  // Example 2: Creating mock data
  console.log('2️⃣  Creating mock data:');
  const mockUser = createMockUser('alice');
  console.log(`   Created user: ${mockUser.username}`);

  const mockRepo = createMockRepository(mockUser.id, 'publicRepo');
  console.log(`   Created repository: ${mockRepo.full_name}`);

  const mockProfile = createMockProfile(mockUser.id, 'strict');
  console.log(`   Created profile: ${mockProfile.name}\n`);

  // Example 3: Using mock GitHub data
  console.log('3️⃣  Mock GitHub users:');
  Object.entries(mockGithubUsers).forEach(([key, user]) => {
    console.log(`   ${key}: ${user.login} (${user.email})`);
  });
  console.log('');

  // Example 4: Mock preferences
  console.log('4️⃣  Profile preferences:');
  console.log(`   Strict naming: ${JSON.stringify(mockProfilePreferences.strict.naming)}`);
  console.log(`   Relaxed style: ${JSON.stringify(mockProfilePreferences.relaxed.style)}\n`);

  // Example 5: Helper functions
  console.log('5️⃣  Helper functions:');
  const sessionId = generateMockSessionId();
  console.log(`   Generated session ID: ${sessionId}`);

  // Test assertions
  try {
    assert(mockUser.username === 'alice-dev', 'Username should be alice-dev');
    console.log(`   ✅ Assertion passed: username is correct`);

    assert(mockRepo.is_private === false, 'Repo should be public');
    console.log(`   ✅ Assertion passed: repo is public`);

    const obj1 = { a: 1, b: 2 };
    const obj2 = { a: 1, b: 2 };
    assert(deepEqual(obj1, obj2), 'Objects should be equal');
    console.log(`   ✅ Assertion passed: objects are equal\n`);
  } catch (error) {
    console.error(`   ❌ Assertion failed: ${error}`);
  }

  // Example 6: Session fixtures
  console.log('6️⃣  Session fixtures:');
  console.log(`   Valid session expires at: ${new Date(fixtures.sessions.valid.expiresAt).toISOString()}`);
  console.log(`   Expired session expired at: ${new Date(fixtures.sessions.expired.expiresAt).toISOString()}`);
  console.log(`   Is valid session expired? ${Date.now() > fixtures.sessions.valid.expiresAt ? 'Yes' : 'No'}`);
  console.log(`   Is expired session expired? ${Date.now() > fixtures.sessions.expired.expiresAt ? 'Yes' : 'No'}\n`);

  console.log('✅ All fixture examples completed!\n');
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
