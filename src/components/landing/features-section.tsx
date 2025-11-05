import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Shield, BarChart3, Smartphone, Zap, Users } from "lucide-react";

const features = [
  {
    icon: TrendingUp,
    title: "Expense Tracking",
    description: "Categorize and monitor your spending with smart insights and automated categorization.",
    badge: "Popular"
  },
  {
    icon: BarChart3,
    title: "Financial Analytics",
    description: "Visualize your financial health with beautiful charts and detailed reports.",
    badge: "New"
  },
  {
    icon: Shield,
    title: "Bank-Level Security",
    description: "Your data is protected with enterprise-grade encryption and security measures.",
    badge: null
  },
  {
    icon: Smartphone,
    title: "Mobile First",
    description: "Access your finances anywhere with our responsive mobile and web applications.",
    badge: null
  },
  {
    icon: Zap,
    title: "Real-time Sync",
    description: "Sync your transactions instantly across all your devices and accounts.",
    badge: null
  },
  {
    icon: Users,
    title: "Multi-User Support",
    description: "Share budgets and track expenses with family members or business partners.",
    badge: null
  }
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 px-4 py-2">
            Features
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Everything you need to manage your money
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful tools designed to give you complete control over your financial life.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="relative group hover:shadow-lg transition-all duration-300 border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  {feature.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {feature.badge}
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-8 px-8 py-4 bg-card/50 backdrop-blur-sm rounded-full border">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">10K+</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div className="w-px h-8 bg-border"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">$2M+</div>
              <div className="text-sm text-muted-foreground">Tracked</div>
            </div>
            <div className="w-px h-8 bg-border"></div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}