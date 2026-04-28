import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Heart, Brain, Zap, Users } from "lucide-react";

export default function About() {
  const [, navigate] = useLocation();

  const values = [
    {
      icon: Heart,
      title: "Compassion",
      description: "We care deeply about your wellbeing and mental health.",
    },
    {
      icon: Brain,
      title: "Intelligence",
      description: "We use advanced AI to understand your patterns and needs.",
    },
    {
      icon: Zap,
      title: "Innovation",
      description: "We continuously improve to provide better support.",
    },
    {
      icon: Users,
      title: "Community",
      description: "We believe in supporting each other's wellness journey.",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-width mx-auto px-4 py-12">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-8">
          ← Back
        </Button>

        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-4">About Sentinel AI</h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            We're on a mission to help people recognize and address wellbeing challenges before they become crises.
          </p>
        </div>

        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Our Mission</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Sentinel AI exists to provide early detection and compassionate support for mental and behavioral health challenges. We believe that technology can be a force for good—quietly observing, gently intervening, and always respecting your privacy.
            </p>
            <p className="text-muted-foreground">
              Our vision is a world where AI serves as a personal guardian of wellbeing, noticing when something's off before you do, and reaching out with empathy and support.
            </p>
          </CardContent>
        </Card>

        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Icon className="w-6 h-6 text-blue-600" />
                      <CardTitle className="text-lg">{value.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <Card className="mb-12">
          <CardHeader>
            <CardTitle>How It Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Sentinel AI was founded by a team of mental health advocates, AI researchers, and healthcare professionals who recognized a critical gap in digital health: most apps wait for users to ask for help, but many people struggling don't reach out.
            </p>
            <p className="text-muted-foreground">
              We asked ourselves: What if technology could be ambient and proactive? What if an AI could notice the subtle signs of distress and reach out with compassion before things get worse?
            </p>
            <p className="text-muted-foreground">
              That question led to Sentinel AI—a platform designed to be the quiet guardian of your wellbeing.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-12">
          <CardHeader>
            <CardTitle>Our Team</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Our team brings together expertise from mental health, AI, healthcare technology, and product design. We're united by a shared belief that technology should serve humanity, especially in moments of vulnerability.
            </p>
            <p className="text-muted-foreground">
              We're committed to building with integrity, transparency, and a deep respect for your privacy and autonomy.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Get in Touch</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Have questions, feedback, or want to learn more about Sentinel AI?
            </p>
            <div className="space-y-2 text-sm">
              <p>
                <strong>Email:</strong> hello@sentinel-ai.com
              </p>
              <p>
                <strong>Support:</strong> support@sentinel-ai.com
              </p>
              <p>
                <strong>Partnerships:</strong> partnerships@sentinel-ai.com
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
