"use client";

import { PrinterIcon } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

interface QrGridProps {
  slug: string;
  tableCount: number;
  baseUrl: string;
}

const QrGrid = ({ slug, tableCount, baseUrl }: QrGridProps) => {
  return (
    <>
      <button
        onClick={() => window.print()}
        className="mb-6 flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground print:hidden"
      >
        <PrinterIcon size={16} />
        Imprimir
      </button>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: tableCount }, (_, i) => i + 1).map((table) => {
          const url = `${baseUrl}/${slug}?consumptionMethod=DINE_IN&table=${table}`;
          return (
            <div
              key={table}
              className="flex flex-col items-center gap-3 rounded-xl border bg-white p-4 shadow-sm"
            >
              <QRCodeSVG value={url} size={140} />
              <p className="text-sm font-semibold">Mesa {table}</p>
            </div>
          );
        })}
      </div>
    </>
  );
};

export default QrGrid;
