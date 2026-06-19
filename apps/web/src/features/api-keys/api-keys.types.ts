export interface ApiKey {
  id: string;
  name: string;
  last_used_at: string | null;
  created_at: string;
}

export interface ApiKeyResponse extends ApiKey {
  key: string; // raw key — only present right after creation
}

export interface CreateApiKeyInput {
  name: string;
}