import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";

export default function Privacy() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border">
        <div className="container py-4">
          <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container py-12 max-w-3xl">
        <h1 className="text-3xl font-bold text-foreground mb-8">Privacy Policy</h1>
        
        <div className="prose prose-neutral max-w-none space-y-6">
          <p className="text-muted-foreground leading-relaxed">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Our Commitment to Privacy</h2>
            <p className="text-muted-foreground leading-relaxed">
              At ContractRedFlag, we take your privacy seriously. This policy explains how we handle 
              information when you use our contract analysis service. <strong className="text-foreground">In short: we don't store 
              your data.</strong>
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">No Data Storage</h2>
            <p className="text-muted-foreground leading-relaxed">
              We do not store any contract text that you submit for analysis. When you paste a contract 
              into our tool, it is processed in real-time and immediately discarded after the analysis 
              is complete. We do not maintain any database of user-submitted contracts.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">No Contracts Saved</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your contract content is never saved to our servers, databases, or any persistent storage. 
              The text you submit is sent directly to our AI processing service, analyzed, and the 
              results are returned to you. Once you close your browser or navigate away, the contract 
              text is gone.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">No Personal Information Collected</h2>
            <p className="text-muted-foreground leading-relaxed">
              We do not require you to create an account, provide your name, email address, or any 
              other personal information to use our basic service. For payment processing, Stripe 
              handles all payment information directly—we never see or store your credit card details.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Third-Party Services</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use the following third-party services:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li><strong className="text-foreground">OpenAI:</strong> For AI-powered contract analysis. Contract text is processed according to OpenAI's privacy policy.</li>
              <li><strong className="text-foreground">Stripe:</strong> For secure payment processing. Payment information is handled according to Stripe's privacy policy.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may use essential cookies to maintain session state during your visit. These cookies 
              are temporary and do not track you across websites or collect personal information.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about this privacy policy, please contact us through our website.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
