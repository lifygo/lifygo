"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/lib/use-api";
import { ENDPOINTS } from "@/lib/endpoints";
import type { ApiKey, ApiKeyResponse } from "@/features/api-keys";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function ApiKeysPage() {
  const { call } = useApi();
  const [name, setName] = useState("");
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newKey, setNewKey] = useState<ApiKeyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchKeys() {
      try {
        const data = await call<ApiKey[]>(ENDPOINTS.API_KEYS.LIST);
        if (!cancelled) setKeys(data);
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load keys");
      }
    }

    fetchKeys();

    return () => {
      cancelled = true;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreate() {
    setError("");
    setLoading(true);
    try {
      const created = await call<ApiKeyResponse>(ENDPOINTS.API_KEYS.CREATE, {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      setNewKey(created);
      setName("");
      const data = await call<ApiKey[]>(ENDPOINTS.API_KEYS.LIST);
      setKeys(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create key");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id);
    try {
      await call(ENDPOINTS.API_KEYS.DELETE(id), { method: "DELETE" });
      setKeys((prev) => prev.filter((k) => k.id !== id));
      if (newKey?.id === id) setNewKey(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete key");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">API Keys</h1>

      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Key name (e.g. production)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && name && handleCreate()}
        />
        <Button onClick={handleCreate} disabled={loading || !name}>
          {loading ? "Creating..." : "Create Key"}
        </Button>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      {newKey && (
        <div className="border rounded p-4 bg-yellow-50 mb-6">
          <p className="text-sm font-semibold mb-2">
            Copy this key now — it will never be shown again.
          </p>
          <code className="block bg-white border rounded p-2 text-sm break-all select-all">
            {newKey.key}
          </code>
        </div>
      )}

      {keys.length === 0 ? (
        <p className="text-gray-400 text-sm">No API keys yet.</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="pb-2">Name</th>
              <th className="pb-2">Last Used</th>
              <th className="pb-2">Created</th>
              <th className="pb-2"></th>
            </tr>
          </thead>
          <tbody>
            {keys.map((key) => (
              <tr key={key.id} className="border-b last:border-0">
                <td className="py-3 font-medium">{key.name}</td>
                <td className="py-3 text-gray-500">
                  {key.last_used_at
                    ? new Date(key.last_used_at).toLocaleDateString()
                    : <Badge variant="outline">Never</Badge>}
                </td>
                <td className="py-3 text-gray-500">
                  {new Date(key.created_at).toLocaleDateString()}
                </td>
                <td className="py-3 text-right">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(key.id)}
                    disabled={deleting === key.id}
                  >
                    {deleting === key.id ? "Deleting..." : "Delete"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}