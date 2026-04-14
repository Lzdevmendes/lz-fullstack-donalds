"use client";

import { OrderStatus } from "@prisma/client";
import {
  CheckCircleIcon,
  ChefHatIcon,
  ClockIcon,
  WifiOffIcon,
  XCircleIcon,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface Step {
  status: OrderStatus;
  label: string;
  icon: React.ReactNode;
}

const STEPS: Step[] = [
  { status: "PENDING", label: "Pedido recebido", icon: <ClockIcon size={18} /> },
  { status: "IN_PREPARATION", label: "Em preparo", icon: <ChefHatIcon size={18} /> },
  { status: "FINISHED", label: "Pronto!", icon: <CheckCircleIcon size={18} /> },
];

const STATUS_ORDER: Partial<Record<OrderStatus, number>> = {
  PENDING: 0,
  IN_PREPARATION: 1,
  FINISHED: 2,
};

interface OrderStatusPollerProps {
  orderId: number;
  initialStatus: OrderStatus;
}

const MAX_FAILURES = 3;

const OrderStatusPoller = ({ orderId, initialStatus }: OrderStatusPollerProps) => {
  const [status, setStatus] = useState<OrderStatus>(initialStatus);
  const [connectionError, setConnectionError] = useState(false);
  const failureCount = useRef(0);

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        failureCount.current = 0;
        setConnectionError(false);
        setStatus(data.status);
      } else {
        failureCount.current += 1;
        if (failureCount.current >= MAX_FAILURES) setConnectionError(true);
      }
    } catch {
      failureCount.current += 1;
      if (failureCount.current >= MAX_FAILURES) setConnectionError(true);
    }
  }, [orderId]);

  useEffect(() => {
    if (status === "FINISHED" || status === "CANCELLED") return;

    let interval = setInterval(poll, 10_000);

    const handleVisibility = () => {
      clearInterval(interval);
      if (document.visibilityState === "visible") {
        poll();
        interval = setInterval(poll, 10_000);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [poll, status]);

  if (status === "CANCELLED") {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
          <XCircleIcon className="text-red-500" size={24} />
        </div>
        <p className="font-semibold text-red-600">Pedido cancelado</p>
        <p className="text-center text-xs text-muted-foreground">
          Entre em contato com o estabelecimento caso precise de ajuda.
        </p>
      </div>
    );
  }

  const currentStep = STATUS_ORDER[status] ?? 0;

  return (
    <div className="w-full">
      <div className="relative flex justify-between">
        <div className="absolute left-0 right-0 top-[18px] h-0.5 bg-gray-200">
          <div
            className="h-full bg-primary transition-all duration-700"
            style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
          />
        </div>

        {STEPS.map((step, idx) => {
          const done = idx <= currentStep;
          return (
            <div key={step.status} className="relative flex flex-col items-center gap-2">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors duration-500 ${
                  done
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-gray-300 bg-white text-gray-400"
                }`}
              >
                {step.icon}
              </div>
              <span
                className={`text-center text-xs font-medium ${
                  done ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {status === "FINISHED" && (
        <p className="mt-6 text-center text-sm font-semibold text-green-600">
          Seu pedido está pronto! Pode retirar.
        </p>
      )}

      {status !== "FINISHED" && !connectionError && (
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Atualiza automaticamente a cada 10 segundos
        </p>
      )}

      {connectionError && (
        <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-orange-50 px-3 py-2 text-orange-700">
          <WifiOffIcon size={14} />
          <p className="text-xs">Sem conexão — tentando reconectar...</p>
        </div>
      )}
    </div>
  );
};

export default OrderStatusPoller;
