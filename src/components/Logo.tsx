import logo from "@/assets/profix-logo.png.asset.json";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <img
      src={logo.url}
      alt="ProFix Assistência Técnica"
      className={cn("h-12 w-auto object-contain", className)}
    />
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <span className={cn("font-display text-xl font-bold tracking-tight", className)}>
      <span className="text-brand-gradient">Pro</span>
      <span className="text-foreground">Fix</span>
    </span>
  );
}
