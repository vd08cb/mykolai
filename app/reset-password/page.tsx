import type { Metadata } from "next";
import { AuthShell } from "@/components/AuthShell";
import { ResetPasswordForm } from "@/components/AuthForms";

export const metadata: Metadata = { title: "Новий пароль · Вішліст до Миколая" };

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Новий пароль">
      <ResetPasswordForm />
    </AuthShell>
  );
}
