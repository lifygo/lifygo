"use client";

import { useState } from "react";
import { useApi } from "@/lib/use-api";
import { createApiKey, type ApiKeyResponse } from "@/features/api-keys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ApiKeysPage() {
  const { call } = useApi();
  const [name, setName] = useState("");
  const [newKey, setNewKey] = useState<ApiKeyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    setError("");
    setLoading(true);
    try {
      const created = await createApiKeyViaHook();
      setNewKey(created);
      setName("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create key");
    } finally {
      setLoading(false);
    }
  }

  // Wraps the feature service call with our authenticated fetch function.
  async function createApiKeyViaHook() {
    return call<ApiKeyResponse>("/api-keys", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold mb-4">API Keys</h1>

      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Key name (e.g. production)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Button onClick={handleCreate} disabled={loading || !name}>
          {loading ? "Creating..." : "Create Key"}
        </Button>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {newKey && (
        <div className="border rounded p-4 bg-yellow-50 mb-6">
          <p className="text-sm font-medium mb-1">
            Copy this key now — it will not be shown again.
          </p>
          <code className="block bg-white p-2 rounded text-sm break-all">
            {newKey.key}
          </code>
        </div>
      )}
    </div>
  );
}