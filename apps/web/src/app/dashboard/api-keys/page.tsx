"use client"

import { useState, useEffect, useCallback } from "react"
import { useApi } from "@/lib/use-api"
import { ENDPOINTS } from "@/lib/endpoints"
import type { ApiKey, ApiKeyResponse } from "@/features/api-keys"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AlertCircle, Trash2, Loader2, Copy, Check } from "lucide-react"

export default function ApiKeysPage() {
  const { call } = useApi()
  const [name, setName] = useState("")
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [newKey, setNewKey] = useState<ApiKeyResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  const fetchKeys = useCallback(async () => {
    try {
      const data = await call<ApiKey[]>(ENDPOINTS.API_KEYS.LIST)
      setKeys(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load keys")
    }
  }, [call])

  useEffect(() => {
    fetchKeys()
  }, [fetchKeys])

  async function handleCreate() {
    if (!name.trim()) return
    setError("")
    setLoading(true)
    setCopied(false)
    try {
      const created = await call<ApiKeyResponse>(ENDPOINTS.API_KEYS.CREATE, {
        method: "POST",
        body: JSON.stringify({ name: name.trim() }),
      })
      setNewKey(created)
      setName("")
      await fetchKeys()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create key")
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    try {
      await call(ENDPOINTS.API_KEYS.DELETE(id), { method: "DELETE" })
      setKeys((prev) => prev.filter((k) => k.id !== id))
      if (newKey?.id === id) setNewKey(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete key")
    } finally {
      setDeleting(null)
    }
  }

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text")
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-1.5">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">API Keys</h1>
        <p className="text-sm text-muted-foreground">
          Manage your secret tokens to securely authenticate programmatic requests to the API.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-md border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {newKey && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-5">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-amber-900 dark:text-amber-200">
              Save your new API key
            </h3>
          </div>
          <p className="mt-1 text-sm text-amber-700/90 dark:text-amber-400/90">
            For security reasons, we will only show this key once. Please copy it and store it somewhere safe.
          </p>
          <div className="mt-4 flex items-center gap-2">
            <code className="flex-1 rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-2.5 font-mono text-sm font-medium text-amber-950 dark:text-amber-100">
              {newKey.key}
            </code>
            <Button
              onClick={() => handleCopy(newKey.key)}
              variant="outline"
              className="h-[42px] shrink-0 gap-2 border-amber-500/20 bg-background hover:bg-amber-500/10 hover:text-amber-900 dark:hover:text-amber-100"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
        <div className="flex-1 space-y-4 lg:max-w-xs">
          <h2 className="text-sm font-medium text-foreground">Create new key</h2>
          <div className="space-y-3">
            <Input
              placeholder="e.g. Production Worker"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && name && handleCreate()}
              className="h-9 w-full bg-transparent"
              disabled={loading}
            />
            <Button
              onClick={handleCreate}
              disabled={loading || !name.trim()}
              className="h-9 w-full"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Key
            </Button>
          </div>
        </div>

        <div className="flex-[2]">
          {keys.length === 0 ? (
            <div className="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed border-border bg-transparent text-sm text-muted-foreground">
              No API keys configured.
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-muted/40">
                  <tr>
                    <th className="h-10 px-4 align-middle font-medium text-muted-foreground">Name</th>
                    <th className="h-10 px-4 align-middle font-medium text-muted-foreground">Created</th>
                    <th className="h-10 px-4 align-middle font-medium text-muted-foreground">Last Used</th>
                    <th className="h-10 px-4 text-right align-middle font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {keys.map((key) => (
                    <tr key={key.id} className="group transition-colors hover:bg-muted/20">
                      <td className="px-4 py-3 align-middle font-medium text-foreground">
                        {key.name}
                      </td>
                      <td className="px-4 py-3 align-middle text-muted-foreground">
                        {new Date(key.created_at).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 align-middle text-muted-foreground">
                        {key.last_used_at ? (
                          new Date(key.last_used_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                            Unused
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right align-middle">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(key.id)}
                          disabled={deleting === key.id}
                          className="h-8 w-8 text-muted-foreground opacity-0 transition-all hover:bg-red-500/10 hover:text-red-600 group-hover:opacity-100 dark:hover:text-red-400"
                          title="Revoke key"
                        >
                          {deleting === key.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}