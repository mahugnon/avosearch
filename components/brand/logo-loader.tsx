import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  size?: "sm" | "md";
};

export function LogoLoader({ className, size = "sm" }: Props) {
  const circle = size === "sm" ? "size-3.5" : "size-5";

  return (
    <div className={cn("inline-flex items-center", className)} aria-hidden>
      <span className={cn(circle, "logo-loader-circle rounded-full bg-foreground")} />
      <span
        className={cn(circle, "logo-loader-circle logo-loader-circle--blue -ml-1.5 rounded-full bg-primary")}
      />
    </div>
  );
}
