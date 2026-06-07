import Image from "next/image";

interface ConsumptionMethodOptionProps {
  imageUrl: string;
  imageAlt: string;
  buttonText: string;
  onClick: () => void;
  priority?: boolean;
}

const ConsumptionMethodOption = ({
  imageAlt,
  imageUrl,
  buttonText,
  onClick,
  priority = false,
}: ConsumptionMethodOptionProps) => {
  return (
    <button
      onClick={onClick}
      className="group w-full rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:border-primary/50 hover:shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex flex-col items-center gap-4 px-4 py-6">
        <div className="relative h-[80px] w-[80px] transition-transform duration-200 group-hover:scale-105">
          <Image
            src={imageUrl}
            fill
            alt={imageAlt}
            priority={priority}
            className="object-contain drop-shadow-sm"
          />
        </div>
        <span className="w-full rounded-xl bg-primary/10 py-2 text-center text-sm font-semibold text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
          {buttonText}
        </span>
      </div>
    </button>
  );
};

export default ConsumptionMethodOption;
