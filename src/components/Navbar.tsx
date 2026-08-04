import { Link, useLocation } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import { MessageCircle, LogOut, User, MapPin, ChevronDown } from "lucide-react";
import logoImg from "@/assets/logo.png";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import GlobalSearch from "@/components/GlobalSearch";
import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useCollege } from "@/contexts/CollegeContext";

const NAV_LINKS = [
  { to: "/",              label: "Home",           exact: true },
  { to: "/trade",         label: "Trade"                       },
  { to: "/events",        label: "Events"                      },
  { to: "/recover",       label: "Lost & Found"                },
  { to: "/knowledge",     label: "Notes"                       },
  { to: "/featured",      label: "Featured"                    },
  { to: "/find-teammates",label: "Teams"                       },
  { to: "/find-roommate", label: "Roommate"                    },
  { to: "/service",       label: "Services"                    },
];

export default function Navbar() {
  const { user, signOut } = useAuthContext();
  const { browseCollege, colleges, setBrowseCollege } = useCollege();
  const location = useLocation();
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

  const isActive = (link: { to: string; exact?: boolean }) =>
    link.exact
      ? location.pathname === link.to
      : location.pathname.startsWith(link.to);

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 max-w-full">
        {/* Top row */}
        <div className="flex h-14 items-center justify-between gap-3">
          <Link to="/" className="flex-shrink-0 flex items-center gap-2">
            <img src={logoImg} alt="CampUs" className="h-8 w-auto object-contain" />
          </Link>

          <GlobalSearch className="hidden md:flex flex-1 max-w-sm mx-4" />

          <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
            {/* Location chip / College Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 h-8 px-2.5 rounded-md bg-secondary text-xs font-medium text-muted-foreground hover:bg-secondary/80 transition-colors">
                  <MapPin className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate max-w-[80px]">{browseCollege || "Select"}</span>
                  <ChevronDown className="h-3 w-3 opacity-50" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {colleges.length === 0 ? (
                  <div className="p-2 text-xs text-center text-muted-foreground">
                    Loading...
                  </div>
                ) : (
                  colleges.map((c) => (
                    <DropdownMenuItem
                      key={c.id}
                      onClick={() => setBrowseCollege(c.name)}
                      className="text-sm cursor-pointer"
                    >
                      {c.name}
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {user ? (
              <>
                {/* Messages icon with unread badge */}
                <div className="relative hidden sm:block">
                  <Button
                    variant="ghost"
                    size="icon"
                    asChild
                    className="h-9 w-9 rounded-md"
                  >
                    <Link to="/chat">
                      <MessageCircle className="h-4.5 w-4.5" />
                    </Link>
                  </Button>
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] rounded-full bg-red-500 text-white text-[9px] font-medium flex items-center justify-center px-1 pointer-events-none">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>

                <Button variant="ghost" size="icon" asChild className="hidden sm:inline-flex h-9 w-9 rounded-md">
                  <Link to="/dashboard"><User className="h-4.5 w-4.5" /></Link>
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="hidden sm:inline-flex h-9 w-9 rounded-md">
                      <LogOut className="h-4.5 w-4.5" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="w-[90vw] max-w-[400px] rounded-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Do you want to logout?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>No</AlertDialogCancel>
                      <AlertDialogAction onClick={signOut}>Yes</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            ) : (
              <Button asChild size="sm" className="h-8 px-3 bg-primary text-primary-foreground rounded-md text-xs font-medium hover:bg-primary/90 transition-colors">
                <Link to="/auth">Sign in</Link>
              </Button>
            )}
          </div>
        </div>

        {/* Navigation links - desktop */}
        <div className="hidden md:flex items-center gap-0.5 pb-2 -mt-0.5 overflow-x-auto scrollbar-none">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors whitespace-nowrap ${
                isActive(link)
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

    </nav>
  );
}
