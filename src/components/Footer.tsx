import { Link } from "@tanstack/react-router";
import { Heart } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border bg-background pb-20 md:pb-0">
      <div className="container mx-auto px-4 py-8 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="font-display text-sm font-bold">ز</span>
            </span>
            <span className="font-display text-sm font-semibold text-foreground">ZakatChain</span>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            MSc Financial Technology dissertation prototype — blockchain for transparent Islamic
            charitable finance.
          </p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link to="/calculator" className="hover:text-foreground">
              Calculator
            </Link>
            <Link to="/dashboard" className="hover:text-foreground">
              Dashboard
            </Link>
            <Link to="/impact" className="hover:text-foreground">
              Impact
            </Link>
            <Link to="/verify" className="hover:text-foreground">
              Verify
            </Link>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-1 border-t border-border pt-6 text-xs text-muted-foreground">
          <span>Made with</span>
          <Heart className="h-3 w-3 fill-gold text-gold" />
          <span>for the UAE Islamic fintech community</span>
        </div>

        <p className="mt-2 text-center text-[10px] text-muted-foreground/70">
          © {year} Duaa E Aamir. Demo for research purposes.
        </p>
      </div>
    </footer>
  );
}
