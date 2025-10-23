#!/usr/bin/env tsx
/**
 * Example: Using the VibeCov API Client
 *
 * This demonstrates how to use the VibeCov client library for programmatic
 * access to the API during development and testing.
 *
 * Run with: pnpm tsx examples/client-usage.ts
 */

import { createClient } from '../src/client';

async function main() {
  console.log('🚀 VibeCov API Client Example\n');

  // Create a new client instance
  const client = createClient({
    apiUrl: process.env.API_URL || 'http://localhost:8787',
  });

  try {
    // Example 1: Authenticate with GitHub token
    console.log('1️⃣  Authenticating with GitHub token...');
    const githubToken = process.env.GITHUB_TOKEN;

    if (!githubToken) {
      console.log('   ⚠️  No GITHUB_TOKEN environment variable set');
      console.log('   ℹ️  Set GITHUB_TOKEN to run this example\n');
    } else {
      const session = await client.createSession(githubToken);
      console.log(`   ✅ Session created: ${session.sessionId}`);
      console.log(`   👤 Logged in as: ${session.username}\n`);

      // Example 2: Get current user
      console.log('2️⃣  Fetching current user...');
      const { user } = await client.getCurrentUser();
      console.log(`   ✅ User: ${user.username}`);
      console.log(`   📧 Email: ${user.email}`);
      console.log(`   🖼️  Avatar: ${user.avatar_url}\n`);

      // Example 3: Seed database
      console.log('3️⃣  Seeding database with test data...');
      const seedResult = await client.seedDatabase();
      console.log(`   ✅ ${seedResult.message}`);
      console.log(`   📊 Created ${seedResult.data.users} users`);
      console.log(`   📦 Created ${seedResult.data.repositories} repositories`);
      console.log(`   📝 Created ${seedResult.data.profiles} profiles\n`);

      // Example 4: Check database status
      console.log('4️⃣  Checking database status...');
      const status = await client.getDatabaseStatus();
      console.log(`   ✅ Database status:`);
      console.log(`   👥 Users: ${status.database.users}`);
      console.log(`   📦 Repositories: ${status.database.repositories}`);
      console.log(`   📝 Profiles: ${status.database.profiles}`);
      console.log(`   🔑 Sessions: ${status.database.sessions}\n`);

      // Example 5: Make custom API call
      console.log('5️⃣  Making custom API call...');
      const healthCheck = await client.call('GET', '/');
      console.log(`   ✅ API Status: ${healthCheck.status}`);
      console.log(`   🏷️  Service: ${healthCheck.service}\n`);

      // Example 6: Logout
      console.log('6️⃣  Logging out...');
      const logoutResult = await client.logout();
      console.log(`   ✅ ${logoutResult.message}\n`);
    }

    console.log('✅ All examples completed successfully!\n');

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
