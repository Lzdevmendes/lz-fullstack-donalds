"use client";

import { useActionState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { adminLogin } from "../actions";

const AdminLoginPage = () => {
  const [state, action, isPending] = useActionState(adminLogin, {});

  useEffect(() => {
    if (state?.success) {
      window.location.href = "/admin";
    }
  }, [state]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-2xl font-bold">Painel Admin</h1>
        <p className="mb-6 text-sm text-muted-foreground">
          Acesse com suas credenciais de administrador
        </p>

        <form action={action} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" required autoFocus />
          </div>
          <div className="space-y-1">
            <Label htmlFor="password">Senha</Label>
            <Input id="password" name="password" type="password" required />
          </div>

          {state?.error && (
            <p className="text-sm text-red-500">{state.error}</p>
          )}

          <Button type="submit" className="w-full rounded-full" disabled={isPending}>
            {isPending ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;
