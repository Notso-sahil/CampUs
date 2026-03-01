import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <FadeIn>
          <h1 className="font-display text-3xl font-bold mb-8">Privacy Policy</h1>

          <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
            <p className="text-foreground font-medium">Last updated: March 1, 2026</p>

            <section className="space-y-3">
              <h2 className="font-display text-xl font-semibold text-foreground">1. Data Collection</h2>
              <p>We collect your name, college affiliation, and contact details for the sole purpose of marketplace and teammate functionality. We do not sell or share your personal data with third parties.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-xl font-semibold text-foreground">2. Data Privacy</h2>
              <p>Your contact information is hidden from unauthenticated users and is only shared with verified buyers or team members through secure, authenticated channels. All data is stored using industry-standard encryption via Supabase.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-xl font-semibold text-foreground">3. User Control</h2>
              <p>You have the right to edit or delete your data at any time through your profile settings. You may request complete account deletion by contacting our support team.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-xl font-semibold text-foreground">4. Cookies & Analytics</h2>
              <p>CampusHub uses essential cookies for authentication and session management. We do not use third-party tracking cookies.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-xl font-semibold text-foreground">5. Data Security</h2>
              <p>We implement Row Level Security (RLS) policies on all database tables, ensuring users can only access data they are authorized to view. All communications are encrypted via HTTPS.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-xl font-semibold text-foreground">6. Contact</h2>
              <p>For privacy-related inquiries, please use the Feedback form on our website or contact us at privacy@campushub.app.</p>
            </section>
          </div>
        </FadeIn>
      </main>
      <Footer />
    </div>
  );
}
