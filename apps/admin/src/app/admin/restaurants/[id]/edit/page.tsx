"use client";

import Link from "next/link";
import { use, useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { updateRestaurant } from "../../../actions";

interface PageProps {
  params: Promise<{ id: string }>;
}

const EditRestaurantPage = ({ params }: PageProps) => {
  const { id } = use(params);
  const boundUpdate = updateRestaurant.bind(null, id);
  const [state, action, isPending] = useActionState(boundUpdate, {});

  return (
    <div className="mx-auto max-w-lg p-8">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link href={`/admin/restaurants/${id}`}>← Voltar</Link>
        </Button>
        <h1 className="text-2xl font-bold">Editar Restaurante</h1>
      </div>

      <form action={action} className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
        <div className="space-y-1">
          <Label htmlFor="name">Nome *</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="space-y-1">
          <Label htmlFor="slug">Slug (URL) *</Label>
          <Input id="slug" name="slug" required />
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
          <Input id="primaryColor" name="primaryColor" placeholder="42 100% 50%" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="tableCount">Número de mesas</Label>
          <Input id="tableCount" name="tableCount" type="number" min={1} placeholder="20" />
        </div>
        <div className="space-y-1">
          <Label htmlFor="kitchenPassword">
            Nova senha da cozinha{" "}
            <span className="text-xs text-muted-foreground">(deixe vazio para manter)</span>
          </Label>
          <Input id="kitchenPassword" name="kitchenPassword" type="password" />
        </div>

        {state?.error && <p className="text-sm text-red-500">{state.error}</p>}

        <Button type="submit" className="w-full rounded-full" disabled={isPending}>
          {isPending ? "Salvando..." : "Salvar alterações"}
        </Button>
      </form>
    </div>
  );
};

export default EditRestaurantPage;
