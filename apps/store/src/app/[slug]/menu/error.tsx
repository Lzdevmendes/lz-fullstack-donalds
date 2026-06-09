"use client";

import { RefreshCwIcon } from "lucide-react";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function MenuError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <RefreshCwIcon className="text-red-500" size={28} />
      </div>
      <h1 className="text-xl font-semibold">Erro ao carregar o cardápio</h1>
      <p className="text-sm text-muted-foreground">
        Não foi possível carregar o cardápio. Tente novamente.
      </p>
      <Button onClick={reset} className="rounded-full">
        Tentar novamente
      </Button>
    </div>
  );
}
