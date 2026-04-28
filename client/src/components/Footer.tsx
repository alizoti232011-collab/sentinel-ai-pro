import { Link } from "wouter";
import { Heart, Brain } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-background border-t border-border">
      <div className="max-width mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-6 h-6 text-blue-600" />
              <span className="font-bold text-lg">Sentinel AI</span>
            </div>
            <p className="text-sm text-muted-foreground">
              The AI that notices before you do. Proactive wellbeing support.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-foreground">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/security" className="text-muted-foreground hover:text-foreground">
                  Security
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:support@sentinel-ai.com" className="text-muted-foreground hover:text-foreground">
                  Email Support
                </a>
              </li>
              <li>
                <a href="mailto:privacy@sentinel-ai.com" className="text-muted-foreground hover:text-foreground">
                  Privacy Inquiries
                </a>
              </li>
              <li>
                <a href="mailto:security@sentinel-ai.com" className="text-muted-foreground hover:text-foreground">
                  Security Report
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {currentYear} Sentinel AI. All rights reserved. Made with{" "}
              <Heart className="w-4 h-4 inline text-red-500" /> for your wellbeing.
            </p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="text-muted-foreground hover:text-foreground text-sm">
                Twitter
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground text-sm">
                LinkedIn
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground text-sm">
                GitHub
              </a>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 p-4 bg-muted rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong>Medical Disclaimer:</strong> Sentinel AI is not a medical device or service. Information provided is for informational purposes only and should not be considered medical advice. Always consult with a qualified healthcare provider for medical concerns.
          </p>
        </div>
      </div>
    </footer>
  );
}
