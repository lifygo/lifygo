"use client";

import { useState, useEffect } from "react";
import { useApi } from "@/lib/use-api";
import { ENDPOINTS } from "@/lib/endpoints";
import type { SmtpConfig, UpsertSmtpConfigInput } from "@/features/smtp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const emptyForm: UpsertSmtpConfigInput = {
  host: "",
  port: 587,
  username: "",
  password: "",
  from_address: "",
};

export default function SmtpPage() {
  const { call } = useApi();
  const [form, setForm] = useState<UpsertSmtpConfigInput>(emptyForm);
  const [config, setConfig] = useState<SmtpConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function fetchConfig() {
      try {
        const data = await call<SmtpConfig>(ENDPOINTS.SMTP.GET);
        if (!cancelled) {
          setConfig(data);
          setForm((prev) => ({
            ...prev,
            host: data.host,
            port: data.port,
            username: data.username,
            from_address: data.from_address,
          }));
        }
      } catch {
        // No config yet — that's fine, show empty form.
      }
    }
    fetchConfig();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "port" ? Number(value) : value,
    }));
  }

  async function handleSave() {
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const data = await call<SmtpConfig>(ENDPOINTS.SMTP.UPSERT, {
        method: "POST",
        body: JSON.stringify(form),
      });
      setConfig(data);
      setSuccess("SMTP config saved successfully.");
      setForm((prev) => ({ ...prev, password: "" }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save config");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    setError("");
    setDeleting(true);
    try {
      await call(ENDPOINTS.SMTP.DELETE, { method: "DELETE" });
      setConfig(null);
      setForm(emptyForm);
      setSuccess("SMTP config removed.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete config");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-2">SMTP Config</h1>
      <p className="text-gray-500 text-sm mb-6">
        LifyGo uses your own SMTP server to send emails. Your credentials are
        encrypted at rest and never stored in plain text.
      </p>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {success && <p className="text-green-600 text-sm mb-4">{success}</p>}

      <div className="flex flex-col gap-4">
        <div>
          <Label htmlFor="host">SMTP Host</Label>
          <Input
            id="host"
            name="host"
            placeholder="smtp.gmail.com"
            value={form.host}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="port">Port</Label>
          <Input
            id="port"
            name="port"
            type="number"
            placeholder="587"
            value={form.port}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            placeholder="you@gmail.com"
            value={form.username}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder={config ? "Leave blank to keep existing" : "Your SMTP password"}
            value={form.password}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="from_address">From Address</Label>
          <Input
            id="from_address"
            name="from_address"
            placeholder="hello@yourdomain.com"
            value={form.from_address}
            onChange={handleChange}
          />
        </div>

        <div className="flex gap-2 mt-2">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : config ? "Update Config" : "Save Config"}
          </Button>

          {config && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Removing..." : "Remove Config"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}