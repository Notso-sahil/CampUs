import { Link } from "react-router-dom";
import logoImg from "@/assets/logo.png";
import { Github, Twitter, Instagram, Mail, ShieldCheck, Heart } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <img src={logoImg} alt="CampusHub" className="h-7 w-7 object-contain opacity-90" />
              <span className="font-display text-xl font-bold tracking-tight">
                Campus<span className="text-primary">Hub</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              The professional campus ecosystem where skill meets demand. Built for students, by students.
            </p>
            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary transition-colors border border-border/50">
                <Github className="h-4 w-4" />
              </a>
              <a href="#" className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary transition-colors border border-border/50">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-muted-foreground hover:text-primary transition-colors border border-border/50">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Links Columns */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">Marketplace</h4>
            <ul className="space-y-2">
              <li><Link to="/trade" className="text-sm text-muted-foreground hover:text-primary transition-colors">Trade Items</Link></li>
              <li><Link to="/hire-peer" className="text-sm text-muted-foreground hover:text-primary transition-colors">Hire a Peer</Link></li>
              <li><Link to="/knowledge" className="text-sm text-muted-foreground hover:text-primary transition-colors">Knowledge Hub</Link></li>
              <li><Link to="/sell" className="text-sm text-muted-foreground hover:text-primary transition-colors">Start Selling</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">Resources</h4>
            <ul className="space-y-2">
              <li><Link to="/events" className="text-sm text-muted-foreground hover:text-primary transition-colors">Campus Events</Link></li>
              <li><Link to="/find-teammates" className="text-sm text-muted-foreground hover:text-primary transition-colors">Find Teammates</Link></li>
              <li><Link to="/recover" className="text-sm text-muted-foreground hover:text-primary transition-colors">Recover Items</Link></li>
              <li><Link to="/feedback" className="text-sm text-muted-foreground hover:text-primary transition-colors">Support Center</Link></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-foreground">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <span>support@campushub.edu</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <ShieldCheck className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                <span>Verified student-only network (VIPS Hub)</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
            Made with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> for VIPS Students.
          </p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="text-[11px] text-muted-foreground hover:text-foreground transition-colors font-medium">Privacy Policy</Link>
            <Link to="/terms" className="text-[11px] text-muted-foreground hover:text-foreground transition-colors font-medium">Terms of Service</Link>
            <span className="text-[11px] text-muted-foreground/40 font-bold tracking-tight">© {currentYear} CAMPUSHUB</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
