import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { Home, ShoppingBag, Briefcase, MessageCircle, Menu, User, BookOpen, CalendarDays, Search, Map, Users, LogOut } from "lucide-react";
import React, { useState, useEffect } from "react";
import { api } from "@/lib/api";

export default function BottomNav() {
  const { user, signOut } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  // Fetch unread messages
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
    const interval = setInterval(fetchUnread, 30000);
    return () => clearInterval(interval);
  }, [user]);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(`${path}/`);
  const isHome = location.pathname === "/";

  // If menu is open, we show an overlay
  return (
    <>
      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur-sm animate-fade-in flex flex-col justify-end">
          <div className="bg-card border-t border-border p-4 rounded-t-3xl max-h-[80vh] overflow-y-auto pb-24 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold">More Options</h2>
              <button onClick={() => setMenuOpen(false)} className="p-2 rounded-full bg-secondary text-muted-foreground hover:text-foreground">
                <Menu className="h-5 w-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-4 gap-4 mb-6">
              <MenuLink to="/events" icon={<CalendarDays />} label="Events" />
              <MenuLink to="/recover" icon={<Search />} label="Recover" />
              <MenuLink to="/knowledge" icon={<BookOpen />} label="Notes" />
              <MenuLink to="/expeditions" icon={<Map />} label="Trips" />
              <MenuLink to="/find-teammates" icon={<Users />} label="Teams" />
              <MenuLink to="/find-roommate" icon={<Home />} label="Roommates" />
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              {user ? (
                <>
                  <Link to="/dashboard" className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary transition-colors font-medium">
                    <User className="h-5 w-5 text-muted-foreground" /> Dashboard
                  </Link>
                  <button onClick={() => { signOut(); setMenuOpen(false); }} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-destructive/10 text-destructive transition-colors font-medium">
                    <LogOut className="h-5 w-5" /> Sign Out
                  </button>
                </>
              ) : (
                <button onClick={() => { navigate("/auth"); setMenuOpen(false); }} className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors">
                  <User className="h-5 w-5" /> Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-lg border-t border-border pb-safe">
        <div className="flex items-center justify-around h-16 px-2">
          <NavItem to="/" icon={<Home />} label="Home" active={isHome} />
          <NavItem to="/trade" icon={<ShoppingBag />} label="Trade" active={!isHome && isActive("/trade")} />
          <NavItem to="/hire-peer" icon={<Briefcase />} label="Services" active={!isHome && isActive("/hire-peer")} />
          
          <Link to={user ? "/chat" : "/auth"} className="relative flex flex-col items-center justify-center w-full h-full space-y-1 text-muted-foreground hover:text-foreground transition-colors tap-target">
            <div className={`p-1.5 rounded-full transition-colors ${!isHome && isActive("/chat") ? "bg-primary/10 text-primary" : ""}`}>
              <MessageCircle className="h-5 w-5" strokeWidth={!isHome && isActive("/chat") ? 2.5 : 2} />
              {unreadCount > 0 && (
                <span className="absolute top-2 right-[25%] min-w-[16px] h-[16px] rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center px-1 border-2 border-background">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </div>
            <span className={`text-[10px] font-medium ${!isHome && isActive("/chat") ? "text-primary" : ""}`}>Chat</span>
          </Link>

          <button onClick={() => setMenuOpen(!menuOpen)} className="flex flex-col items-center justify-center w-full h-full space-y-1 text-muted-foreground hover:text-foreground transition-colors tap-target">
            <div className={`p-1.5 rounded-full transition-colors ${menuOpen ? "bg-secondary text-foreground" : ""}`}>
              <Menu className="h-5 w-5" strokeWidth={menuOpen ? 2.5 : 2} />
            </div>
            <span className={`text-[10px] font-medium ${menuOpen ? "text-foreground" : ""}`}>Menu</span>
          </button>
        </div>
      </div>
    </>
  );
}

function NavItem({ to, icon, label, active }: { to: string, icon: React.ReactNode, label: string, active: boolean }) {
  return (
    <Link to={to} className="flex flex-col items-center justify-center w-full h-full space-y-1 text-muted-foreground hover:text-foreground transition-colors tap-target">
      <div className={`p-1.5 rounded-full transition-colors ${active ? "bg-primary/10 text-primary" : ""}`}>
        {React.cloneElement(icon as React.ReactElement, {
          className: "h-5 w-5",
          strokeWidth: active ? 2.5 : 2
        })}
      </div>
      <span className={`text-[10px] font-medium ${active ? "text-primary" : ""}`}>{label}</span>
    </Link>
  );
}

function MenuLink({ to, icon, label }: { to: string, icon: React.ReactNode, label: string }) {
  return (
    <Link to={to} className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors">
      <div className="text-primary">{React.cloneElement(icon as React.ReactElement, { className: "h-6 w-6" })}</div>
      <span className="text-[11px] font-medium text-foreground text-center break-words-safe">{label}</span>
    </Link>
  );
}
