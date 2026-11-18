import type { Metadata } from "next";
import { AuthShell } from "@/components/AuthShell";
import { ForgotPasswordForm } from "@/components/AuthForms";

export const metadata: Metadata = { title: "Новий пароль · Вішліст до Миколая" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Забули пароль?">
      <p className="hint">Вкажи пошту, з якою реєструвався(-лась), і ми надішлемо посилання для нового пароля.</p>
      <ForgotPasswordForm />
    </AuthShell>
  );
}
