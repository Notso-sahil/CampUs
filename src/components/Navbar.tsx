import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCollege } from "@/contexts/CollegeContext";
import { COLLEGES } from "@/lib/colleges";
import { Search, MessageCircle, LogOut, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

const NAV_LINKS = [
  { to: "/trade", label: "Trade" },
  { to: "/events", label: "Events" },
  { to: "/recover", label: "Recover" },
  { to: "/knowledge", label: "Knowledge Hub" },
  { to: "/expeditions", label: "Expeditions" },
];

export default function Navbar() {
  const { user, signOut } = useAuthContext();
  const { selectedCollege, setSelectedCollege } = useCollege();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/trade?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4">
        {/* Top row */}
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex-shrink-0">
            <span className="font-display text-xl font-bold tracking-tight">
              CampusHub
            </span>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-secondary border-0 focus-visible:ring-1"
              />
            </div>
          </form>

          <div className="flex items-center gap-2">
            <Select value={selectedCollege} onValueChange={setSelectedCollege}>
              <SelectTrigger className="w-[130px] h-9 text-xs bg-secondary border-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COLLEGES.map((c) => (
                  <SelectItem key={c} value={c} className="text-xs">
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {user ? (
              <>
                <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex">
                  <Link to="/chat"><MessageCircle className="h-5 w-5" /></Link>
                </Button>
                <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex">
                  <Link to="/dashboard"><User className="h-5 w-5" /></Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={signOut} className="hidden sm:inline-flex">
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <Button asChild variant="default" size="sm">
                <Link to="/auth">Sign In</Link>
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Navigation links - desktop */}
        <div className="hidden md:flex items-center gap-1 pb-2 -mt-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                location.pathname.startsWith(link.to)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-background px-4 pb-4 pt-2 space-y-2 animate-fade-in">
          <form onSubmit={handleSearch} className="mb-3">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-secondary border-0"
              />
            </div>
          </form>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                location.pathname.startsWith(link.to)
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-secondary"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <div className="flex gap-2 pt-2 border-t border-border">
              <Button variant="ghost" size="sm" asChild className="flex-1">
                <Link to="/chat" onClick={() => setMobileOpen(false)}>Messages</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="flex-1">
                <Link to="/dashboard" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { signOut(); setMobileOpen(false); }} className="flex-1">
                Sign Out
              </Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
