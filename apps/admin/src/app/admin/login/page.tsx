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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      {/* Fundo decorativo */}
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-background" />
        <div className="absolute right-0 top-0 h-80 w-80 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/8 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 -translate-x-1/4 translate-y-1/4 rounded-full bg-primary/6 blur-3xl" />
      </div>

      <div className="w-full max-w-sm">
        {/* Logo / marca */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary shadow-md">
            <span className="text-2xl font-black text-primary-foreground">P</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">PedeFree</h1>
          <p className="mt-1 text-sm text-muted-foreground">Acesse o painel administrativo</p>
        </div>

        {/* Card do formulário */}
        <div className="rounded-3xl border border-border/60 bg-card p-7 shadow-md">
          <form action={action} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">
                E-mail
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                autoFocus
                placeholder="admin@email.com"
                className="rounded-xl border-border"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">
                Senha
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="rounded-xl border-border"
              />
            </div>

            {state?.error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {state.error}
              </div>
            )}

            <Button
              type="submit"
              className="mt-2 h-12 w-full rounded-2xl text-sm font-semibold"
              disabled={isPending}
            >
              {isPending ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
