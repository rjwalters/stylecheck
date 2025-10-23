// Cloudflare Workers environment bindings
export interface Env {
  DB: D1Database;
  SESSIONS: KVNamespace;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  GITHUB_CALLBACK_URL: string;
  FRONTEND_URL: string;
  JWT_SECRET: string;
}

// Database types
export interface User {
  id: number;
  github_id: number;
  username: string;
  email: string | null;
  avatar_url: string | null;
  access_token: string;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  user_id: number;
  expires_at: string;
  created_at: string;
}

export interface Repository {
  id: number;
  user_id: number;
  github_repo_id: number;
  owner: string;
  name: string;
  full_name: string;
  is_private: boolean;
  default_branch: string;
  connected_at: string;
  last_analyzed_at: string | null;
}

// GitHub OAuth types
export interface GitHubUser {
  id: number;
  login: string;
  email: string | null;
  avatar_url: string;
  name: string | null;
}

export interface GitHubTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
}

// Session data stored in KV
export interface SessionData {
  userId: number;
  username: string;
  expiresAt: number;
}
