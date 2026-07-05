import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  className?: string;
};

export function LawyerReviewedBadge({ label, className }: Props) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "gap-1 border-emerald-200/80 bg-emerald-500/10 font-medium text-emerald-800 hover:bg-emerald-500/10 dark:text-emerald-300",
        className
      )}
    >
      <CheckCircle2 className="size-3 shrink-0" aria-hidden />
      {label}
    </Badge>
  );
}
