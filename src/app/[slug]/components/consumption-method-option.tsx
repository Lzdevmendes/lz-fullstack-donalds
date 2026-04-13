import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ConsumptionMethodOptionProps {
  imageUrl: string;
  imageAlt: string;
  buttonText: string;
  onClick: () => void;
}

const ConsumptionMethodOption = ({
  imageAlt,
  imageUrl,
  buttonText,
  onClick,
}: ConsumptionMethodOptionProps) => {
  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-5 py-6">
        <div className="relative h-[80px] w-[80px]">
          <Image
            src={imageUrl}
            fill
            alt={imageAlt}
            className="object-contain"
          />
        </div>
        <Button variant="secondary" className="h-10 w-full rounded-full text-sm font-semibold" onClick={onClick}>
          {buttonText}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ConsumptionMethodOption;