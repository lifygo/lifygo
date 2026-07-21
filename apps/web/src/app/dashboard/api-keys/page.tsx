"use client"

export const dynamic = "force-dynamic";
import { useState, useEffect } from "react"
import { useApi } from "@/lib/use-api"
import { ENDPOINTS } from "@/lib/endpoints"
import type { ApiKey, ApiKeyResponse } from "@/features/api-keys"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Key, AlertCircle, PlusCircle, Trash2, KeyRound, Clock } from "lucide-react"

export default function ApiKeysPage() {
  const { call } = useApi()
  const [name, setName] = useState("")
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [newKey, setNewKey] = useState<ApiKeyResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState("")

  useEffect(() => {
    let cancelled = false

    async function fetchKeys() {
      try {
        const data = await call<ApiKey[]>(ENDPOINTS.API_KEYS.LIST)
        if (!cancelled) setKeys(data)
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load keys")
      }
    }

    fetchKeys()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleCreate() {
    setError("")
    setLoading(true)
    try {
      const created = await call<ApiKeyResponse>(ENDPOINTS.API_KEYS.CREATE, {
        method: "POST",
        body: JSON.stringify({ name }),
      })
      setNewKey(created)
      setName("")
      const data = await call<ApiKey[]>(ENDPOINTS.API_KEYS.LIST)
      setKeys(data)
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

  return (
    <div className="max-w-4xl text-foreground">
      {/* Header Info Block */}
      <div className="flex flex-col gap-1 mb-8">
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-widest">
          <Key className="h-3.5 w-3.5 text-brand" />
          Access Credentials Token Manager
        </div>
        <h1 className="font-heading text-3xl font-black text-foreground uppercase tracking-tight mt-1">
          API Keys
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground max-w-xl mt-1">
          Authenticate programmatic developer payload loops. Pass these secure tokens inside your request headers to unlock LifyGo server actions.
        </p>
      </div>

      {/* Error Callout */}
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-md bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive max-w-2xl">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h5 className="font-semibold tracking-tight">Key Handshake Error</h5>
            <p className="text-destructive/90 text-xs mt-0.5 font-mono">{error}</p>
          </div>
        </div>
      )}

      {/* Key Exposure Notice Banner */}
      {newKey && (
        <div className="border border-amber-500/20 rounded-lg p-5 bg-amber-500/10 mb-6 flex flex-col gap-2.5 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider font-bold text-amber-600 dark:text-amber-400">
            <KeyRound className="h-3.5 w-3.5 animate-bounce" /> Securing Production Token
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Copy this token string now. LifyGo salts secrets instantly using hash filters—for cluster isolation reasons, this code <span className="font-bold underline text-foreground">will never be revealed again</span>.
          </p>
          <code className="block bg-background border border-border rounded p-3 text-xs font-mono break-all select-all text-foreground font-semibold tracking-tight shadow-inner">
            {newKey.key}
          </code>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Token Provision Input Block */}
        <div 
          style={{ borderRadius: "12px 0px 12px 12px" }}
          className="border border-border bg-card p-6 shadow-xs relative overflow-hidden lg:col-span-5 flex flex-col gap-4"
        >
          <div className="flex items-center gap-2 border-b border-border pb-3 mb-1">
            <PlusCircle className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-heading font-bold text-foreground text-sm uppercase tracking-tight">
              Provision Key Pair
            </h2>
          </div>

          <div className="flex flex-col gap-1.5">
            <Input
              placeholder="Alias Name (e.g., production-worker)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && name && handleCreate()}
              className="bg-muted/30 border-border focus-visible:ring-brand font-medium text-sm text-foreground h-10"
            />
          </div>

          <Button 
            onClick={handleCreate} 
            disabled={loading || !name}
            className="bg-foreground text-background hover:bg-foreground/90 transition-colors text-xs font-medium h-10 shadow-xs w-full"
          >
            {loading ? "Generating Safe Token..." : "Generate API Key"}
          </Button>
        </div>

        {/* Dynamic Registered Keys Output Matrix */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          {keys.length === 0 ? (
            <div className="border border-dashed border-border rounded-lg p-12 text-center bg-card/50">
              <KeyRound className="h-8 w-8 text-muted-foreground/60 mx-auto mb-3" />
              <p className="text-muted-foreground text-xs font-mono uppercase tracking-wider">
                No cluster keys initialized.
              </p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <thead>
                    <tr className="bg-muted/50 border-b border-border font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                      <th className="p-4 font-semibold">Token Label Alias</th>
                      <th className="p-4 font-semibold">Last Used Trace</th>
                      <th className="p-4 font-semibold">Created (UTC)</th>
                      <th className="p-4 text-right"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {keys.map((key) => (
                      <tr key={key.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="p-4 font-medium text-foreground truncate max-w-[140px]">
                          {key.name}
                        </td>
                        <td className="p-4 font-mono text-xs text-muted-foreground">
                          {key.last_used_at ? (
                            new Date(key.last_used_at).toLocaleDateString()
                          ) : (
                            <Badge 
                              variant="outline" 
                              className="rounded-sm px-1.5 py-0 text-[9px] uppercase font-mono tracking-wider bg-muted text-muted-foreground/80 border-border"
                            >
                              Unused
                            </Badge>
                          )}
                        </td>
                        <td className="p-4 font-mono text-xs text-muted-foreground">
                          {new Date(key.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-right opacity-80 group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(key.id)}
                            disabled={deleting === key.id}
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-all"
                            aria-label="Terminate Token Access"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}