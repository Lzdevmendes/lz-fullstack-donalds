import { NextRequest, NextResponse } from "next/server";

import { db } from "@/lib/prisma";

const VALID_NUMBER_REGEX = /^\d+$/;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await params;

  if (!orderId || !VALID_NUMBER_REGEX.test(orderId)) {
    return NextResponse.json({ error: "Invalid order id" }, { status: 400 });
  }

  const normalizedId = parseInt(orderId, 10);

  const order = await db.order.findUnique({
    where: { id: normalizedId },
    select: { status: true, updatedAt: true },
  });

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json(order, {
    headers: {
      "Cache-Control": "private, no-store",
    },
  });
}

