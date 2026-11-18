import type { Metadata } from "next";
import { AuthShell } from "@/components/AuthShell";
import { RegisterForm } from "@/components/AuthForms";

export const metadata: Metadata = { title: "Реєстрація · Вішліст до Миколая" };

export default function RegisterPage() {
  return (
    <AuthShell title="Реєстрація">
      <RegisterForm />
    </AuthShell>
  );
}
