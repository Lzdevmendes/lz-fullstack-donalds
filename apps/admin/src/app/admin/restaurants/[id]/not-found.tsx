import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function RestaurantNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
        <span className="text-3xl">🏪</span>
      </div>
      <h1 className="text-xl font-semibold">Restaurante não encontrado</h1>
      <p className="text-sm text-muted-foreground">
        O restaurante solicitado não existe ou foi removido.
      </p>
      <Button asChild className="rounded-full">
        <Link href="/admin">Voltar ao painel</Link>
      </Button>
    </div>
  );
}
