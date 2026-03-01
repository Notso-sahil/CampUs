import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-border bg-foreground text-background">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <span className="font-display text-lg font-bold">CampusHub</span>
            <p className="text-sm opacity-60 mt-2">Built for students, by students.</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold opacity-80">Legal</h4>
            <Link to="/privacy" className="block text-sm opacity-60 hover:opacity-100 transition-opacity">Privacy Policy</Link>
            <Link to="/terms" className="block text-sm opacity-60 hover:opacity-100 transition-opacity">Terms & Conditions</Link>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold opacity-80">Support</h4>
            <Link to="/feedback" className="block text-sm opacity-60 hover:opacity-100 transition-opacity">Send Feedback</Link>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-background/10 text-center">
          <p className="text-sm opacity-60">© 2026 CampusHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
