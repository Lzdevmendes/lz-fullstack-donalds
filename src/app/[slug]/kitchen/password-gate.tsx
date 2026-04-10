"use client";

import { ChefHatIcon } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { kitchenLogin } from "./actions";

interface PasswordGateProps {
  slug: string;
}

const PasswordGate = ({ slug }: PasswordGateProps) => {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await kitchenLogin(slug, password);
      if (result.success) {
        window.location.reload();
      } else {
        setError(result.error ?? "Erro desconhecido");
      }
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <ChefHatIcon className="text-primary" size={32} />
        </div>
        <h1 className="text-2xl font-semibold">Cozinha</h1>
        <p className="text-sm text-muted-foreground">
          Digite a senha para acessar o painel da cozinha.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-3">
        <Input
          type="password"
          placeholder="Senha da cozinha"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError("");
          }}
          autoFocus
        />
        {error && <p className="text-xs text-red-500">{error}</p>}
        <Button type="submit" className="w-full rounded-full" disabled={isPending}>
          {isPending ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </div>
  );
};

export default PasswordGate;
