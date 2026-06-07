import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/prisma";
import { verifyAdminSession } from "@/lib/session";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = (await cookies()).get("admin_session");
  if (!session?.value || !verifyAdminSession(session.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const orders = await db.order.findMany({
    where: { restaurantId: id, status: { not: "CANCELLED" } },
    include: { orderProducts: { include: { product: { select: { name: true } } } } },
    orderBy: { createdAt: "desc" },
    take: 1000,
  });

  const rows = [
    ["ID", "Data", "Status", "Método", "Cliente", "Mesa", "Itens", "Total"],
    ...orders.map((o) => [
      o.id,
      new Date(o.createdAt).toLocaleString("pt-BR"),
      o.status,
      o.consumptionMethod === "DINE_IN" ? "Mesa" : "Retirada",
      o.customerName ?? "",
      o.tableNumber ?? "",
      o.orderProducts.map((op) => `${op.quantity}x ${op.product.name}`).join(" | "),
      o.total.toFixed(2).replace(".", ","),
    ]),
  ];

  const csv = rows.map((r) => r.map((c) => `"${c}"`).join(";")).join("\n");
  const bom = "﻿";

  return new NextResponse(bom + csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pedidos.csv"`,
    },
  });
}
