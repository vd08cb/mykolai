"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { translateAuthError } from "@/lib/auth-errors";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

type Note = { kind: "ok" | "error"; text: string } | null;

function NoteLine({ note }: { note: Note }) {
  if (!note) return null;
  return (
    <p className={`hint ${note.kind}`} role="status">
      {note.text}
    </p>
  );
}

function siteOrigin() {
  return process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
}

export function RegisterForm() {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<Note>(null);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    if (name.length < 2) return setNote({ kind: "error", text: "Вкажи ім'я, яке побачать інші." });

    setBusy(true);
    setNote(null);
    const { data, error } = await createClient().auth.signUp({
      email,
      password,
      options: { data: { name }, emailRedirectTo: siteOrigin() },
    });
    setBusy(false);

    if (error) return setNote({ kind: "error", text: translateAuthError(error.message) });
    // Supabase returns a user with no identities when the email is already registered.
    if (data.user && data.user.identities?.length === 0)
      return setNote({ kind: "error", text: "Цю пошту вже зареєстровано. Спробуй увійти." });
    setSent(true);
  }

  if (sent) {
    return (
      <>
        <p className="notice">
          Майже готово! Ми надіслали лист на твою пошту. Відкрий його і натисни посилання, щоб підтвердити реєстрацію.
          Якщо листа немає, глянь у «Спам».
        </p>
        <Link href="/login" className="btn btn-ghost btn-block">
          До входу
        </Link>
      </>
    );
  }

  return (
    <>
      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="reg-name">Ім'я</label>
          <input id="reg-name" name="name" autoComplete="name" required maxLength={40} placeholder="Як тебе підписати" />
        </div>
        <div className="field">
          <label htmlFor="reg-email">Пошта</label>
          <input id="reg-email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="field">
          <label htmlFor="reg-password">Пароль</label>
          <input id="reg-password" name="password" type="password" autoComplete="new-password" minLength={6} required />
        </div>
        <button className="btn btn-gold btn-block" type="submit" disabled={busy || !isSupabaseConfigured}>
          {busy ? "Реєструємо…" : "Зареєструватися"}
        </button>
      </form>
      <NoteLine note={note} />
      <div className="auth-links">
        <span>
          Вже є акаунт? <Link href="/login">Увійти</Link>
        </span>
      </div>
    </>
  );
}

export function LoginForm({ linkError }: { linkError: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<Note>(
    linkError ? { kind: "error", text: "Посилання з листа недійсне або застаріле. Спробуй увійти або запроси новий лист." } : null,
  );

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setBusy(true);
    setNote(null);
    const { error } = await createClient().auth.signInWithPassword({
      email: String(form.get("email") ?? "").trim(),
      password: String(form.get("password") ?? ""),
    });
    if (error) {
      setBusy(false);
      return setNote({ kind: "error", text: translateAuthError(error.message) });
    }
    router.push("/");
    router.refresh();
  }

  return (
    <>
      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="login-email">Пошта</label>
          <input id="login-email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="field">
          <label htmlFor="login-password">Пароль</label>
          <input id="login-password" name="password" type="password" autoComplete="current-password" required />
        </div>
        <button className="btn btn-gold btn-block" type="submit" disabled={busy || !isSupabaseConfigured}>
          {busy ? "Входимо…" : "Увійти"}
        </button>
      </form>
      <NoteLine note={note} />
      <div className="auth-links">
        <Link href="/forgot-password">Забули пароль?</Link>
        <Link href="/register">Зареєструватися</Link>
      </div>
    </>
  );
}

export function ForgotPasswordForm() {
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<Note>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "").trim();
    setBusy(true);
    setNote(null);
    const { error } = await createClient().auth.resetPasswordForEmail(email, {
      redirectTo: `${siteOrigin()}/reset-password`,
    });
    setBusy(false);
    setNote(
      error
        ? { kind: "error", text: translateAuthError(error.message) }
        : { kind: "ok", text: "Якщо така пошта зареєстрована, ми надіслали на неї посилання для нового пароля." },
    );
  }

  return (
    <>
      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="forgot-email">Пошта</label>
          <input id="forgot-email" name="email" type="email" autoComplete="email" required />
        </div>
        <button className="btn btn-gold btn-block" type="submit" disabled={busy || !isSupabaseConfigured}>
          {busy ? "Надсилаємо…" : "Надіслати посилання"}
        </button>
      </form>
      <NoteLine note={note} />
      <div className="auth-links">
        <Link href="/login">← Назад до входу</Link>
      </div>
    </>
  );
}

export function ResetPasswordForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<Note>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const password = String(form.get("password") ?? "");
    if (password !== String(form.get("password2") ?? ""))
      return setNote({ kind: "error", text: "Паролі не збігаються." });

    setBusy(true);
    setNote(null);
    const { error } = await createClient().auth.updateUser({ password });
    setBusy(false);
    if (error) return setNote({ kind: "error", text: translateAuthError(error.message) });
    setNote({ kind: "ok", text: "Пароль змінено. Повертаємо тебе до вішліста…" });
    setTimeout(() => {
      router.push("/");
      router.refresh();
    }, 1200);
  }

  return (
    <>
      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="reset-password">Новий пароль</label>
          <input id="reset-password" name="password" type="password" autoComplete="new-password" minLength={6} required />
        </div>
        <div className="field">
          <label htmlFor="reset-password2">Ще раз</label>
          <input id="reset-password2" name="password2" type="password" autoComplete="new-password" minLength={6} required />
        </div>
        <button className="btn btn-gold btn-block" type="submit" disabled={busy || !isSupabaseConfigured}>
          {busy ? "Зберігаємо…" : "Зберегти пароль"}
        </button>
      </form>
      <NoteLine note={note} />
    </>
  );
}
