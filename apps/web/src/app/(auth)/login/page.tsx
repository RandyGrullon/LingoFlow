"use client";

import { AuthPageShell } from "@/components/auth/AuthPageShell";
import { LoginRegisterForm } from "@/components/auth/LoginRegisterForm";

export default function LoginPage() {
  return (
    <AuthPageShell>
      <LoginRegisterForm />
    </AuthPageShell>
  );
}
