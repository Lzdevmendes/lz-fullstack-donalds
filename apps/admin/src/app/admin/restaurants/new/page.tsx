"use client";

import Link from "next/link";
import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { createRestaurant } from "../../actions";

const NewRestaurantPage = () => {
  const [state, action, isPending] = useActionState(createRestaurant, {});

  return (
    <div className="mx-auto max-w-lg p-8">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link href="/admin">← Voltar</Link>
        </Button>
        <h1 className="text-2xl font-bold">Novo Restaurante</h1>
      </div>

      <form action={action} className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
        <div className="space-y-1">
          <Label htmlFor="name">Nome *</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="slug">Slug (URL) *</Label>
          <Input id="slug" name="slug" placeholder="meu-restaurante" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="description">Descrição *</Label>
          <Textarea id="description" name="description" rows={3} required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="avatarImageUrl">URL do avatar *</Label>
          <Input id="avatarImageUrl" name="avatarImageUrl" type="url" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="coverImageUrl">URL da capa *</Label>
          <Input id="coverImageUrl" name="coverImageUrl" type="url" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="primaryColor">Cor primária (HSL)</Label>
          <Input
            id="primaryColor"
            name="primaryColor"
            placeholder="42 100% 50%"
          />
          <p className="text-xs text-muted-foreground">
            Formato HSL sem hsl() — ex: 220 90% 56%
          </p>
        </div>

        {state?.error && <p className="text-sm text-red-500">{state.error}</p>}

        <Button type="submit" className="w-full rounded-full" disabled={isPending}>
          {isPending ? "Criando..." : "Criar restaurante"}
        </Button>
      </form>
    </div>
  );
};

export default NewRestaurantPage;
