import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FadeIn from "@/components/FadeIn";

export default function TermsConditions() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-12 max-w-3xl">
        <FadeIn>
          <h1 className="font-display text-3xl font-bold mb-8">Terms & Conditions</h1>

          <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground">
            <p className="text-foreground font-medium">Last updated: March 1, 2026</p>

            <section className="space-y-3">
              <h2 className="font-display text-xl font-semibold text-foreground">1. User Conduct</h2>
              <p>Users are responsible for the accuracy of their listings in the Trade and Recover sections. Misrepresentation of items, including condition, pricing, or descriptions, may result in account suspension.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-xl font-semibold text-foreground">2. Prohibited Items</h2>
              <p>No illegal, restricted, or hazardous items may be traded on CampUs. This includes but is not limited to: controlled substances, weapons, counterfeit goods, and stolen property.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-xl font-semibold text-foreground">3. Team Interactions</h2>
              <p>CampUs is not responsible for disputes within teams formed in the "Find Teammates" section. Team leaders are responsible for managing their team members and communications.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-xl font-semibold text-foreground">4. Account Responsibility</h2>
              <p>You are responsible for maintaining the confidentiality of your account credentials. Any activity conducted through your account is your responsibility.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-xl font-semibold text-foreground">5. Content Moderation</h2>
              <p>CampUs reserves the right to remove any content that violates these terms or is deemed inappropriate by our moderation team.</p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-xl font-semibold text-foreground">6. Limitation of Liability</h2>
              <p>CampUs serves as a platform connecting campus community members. We are not liable for the quality, safety, or legality of items traded, or the conduct of any user.</p>
            </section>
          </div>
        </FadeIn>
      </main>
      <Footer />
    </div>
  );
}
