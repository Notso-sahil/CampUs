import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { MessageCircle, LogOut, User, Menu, X, MapPin } from "lucide-react";
import logoImg from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import GlobalSearch from "@/components/GlobalSearch";
import { useState } from "react";

const NAV_LINKS = [
  { to: "/", label: "Home", exact: true },
  { to: "/trade", label: "Trade" },
  { to: "/events", label: "Events" },
  { to: "/recover", label: "Recover" },
  { to: "/knowledge", label: "Knowledge Hub" },
  { to: "/expeditions", label: "Expeditions" },
  { to: "/find-teammates", label: "Find Teammates" },
];

export default function Navbar() {
  const { user, signOut } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b glass shadow-soft">
      <div className="container mx-auto px-4 max-w-full">
        {/* Top row */}
        <div className="flex h-16 items-center justify-between gap-2">
          <Link to="/" className="flex-shrink-0 flex items-center gap-2">
            <img src={logoImg} alt="CampusHub logo" className="h-8 w-8 object-contain" />
            <span className="font-display text-xl font-bold tracking-tight">
              Campus<span className="text-primary">Hub</span>
            </span>
          </Link>

          <GlobalSearch className="hidden md:flex flex-1 max-w-md" />

          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <div className="flex items-center gap-1.5 h-9 px-3 rounded-full bg-secondary/50 text-xs font-medium text-foreground max-w-[140px] sm:max-w-[180px] truncate">
              <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              <span className="truncate">VIPS</span>
            </div>

            {user ? (
              <>
                <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex rounded-full hover:bg-secondary/60">
                  <Link to="/chat"><MessageCircle className="h-5 w-5 text-foreground" strokeWidth={2} /></Link>
                </Button>
                <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex rounded-full hover:bg-secondary/60">
                  <Link to="/dashboard"><User className="h-5 w-5 text-foreground" strokeWidth={2} /></Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={signOut} className="hidden sm:inline-flex rounded-full hover:bg-secondary/60">
                  <LogOut className="h-5 w-5 text-foreground" strokeWidth={2} />
                </Button>
              </>
            ) : (
              <Button asChild size="sm" className="gradient-primary text-primary-foreground rounded-full shadow-soft hover:shadow-glow transition-shadow text-xs px-3">
                <Link to="/auth">Sign In</Link>
              </Button>
            )}

            {/* Mobile hamburger */}
            <button
              type="button"
              className="md:hidden flex items-center justify-center w-11 h-11 rounded-full hover:bg-secondary/60 transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5 text-foreground" strokeWidth={2} /> : <Menu className="h-5 w-5 text-foreground" strokeWidth={2} />}
            </button>
          </div>
        </div>

        {/* Navigation links - desktop */}
        <div className="hidden md:flex items-center justify-center gap-1 pb-2 -mt-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                ((link as any).exact ? location.pathname === link.to : location.pathname.startsWith(link.to))
                  ? "gradient-primary text-primary-foreground shadow-soft"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border/50 glass px-4 pb-4 pt-2 space-y-1 animate-fade-in max-w-full overflow-x-hidden">
          <div className="mb-3">
            <GlobalSearch />
          </div>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                ((link as any).exact ? location.pathname === link.to : location.pathname.startsWith(link.to))
                  ? "gradient-primary text-primary-foreground"
                  : "text-foreground hover:bg-secondary"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
              <Button variant="ghost" size="sm" asChild className="flex-1 min-w-0 rounded-full text-xs">
                <Link to="/chat" onClick={() => setMobileOpen(false)}>Messages</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="flex-1 min-w-0 rounded-full text-xs">
                <Link to="/dashboard" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { signOut(); setMobileOpen(false); }} className="flex-1 min-w-0 rounded-full text-xs">
                Sign Out
              </Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
