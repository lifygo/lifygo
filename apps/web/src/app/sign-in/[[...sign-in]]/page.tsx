import { SignIn } from "@clerk/nextjs";

// Clerk renders its own hosted sign-in UI here.
// Google and GitHub OAuth buttons are shown automatically
// based on what you enabled in the Clerk dashboard.
export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950">
      <SignIn />
    </main>
  );
}