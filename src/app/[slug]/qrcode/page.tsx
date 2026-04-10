import { headers } from "next/headers";
import { notFound } from "next/navigation";

import { db } from "@/lib/prisma";

import QrGrid from "./qr-grid";

interface QrCodePageProps {
  params: Promise<{ slug: string }>;
}

const QrCodePage = async ({ params }: QrCodePageProps) => {
  const { slug } = await params;
  const restaurant = await db.restaurant.findUnique({
    where: { slug },
    select: { name: true, tableCount: true },
  });

  if (!restaurant) return notFound();

  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{restaurant.name}</h1>
            <p className="text-sm text-muted-foreground">
              QR Codes para {restaurant.tableCount} mesas — imprima e afixe em cada mesa
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground print:hidden"
          >
            Imprimir
          </button>
        </div>

        <QrGrid
          slug={slug}
          tableCount={restaurant.tableCount}
          baseUrl={baseUrl}
        />
      </div>
    </div>
  );
};

export default QrCodePage;
