import { Shield, Key, Eye, Globe, Terminal } from "lucide-react"

export default function SecurityPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8 font-sans antialiased">
      <div className="flex items-center gap-3 mb-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10">
          <Shield className="h-5 w-5 text-brand" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Security notice
        </h1>
      </div>

      <p className="text-neutral-500 leading-relaxed mb-8">
        Your API key grants full access to send emails and manage jobs on your account.
        Treat it like a password. Anyone with your key can send email as you.
      </p>

      <div className="space-y-8">
        <section>
          <h2 className="flex items-center gap-2 text-lg font-medium text-neutral-900 mb-2">
            <Key className="h-4 w-4 text-brand" />
            Never expose your API key
          </h2>
          <p className="text-neutral-500 leading-relaxed">
            Store your API key in environment variables, not in source code. Never commit
            it to a repository. Never include it in client-side JavaScript, mobile apps, or
            public configuration files. If your key is leaked, rotate it immediately from
            the dashboard.
          </p>
        </section>

        <section>
          <h2 className="flex items-center gap-2 text-lg font-medium text-neutral-900 mb-2">
            <Eye className="h-4 w-4 text-brand" />
            What your key can do
          </h2>
          <p className="text-neutral-500 leading-relaxed">
            A single LifyGo API key authorizes all three services — transactional email
            sending, OTP generation and verification, and cron job scheduling. There is
            no scoped access currently. Anyone with the key can send emails from your
            configured from address and manage your scheduled jobs.
          </p>
        </section>

        <section>
          <h2 className="flex items-center gap-2 text-lg font-medium text-neutral-900 mb-2">
            <Terminal className="h-4 w-4 text-brand" />
            Server-side only
          </h2>
          <p className="text-neutral-500 leading-relaxed">
            Make all LifyGo API calls from your backend. Never call the API directly
            from a browser or mobile client. If you need to trigger emails from a
            frontend action, route the request through your own API first — your server
            holds the key, your server makes the call to LifyGo.
          </p>
        </section>

        <section>
          <h2 className="flex items-center gap-2 text-lg font-medium text-neutral-900 mb-2">
            <Globe className="h-4 w-4 text-brand" />
            Self-hosting security
          </h2>
          <p className="text-neutral-500 leading-relaxed">
            If you self-host LifyGo, your SMTP credentials are encrypted at rest with
            AES-256-GCM. The encryption key is stored in your environment variables
            and never logged or exposed in API responses. Rotate your encryption key
            periodically. Use a reverse proxy with TLS for all external traffic.
          </p>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t border-neutral-200">
        <p className="text-sm text-neutral-400">
          Have a security concern or found a vulnerability? Email us at{" "}
          <a href="mailto:security@lifygo.com" className="text-brand hover:text-brand/80 transition-colors">
            security@lifygo.com
          </a>
          {" "}instead of opening a public issue.
        </p>
      </div>
    </div>
  )
}
