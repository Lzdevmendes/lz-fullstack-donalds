import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { db } from "@/lib/prisma";
import { updateProduct } from "../../../../../actions";

const BADGE_OPTIONS = [
  { value: "", label: "Sem badge" },
  { value: "NOVO", label: "Novo" },
  { value: "MAIS_PEDIDO", label: "Mais pedido" },
  { value: "PROMOCAO", label: "Promoção" },
];

interface PageProps {
  params: Promise<{ id: string; productId: string }>;
}

const EditProductPage = async ({ params }: PageProps) => {
  const { id, productId } = await params;

  const [product, categories] = await Promise.all([
    db.product.findUnique({ where: { id: productId } }),
    db.menuCategory.findMany({ where: { restaurantId: id }, orderBy: { name: "asc" } }),
  ]);

  if (!product) return notFound();

  const action = updateProduct.bind(null, productId, id, {});

  return (
    <div className="mx-auto max-w-lg p-8">
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm" className="-ml-2 mb-2">
          <Link href={`/admin/restaurants/${id}`}>← Voltar</Link>
        </Button>
        <h1 className="text-2xl font-bold">Editar produto</h1>
      </div>
      <form action={action as never} className="space-y-4 rounded-xl border bg-white p-6 shadow-sm">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Nome *</Label>
            <Input name="name" required defaultValue={product.name} />
          </div>
          <div className="space-y-1">
            <Label>Preço (R$) *</Label>
            <Input name="price" type="number" step="0.01" min="0" required defaultValue={product.price} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label>Categoria *</Label>
            <select name="menuCategoryId" required defaultValue={product.menuCategoryId} className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary">
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <Label>Badge</Label>
            <select name="badge" defaultValue={product.badge ?? ""} className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary">
              {BADGE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
        <div className="space-y-1">
          <Label>URL da imagem *</Label>
          <Input name="imageUrl" type="url" required defaultValue={product.imageUrl} />
        </div>
        <div className="space-y-1">
          <Label>Descrição *</Label>
          <Textarea name="description" required rows={2} defaultValue={product.description} />
        </div>
        <div className="space-y-1">
          <Label>Ingredientes (um por linha)</Label>
          <Textarea name="ingredients" rows={3} defaultValue={product.ingredients.join("\n")} />
        </div>
        <Button type="submit" className="w-full rounded-full">Salvar alterações</Button>
      </form>
    </div>
  );
};

export default EditProductPage;
