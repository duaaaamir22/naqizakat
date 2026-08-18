import { Link, useRouterState } from "@tanstack/react-router";
import {
  Calculator,
  ClipboardList,
  LayoutDashboard,
  Leaf,
  ShieldCheck,
} from "lucide-react";
import naqiMark from "../assets/naqi-mark.png.asset.json";


const navItems = [
  { to: "/calculator", label: "Calculator", icon: Calculator },
  { to: "/zakat-form", label: "My Assets", icon: ClipboardList },
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/impact", label: "Impact", icon: Leaf },
  { to: "/verify", label: "Verify", icon: ShieldCheck },
];


export function Header() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <img src={naqiMark.url} alt="Naqi logo" className="h-9 w-9 rounded-lg" />
          <span className="font-wordmark text-2xl font-semibold leading-none tracking-tight text-foreground">
            Naqi
          </span>
        </Link>


        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:block">
          <Link
            to="/calculator"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Calculate Zakat
          </Link>
        </div>

        <MobileNav />
      </div>
    </header>
  );
}

function MobileNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background md:hidden">
      <div className="grid grid-cols-6 gap-1 p-2">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center gap-1 rounded-md px-2 py-2 text-xs transition-colors ${
            pathname === "/"
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:bg-accent/50"
          }`}
        >
          <img src={naqiMark.url} alt="" className="h-4 w-4 rounded" />
          <span>Home</span>
        </Link>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center gap-1 rounded-md px-2 py-2 text-xs transition-colors ${
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent/50"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
