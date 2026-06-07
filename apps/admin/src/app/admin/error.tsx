"use client";

import { RefreshCwIcon } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <RefreshCwIcon className="text-red-500" size={28} />
      </div>
      <h1 className="text-xl font-semibold">Erro no painel</h1>
      <p className="text-sm text-muted-foreground">
        Ocorreu um erro inesperado. Tente recarregar a página.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} className="rounded-full">
          Tentar novamente
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/admin">Ir para o início</Link>
        </Button>
      </div>
    </div>
  );
}
