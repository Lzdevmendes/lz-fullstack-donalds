"use client";

import { ArrowLeftIcon, RefreshCwIcon } from "lucide-react";
import Link from "next/link";
import { use, useEffect } from "react";

import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
  params?: Promise<{ slug: string }>;
}

export default function OrderError({ error, reset, params }: ErrorPageProps) {
  const resolvedParams = params ? use(params) : null;

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
        <RefreshCwIcon className="text-red-500" size={28} />
      </div>
      <h1 className="text-xl font-semibold">Erro ao carregar pedido</h1>
      <p className="text-sm text-muted-foreground">
        Não foi possível exibir os detalhes do pedido. Tente novamente.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} className="rounded-full">
          Tentar novamente
        </Button>
        {resolvedParams?.slug && (
          <Button asChild variant="outline" className="rounded-full">
            <Link href={`/${resolvedParams.slug}`}>
              <ArrowLeftIcon size={14} />
              Voltar ao menu
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
