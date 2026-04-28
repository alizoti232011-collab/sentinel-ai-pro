import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Privacy() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-width mx-auto px-4 py-12">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-8">
          ← Back
        </Button>

        <article className="prose prose-sm max-w-none">
          <h1>Privacy Policy</h1>
          <p className="text-muted-foreground">Last updated: April 28, 2026</p>

          <h2>1. Introduction</h2>
          <p>
            Sentinel AI ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
          </p>

          <h2>2. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as:</p>
          <ul>
            <li>Account information (name, email, password)</li>
            <li>Health and behavioral data (sleep, mood, activity, screen time)</li>
            <li>Device information (device type, operating system)</li>
            <li>Usage analytics (pages visited, features used, time spent)</li>
          </ul>

          <h2>3. How We Use Your Information</h2>
          <p>We use collected information for:</p>
          <ul>
            <li>Providing and improving our services</li>
            <li>Personalizing your experience</li>
            <li>Detecting health patterns and generating interventions</li>
            <li>Communicating with you about updates and support</li>
            <li>Complying with legal obligations</li>
          </ul>

          <h2>4. Data Security</h2>
          <p>
            We implement industry-standard security measures including encryption (TLS/SSL), secure authentication, and regular security audits. However, no method of transmission over the internet is 100% secure.
          </p>

          <h2>5. Data Retention</h2>
          <p>
            We retain your personal data for as long as necessary to provide our services. You can request deletion of your account and associated data at any time.
          </p>

          <h2>6. Third-Party Sharing</h2>
          <p>
            We do not sell your personal data. We may share information with:
          </p>
          <ul>
            <li>Service providers who assist in operations (hosting, analytics)</li>
            <li>Legal authorities when required by law</li>
            <li>Your healthcare provider if you explicitly authorize sharing</li>
          </ul>

          <h2>7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of communications</li>
            <li>Data portability (receive your data in portable format)</li>
          </ul>

          <h2>8. GDPR Compliance</h2>
          <p>
            For users in the European Union, we comply with the General Data Protection Regulation (GDPR). You have additional rights including the right to lodge a complaint with your local data protection authority.
          </p>

          <h2>9. Children's Privacy</h2>
          <p>
            Our services are not directed to children under 13. We do not knowingly collect information from children under 13.
          </p>

          <h2>10. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy periodically. We will notify you of significant changes via email or prominent notice on our website.
          </p>

          <h2>11. Contact Us</h2>
          <p>
            For privacy concerns or requests, contact us at: <br />
            <strong>Email:</strong> privacy@sentinel-ai.com <br />
            <strong>Address:</strong> Sentinel AI, Privacy Team, Global
          </p>
        </article>
      </div>
    </div>
  );
}
