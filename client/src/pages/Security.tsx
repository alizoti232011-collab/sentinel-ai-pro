import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Shield, Lock, Eye, Server, CheckCircle } from "lucide-react";

export default function Security() {
  const [, navigate] = useLocation();

  const securityFeatures = [
    {
      icon: Lock,
      title: "End-to-End Encryption",
      description: "All data transmitted using TLS 1.3 encryption. Your data is encrypted in transit and at rest.",
    },
    {
      icon: Shield,
      title: "Authentication & Authorization",
      description: "OAuth 2.0 authentication with secure session management. Role-based access control.",
    },
    {
      icon: Eye,
      title: "Data Privacy",
      description: "We never sell your data. GDPR compliant. You control what data is shared.",
    },
    {
      icon: Server,
      title: "Secure Infrastructure",
      description: "Enterprise-grade hosting with DDoS protection, firewalls, and intrusion detection.",
    },
    {
      icon: CheckCircle,
      title: "Regular Audits",
      description: "Third-party security audits quarterly. Penetration testing and vulnerability assessments.",
    },
    {
      icon: Shield,
      title: "Compliance",
      description: "GDPR, HIPAA-aligned, SOC 2 Type II compliant. Regular compliance certifications.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-width mx-auto px-4 py-12">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-8">
          ← Back
        </Button>

        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">Security & Data Protection</h1>
          <p className="text-xl text-muted-foreground">
            Your privacy and security are our top priorities. Learn how we protect your data.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {securityFeatures.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <Icon className="w-6 h-6 text-blue-600" />
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Data Protection Standards</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Encryption</h3>
              <p className="text-sm text-muted-foreground">
                We use AES-256 encryption for data at rest and TLS 1.3 for data in transit. All sensitive data is encrypted with industry-standard algorithms.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Authentication</h3>
              <p className="text-sm text-muted-foreground">
                Multi-factor authentication available. OAuth 2.0 integration with secure token management. Session timeouts for inactive accounts.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Access Control</h3>
              <p className="text-sm text-muted-foreground">
                Role-based access control (RBAC). Principle of least privilege. Admin access logged and monitored.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Monitoring</h3>
              <p className="text-sm text-muted-foreground">
                24/7 security monitoring. Real-time threat detection. Automated incident response. Regular log audits.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Compliance Certifications</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>GDPR Compliant - EU data protection regulations</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>HIPAA-Aligned - Healthcare data protection standards</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>SOC 2 Type II - Security and availability controls</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>ISO 27001 - Information security management</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Report a Security Issue</CardTitle>
            <CardDescription>
              Found a security vulnerability? Please report it responsibly.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Email: security@sentinel-ai.com
            </p>
            <p className="text-sm text-muted-foreground">
              We take security seriously and will respond to all reports within 48 hours.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
