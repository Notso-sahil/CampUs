import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { ShieldAlert, LayoutDashboard, Users, ShoppingCart, Star, Calendar, BookOpen, School, LogOut, ArrowLeft, Inbox } from "lucide-react";
import FadeIn from "@/components/FadeIn";
import { Button } from "@/components/ui/button";

const navItems = [
  { path: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { path: "/admin/requests", label: "Inbox & Requests", icon: Inbox },
  { path: "/admin/users", label: "Users", icon: Users },
  { path: "/admin/listings", label: "Listings", icon: ShoppingCart },
  { path: "/admin/services", label: "Peer Services", icon: Star },
  { path: "/admin/events", label: "Events", icon: Calendar },
  { path: "/admin/featured", label: "Featured", icon: Star },
  { path: "/admin/knowledge", label: "Knowledge Hub", icon: BookOpen },
  { path: "/admin/colleges", label: "Colleges", icon: School },
];

export default function AdminDashboard() {
  const { profile, loading } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (profile?.user_role !== "admin") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <ShieldAlert className="h-16 w-16 text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-muted-foreground mb-6">You must be an administrator to view this area.</p>
        <Button onClick={() => navigate("/")}>Return to Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card/50 flex flex-col hidden md:flex">
        <div className="p-6">
          <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
            <ShieldAlert className="h-6 w-6" /> Super Admin
          </h2>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to App
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-background/50">
        <FadeIn className="p-6 md:p-10 max-w-6xl mx-auto min-h-full">
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between mb-8 pb-4 border-b border-border">
            <h2 className="text-xl font-bold flex items-center gap-2 text-primary">
              <ShieldAlert className="h-6 w-6" /> Admin
            </h2>
            <Button variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
              Exit
            </Button>
          </div>
          
          <Outlet />
        </FadeIn>
      </main>
    </div>
  );
}
