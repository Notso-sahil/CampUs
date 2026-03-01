import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { useCollege } from "@/contexts/CollegeContext";
import { COLLEGES } from "@/lib/colleges";
import { Search as SearchIcon, MessageCircle, LogOut, User, Menu, X } from "lucide-react";
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
  { to: "/find-teammates", label: "Find Teammates" },
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
    <nav className="sticky top-0 z-50 border-b glass shadow-soft">
      <div className="container mx-auto px-4">
        {/* Top row */}
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex-shrink-0">
            <span className="font-display text-xl font-bold tracking-tight">
              Campus<span className="text-primary">Hub</span>
            </span>
          </Link>

          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md">
            <div className="relative w-full">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-secondary/50 border-0 focus-visible:ring-1 rounded-full"
              />
            </div>
          </form>

          <div className="flex items-center gap-2">
            <Select value={selectedCollege} onValueChange={setSelectedCollege}>
              <SelectTrigger className="w-[130px] h-9 text-xs bg-secondary/50 border-0 rounded-full">
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
                <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex rounded-full">
                  <Link to="/chat"><MessageCircle className="h-5 w-5" /></Link>
                </Button>
                <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex rounded-full">
                  <Link to="/dashboard"><User className="h-5 w-5" /></Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={signOut} className="hidden sm:inline-flex rounded-full">
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <Button asChild size="sm" className="gradient-primary text-primary-foreground rounded-full shadow-soft hover:shadow-glow transition-shadow">
                <Link to="/auth">Sign In</Link>
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-full"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Navigation links - desktop */}
        <div className="hidden md:flex items-center justify-center gap-1 pb-2 -mt-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
                location.pathname.startsWith(link.to)
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
        <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-xl px-4 pb-4 pt-2 space-y-2 animate-fade-in">
          <form onSubmit={handleSearch} className="mb-3">
            <div className="relative w-full">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-secondary/50 border-0 rounded-full"
              />
            </div>
          </form>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`block rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                location.pathname.startsWith(link.to)
                  ? "gradient-primary text-primary-foreground"
                  : "text-foreground hover:bg-secondary"
              }`}
            >
              {link.label}
            </Link>
          ))}
          {user && (
            <div className="flex gap-2 pt-2 border-t border-border">
              <Button variant="ghost" size="sm" asChild className="flex-1 rounded-full">
                <Link to="/chat" onClick={() => setMobileOpen(false)}>Messages</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild className="flex-1 rounded-full">
                <Link to="/dashboard" onClick={() => setMobileOpen(false)}>Dashboard</Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={() => { signOut(); setMobileOpen(false); }} className="flex-1 rounded-full">
                Sign Out
              </Button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
