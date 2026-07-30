import { Link } from "react-router-dom";
import logoImg from "@/assets/logo.png";
import { Github, Twitter, Instagram, Mail } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border">
      {/* Full footer — desktop only */}
      <div className="hidden md:block container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1 space-y-3">
            <Link to="/" className="flex items-center gap-2">
              <img src={logoImg} alt="CampUs" className="h-6 w-6 object-contain" />
              <span className="text-base font-semibold">CampUs</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Built for VIPS students. Trade, connect, learn.
            </p>
            <div className="flex items-center gap-2 pt-1">
              {[Github, Twitter, Instagram].map((Icon, i) => (
                <a key={i} href="#" className="text-muted-foreground hover:text-foreground transition-colors p-1.5">
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Platform</h4>
            <ul className="space-y-2">
              <li><Link to="/trade" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Trade</Link></li>
              <li><Link to="/hire-peer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Peer Services</Link></li>
              <li><Link to="/knowledge" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Notes</Link></li>
              <li><Link to="/sell" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Sell</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Community</h4>
            <ul className="space-y-2">
              <li><Link to="/events" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Events</Link></li>
              <li><Link to="/find-teammates" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Teams</Link></li>
              <li><Link to="/recover" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Lost & Found</Link></li>
              <li><Link to="/feedback" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Feedback</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Contact</h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-3.5 w-3.5 flex-shrink-0" />
              <span>campus91.official@gmail.com</span>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {currentYear} CampUs</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
          </div>
        </div>
      </div>

      {/* Minimal footer — mobile only */}
      <div className="md:hidden px-4 py-3 flex items-center justify-between text-xs text-muted-foreground">
        <p>© {currentYear} CampUs</p>
        <div className="flex items-center gap-3">
          <Link to="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
          <Link to="/terms" className="hover:text-foreground transition-colors">Terms</Link>
        </div>
      </div>
    </footer>
  );
}
