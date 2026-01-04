import { Link } from "wouter";
import { AlertTriangle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="container py-8">
        {/* Disclaimer */}
        <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg border border-border mb-6">
          <AlertTriangle className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-sm text-muted-foreground">
            <strong>Disclaimer:</strong> ContractRedFlag does not provide legal advice. 
            This tool highlights potential risks for informational purposes only. 
            Always consult a qualified attorney for legal matters.
          </p>
        </div>

        {/* Footer Links */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-foreground">Contract</span>
            <span className="text-lg font-semibold text-primary">RedFlag</span>
          </div>
          
          <nav className="flex items-center gap-6">
            <Link 
              href="/terms" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms of Service
            </Link>
            <Link 
              href="/privacy" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy Policy
            </Link>
          </nav>
          
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} ContractRedFlag. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
