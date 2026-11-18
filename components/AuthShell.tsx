import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export function AuthShell({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <main className="wrap auth">
      <div className="auth-card">
        <Link href="/" className="brand">
          ← Вішліст до Миколая
        </Link>
        <h1>{title}</h1>
        {!isSupabaseConfigured && (
          <p className="notice">База даних ще не підключена, тому ця форма поки не працює. Див. SETUP.md.</p>
        )}
        {children}
      </div>
    </main>
  );
}
