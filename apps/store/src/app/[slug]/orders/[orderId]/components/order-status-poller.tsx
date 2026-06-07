"use client";

import { OrderStatus } from "@prisma/client";
import {
  CheckCircleIcon,
  ChefHatIcon,
  ClockIcon,
  WifiOffIcon,
  XCircleIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Step {
  status: OrderStatus;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
}

const STEPS: Step[] = [
  {
    status: "PENDING",
    label: "Recebido",
    sublabel: "Pedido enviado ao restaurante",
    icon: <ClockIcon size={16} />,
  },
  {
    status: "IN_PREPARATION",
    label: "Em preparo",
    sublabel: "Sua comida está sendo preparada",
    icon: <ChefHatIcon size={16} />,
  },
  {
    status: "FINISHED",
    label: "Pronto!",
    sublabel: "Pode retirar seu pedido",
    icon: <CheckCircleIcon size={16} />,
  },
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

const BASE_INTERVAL = 10_000;
const MAX_FAILURES = 3;
const MAX_BACKOFF = 60_000;

const OrderStatusPoller = ({ orderId, initialStatus }: OrderStatusPollerProps) => {
  const [status, setStatus] = useState<OrderStatus>(initialStatus);
  const [connectionError, setConnectionError] = useState(false);
  const failureCount = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (status === "FINISHED" || status === "CANCELLED") return;

    const getDelay = () =>
      failureCount.current > 0
        ? Math.min(BASE_INTERVAL * (1 << failureCount.current), MAX_BACKOFF)
        : BASE_INTERVAL;

    const poll = async () => {
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
    };

    const schedule = () => {
      timeoutRef.current = setTimeout(async () => {
        await poll();
        schedule();
      }, getDelay());
    };

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    schedule();

    const handleVisibility = () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (document.visibilityState === "visible") {
        poll().then(schedule);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [orderId, status]);

  if (status === "CANCELLED") {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100">
          <XCircleIcon className="text-red-500" size={26} />
        </div>
        <p className="font-semibold text-red-600">Pedido cancelado</p>
        <p className="text-xs text-muted-foreground">
          Entre em contato com o estabelecimento caso precise de ajuda.
        </p>
      </div>
    );
  }

  const currentStep = STATUS_ORDER[status] ?? 0;

  return (
    <div className="w-full" aria-live="polite" aria-atomic="true">
      {/* Steps verticais */}
      <div className="space-y-0">
        {STEPS.map((step, idx) => {
          const done = idx <= currentStep;
          const isLast = idx === STEPS.length - 1;
          return (
            <div key={step.status} className="flex gap-3">
              {/* Ícone + linha */}
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-500 ${
                    done
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-muted text-muted-foreground"
                  }`}
                >
                  {step.icon}
                </div>
                {!isLast && (
                  <div
                    className={`mt-1 h-8 w-0.5 transition-colors duration-700 ${
                      idx < currentStep ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </div>

              {/* Texto */}
              <div className={`pb-${isLast ? 0 : 4} pt-1.5`}>
                <p
                  className={`text-sm font-semibold leading-none ${
                    done ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                  {idx === currentStep && status !== "FINISHED" && (
                    <span className="ml-2 inline-block h-2 w-2 animate-pulse rounded-full bg-primary align-middle" />
                  )}
                </p>
                <p className={`mt-1 text-xs ${done ? "text-muted-foreground" : "text-muted-foreground/50"}`}>
                  {step.sublabel}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mensagem de erro de conexão */}
      {connectionError && (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-3 text-orange-700">
          <WifiOffIcon size={14} />
          <p className="text-xs">Sem conexão — tentando reconectar...</p>
        </div>
      )}

      {/* Atualização automática */}
      {status !== "FINISHED" && !connectionError && (
        <p className="mt-4 text-center text-xs text-muted-foreground/60">
          Atualiza automaticamente
        </p>
      )}
    </div>
  );
};

export default OrderStatusPoller;
