"use client";

import { StarIcon } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

import { submitRating } from "../actions";

interface RatingFormProps {
  orderId: number;
}

const RatingForm = ({ orderId }: RatingFormProps) => {
  const [stars, setStars] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = () => {
    if (stars === 0) { setError("Selecione uma nota"); return; }
    startTransition(async () => {
      const result = await submitRating(orderId, stars, comment);
      if (result.success) {
        setDone(true);
      } else {
        setError(result.error ?? "Erro ao enviar avaliação");
      }
    });
  };

  if (done) {
    return (
      <div className="mt-6 rounded-xl border bg-green-50 p-4 text-center">
        <p className="font-semibold text-green-700">Obrigado pela avaliação!</p>
        <p className="text-xs text-muted-foreground">Sua opinião nos ajuda a melhorar.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-xl border bg-white p-4">
      <p className="mb-3 text-sm font-semibold">Como foi seu pedido?</p>

      <div
        className="mb-3 flex justify-center gap-2"
        role="radiogroup"
        aria-label="Avaliação em estrelas"
      >
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={stars === s}
            aria-label={`${s} estrela${s > 1 ? "s" : ""}`}
            className="flex h-11 w-11 items-center justify-center rounded-full active:scale-90"
            onClick={() => setStars(s)}
            onMouseEnter={() => setHovered(s)}
            onMouseLeave={() => setHovered(0)}
          >
            <StarIcon
              size={32}
              className={`transition-colors ${
                s <= (hovered || stars)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Comentário (opcional)"
        rows={2}
        className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
      />

      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}

      <Button
        onClick={handleSubmit}
        disabled={isPending}
        className="mt-3 h-11 w-full rounded-full"
      >
        {isPending ? "Enviando..." : "Enviar avaliação"}
      </Button>
    </div>
  );
};

export default RatingForm;
