import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { MessageCircle, LogOut, User, Menu, X, MapPin } from "lucide-react";
import logoImg from "@/assets/logo.png";
import { Button } from "@/components/ui/button";
import GlobalSearch from "@/components/GlobalSearch";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";

const NAV_LINKS = [
  { to: "/",              label: "Home",           exact: true },
  { to: "/trade",         label: "Trade"                       },
  { to: "/events",        label: "Events"                      },
  { to: "/recover",       label: "Recover"                     },
  { to: "/knowledge",     label: "Knowledge Hub"               },
  { to: "/expeditions",   label: "Expeditions"                 },
  { to: "/find-teammates",label: "Find Teammates"              },
  { to: "/hire-peer",     label: "Hire a Peer"                 },
];

export default function Navbar() {
  const { user, signOut } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread message count for badge
  useEffect(() => {
    if (!user) { setUnreadCount(0); return; }
    const fetchUnread = async () => {
      try {
        const convs = await api.get(`/api/conversations?user_id=${user.id}`);
        const arr = Array.isArray(convs) ? convs : Array.isArray((convs as any)?.data) ? (convs as any).data : [];
        const total = arr.reduce((sum: number, c: any) => sum + (c.unread_count || 0), 0);
        setUnreadCount(total);
      } catch { /* silent */ }
    };
    fetchUnread();
    const interval = setInterval(fetchUnread, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [user]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isActive = (link: { to: string; exact?: boolean }) =>
    link.exact
      ? location.pathname === link.to
      : location.pathname.startsWith(link.to);

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
            {/* Location chip */}
            <div className="flex items-center gap-1.5 h-9 px-3 rounded-full bg-secondary/50 text-xs font-medium text-foreground max-w-[120px] truncate">
              <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              <span className="truncate">VIPS</span>
            </div>

            {user ? (
              <>
                {/* Messages icon with unread badge */}
                <div className="relative hidden sm:block">
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="rounded-full hover:bg-secondary/60"
                  >
                    <Link to="/chat">
                      <MessageCircle className="h-5 w-5 text-foreground" strokeWidth={2} />
                    </Link>
                  </Button>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center px-1 pointer-events-none shadow">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>

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
              aria-expanded={mobileOpen}
            >
              {mobileOpen
                ? <X className="h-5 w-5 text-foreground" strokeWidth={2} />
                : <Menu className="h-5 w-5 text-foreground" strokeWidth={2} />}
            </button>
          </div>
        </div>

        {/* Navigation links - desktop */}
        <div className="hidden md:flex items-center justify-center gap-1 pb-2 -mt-1 flex-wrap">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                isActive(link)
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
        <div className="md:hidden border-t border-border/50 glass px-4 pb-6 pt-3 space-y-1 animate-fade-in max-w-full overflow-x-hidden">
          {/* Search */}
          <div className="mb-4">
            <GlobalSearch />
          </div>

          {/* Nav links */}
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                isActive(link)
                  ? "gradient-primary text-primary-foreground"
                  : "text-foreground hover:bg-secondary"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* User actions */}
          {user ? (
            <div className="flex flex-col gap-2 pt-3 mt-3 border-t border-border">
              <div className="relative">
                <Button variant="ghost" size="sm" asChild className="w-full justify-start rounded-xl gap-2">
                  <Link to="/chat" onClick={() => setMobileOpen(false)}>
                    <MessageCircle className="h-4 w-4" />
                    Messages
                    {unreadCount > 0 && (
                      <span className="ml-auto min-w-[20px] h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center px-1">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Link>
                </Button>
              </div>
              <Button variant="ghost" size="sm" asChild className="w-full justify-start rounded-xl gap-2">
                <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
                  <User className="h-4 w-4" /> Dashboard
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { signOut(); setMobileOpen(false); }}
                className="w-full justify-start rounded-xl gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            </div>
          ) : (
            <div className="pt-3 mt-3 border-t border-border">
              <Button asChild className="w-full gradient-primary text-primary-foreground rounded-xl font-bold">
                <Link to="/auth" onClick={() => setMobileOpen(false)}>Sign In</Link>
              </Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
