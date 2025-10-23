/**
 * VibeCov API Client
 *
 * Programmatic client for interacting with the VibeCov API.
 * Supports both session-based authentication and direct token usage.
 */

export interface ClientConfig {
  apiUrl?: string;
  sessionId?: string;
  githubToken?: string;
}

export interface User {
  id: number;
  github_id: number;
  username: string;
  email: string | null;
  avatar_url: string | null;
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
}

export interface Profile {
  id: number;
  user_id: number;
  name: string;
  preferences: Record<string, any>;
}

export interface SeedResult {
  message: string;
  data: {
    users: number;
    repositories: number;
    profiles: number;
  };
}

export interface DatabaseStatus {
  database: {
    users: number;
    repositories: number;
    profiles: number;
    sessions: number;
  };
}

export class VibeCovClient {
  private apiUrl: string;
  private sessionId?: string;
  private githubToken?: string;

  constructor(config: ClientConfig = {}) {
    this.apiUrl = config.apiUrl || 'http://localhost:8787';
    this.sessionId = config.sessionId;
    this.githubToken = config.githubToken;
  }

  /**
   * Set the session ID for authenticated requests
   */
  setSession(sessionId: string): void {
    this.sessionId = sessionId;
  }

  /**
   * Set the GitHub token for authentication
   */
  setGithubToken(token: string): void {
    this.githubToken = token;
  }

  /**
   * Make an authenticated request to the API
   */
  private async request<T>(
    method: string,
    path: string,
    body?: any
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add session cookie if available
    if (this.sessionId) {
      headers['Cookie'] = `session_id=${this.sessionId}`;
    }

    // Add GitHub token if available
    if (this.githubToken) {
      headers['Authorization'] = `Bearer ${this.githubToken}`;
    }

    const options: RequestInit = {
      method: method.toUpperCase(),
      headers,
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    const url = `${this.apiUrl}${path}`;
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Authentication methods
   */
  async getCurrentUser(): Promise<{ user: User }> {
    return this.request<{ user: User }>('GET', '/auth/me');
  }

  async logout(): Promise<{ message: string }> {
    const result = await this.request<{ message: string }>('POST', '/auth/logout');
    this.sessionId = undefined;
    return result;
  }

  /**
   * Development methods
   */
  async createSession(githubToken: string): Promise<{
    sessionId: string;
    userId: number;
    username: string;
    expiresAt: string;
  }> {
    // First fetch GitHub user info
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

    // Create session via dev endpoint
    const result = await this.request<{
      sessionId: string;
      userId: number;
      username: string;
      expiresAt: string;
    }>('POST', '/dev/create-session', {
      githubToken,
      githubUser,
    });

    // Store session ID for future requests
    this.sessionId = result.sessionId;

    return result;
  }

  async seedDatabase(): Promise<SeedResult> {
    return this.request<SeedResult>('POST', '/dev/seed');
  }

  async getDatabaseStatus(): Promise<DatabaseStatus> {
    return this.request<DatabaseStatus>('GET', '/dev/status');
  }

  /**
   * Generic request method for custom API calls
   */
  async call<T = any>(
    method: string,
    path: string,
    body?: any
  ): Promise<T> {
    return this.request<T>(method, path, body);
  }
}

/**
 * Factory function to create a new client
 */
export function createClient(config: ClientConfig = {}): VibeCovClient {
  return new VibeCovClient(config);
}
