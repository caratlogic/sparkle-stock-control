import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gem, Shield, TrendingUp, Users, Zap, CheckCircle, Star, ArrowRight, Diamond, Sparkles } from 'lucide-react';
import { useState } from 'react';

export const Landing = () => {
  const [hoveredPlan, setHoveredPlan] = useState<number | null>(null);

  const handleGetStarted = () => {
    // This will trigger the authentication flow
    window.location.reload();
  };

  const features = [
    {
      icon: <Gem className="w-8 h-8 text-primary" />,
      title: "Inventory Management",
      description: "Real-time tracking of your precious stones, diamonds, and jewelry inventory with detailed specifications."
    },
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: "Secure & Compliant",
      description: "Bank-grade security with KYC compliance and audit trails for complete peace of mind."
    },
    {
      icon: <TrendingUp className="w-8 h-8 text-primary" />,
      title: "Analytics & Reports",
      description: "Comprehensive insights into your business performance with customizable dashboards and reports."
    },
    {
      icon: <Users className="w-8 h-8 text-primary" />,
      title: "Client Management",
      description: "Streamlined customer and supplier management with integrated communication tools."
    },
    {
      icon: <Zap className="w-8 h-8 text-primary" />,
      title: "API Integration",
      description: "Seamless integration with existing systems and third-party platforms for enhanced workflow."
    },
    {
      icon: <Diamond className="w-8 h-8 text-primary" />,
      title: "Parcel Tracking",
      description: "Advanced parcel management with consignment tracking and automated notifications."
    }
  ];

  const plans = [
    {
      name: "Starter",
      price: "$99",
      period: "/month",
      description: "Perfect for small businesses",
      features: [
        "Up to 1,000 inventory items",
        "Basic reporting",
        "Email support",
        "Mobile app access",
        "Standard security"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "$249",
      period: "/month",
      description: "Ideal for growing businesses",
      features: [
        "Up to 10,000 inventory items",
        "Advanced analytics",
        "Priority support",
        "API access",
        "Custom integrations",
        "Enhanced security"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large-scale operations",
      features: [
        "Unlimited inventory items",
        "White-label solution",
        "Dedicated support",
        "Custom development",
        "Multi-location support",
        "Enterprise security"
      ],
      popular: false
    }
  ];

  const testimonials = [
    {
      name: "Sarah Mitchell",
      role: "Diamond Dealer",
      company: "Premier Gems Ltd",
      content: "CaratLogic transformed our inventory management. We've reduced processing time by 60% and increased accuracy significantly.",
      rating: 5
    },
    {
      name: "David Chen",
      role: "Operations Manager",
      company: "Luxury Jewelry Co",
      content: "The analytics and reporting features have given us insights we never had before. Highly recommended for any jewelry business.",
      rating: 5
    },
    {
      name: "Maria Rodriguez",
      role: "Gem Trader",
      company: "Global Gem Trading",
      content: "Professional, reliable, and easy to use. The customer support is outstanding and the security features give us complete confidence.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border sticky top-0 z-50 carat-shadow">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 carat-gradient rounded-xl flex items-center justify-center shadow-lg">
                <Gem className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold carat-heading">CaratLogic</h1>
                <p className="text-xs text-muted-foreground font-medium">Professional IT Solutions</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" className="hidden md:inline-flex">Features</Button>
              <Button variant="ghost" className="hidden md:inline-flex">Pricing</Button>
              <Button variant="outline" onClick={handleGetStarted}>Sign In</Button>
              <Button onClick={handleGetStarted} className="carat-gradient">
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 carat-gradient-secondary opacity-50"></div>
        <div className="absolute top-20 right-20 opacity-10">
          <Sparkles className="w-32 h-32 text-primary" />
        </div>
        <div className="absolute bottom-20 left-20 opacity-10">
          <Diamond className="w-24 h-24 text-primary" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
              Trusted by 500+ Gem & Diamond Professionals
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 carat-heading">
              Modern Inventory Control for 
              <span className="block carat-gradient bg-clip-text text-transparent">
                Gems & Diamond Professionals
              </span>
            </h1>
            <p className="text-xl lg:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              Powered by CaratLogic – A smarter way to manage your stock, clients, and growth with enterprise-grade security and analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 carat-gradient carat-shadow"
                onClick={handleGetStarted}
              >
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="text-lg px-8 py-6 border-primary/20 hover:bg-primary/5"
              >
                Schedule a Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 carat-heading">
              Complete Digital Transformation
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to modernize your gem and diamond business operations
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="carat-card border-0 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="w-16 h-16 carat-gradient-secondary rounded-2xl flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 carat-heading">
              Choose Your Plan
            </h2>
            <p className="text-xl text-muted-foreground">
              Flexible subscription plans designed for businesses of all sizes
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`carat-card border-0 relative transition-all duration-300 hover:-translate-y-2 ${
                  plan.popular ? 'ring-2 ring-primary shadow-2xl scale-105' : ''
                } ${hoveredPlan === index ? 'carat-shadow' : ''}`}
                onMouseEnter={() => setHoveredPlan(index)}
                onMouseLeave={() => setHoveredPlan(null)}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 carat-gradient">
                    Most Popular
                  </Badge>
                )}
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <CardDescription className="text-base">{plan.description}</CardDescription>
                  <div className="mt-4">
                    <span className="text-4xl font-bold carat-heading">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${plan.popular ? 'carat-gradient' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={handleGetStarted}
                  >
                    {plan.price === 'Custom' ? 'Contact Sales' : 'Get Started'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 carat-heading">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-muted-foreground">
              See what our clients say about CaratLogic
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="carat-card border-0">
                <CardHeader>
                  <div className="flex items-center space-x-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                    ))}
                  </div>
                  <CardDescription className="text-base leading-relaxed italic">
                    "{testimonial.content}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                    <p className="text-sm text-primary font-medium">{testimonial.company}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 carat-gradient opacity-95"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center text-primary-foreground">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Transform Your Business?
            </h2>
            <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join hundreds of gem and diamond professionals who trust CaratLogic for their inventory management needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary"
                className="text-lg px-8 py-6 bg-white text-primary hover:bg-white/90"
                onClick={handleGetStarted}
              >
                Start Your Free Trial
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="text-lg px-8 py-6 border-white/20 text-white hover:bg-white/10"
              >
                Contact Sales Team
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-4 mb-4 md:mb-0">
              <div className="w-8 h-8 carat-gradient rounded-lg flex items-center justify-center">
                <Gem className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-bold">CaratLogic</p>
                <p className="text-sm text-muted-foreground">Professional IT Solutions</p>
              </div>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-muted-foreground">
                © 2024 CaratLogic. All rights reserved.
              </p>
              <p className="text-sm text-muted-foreground">
                Empowering the Gem & Diamond Industry
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};