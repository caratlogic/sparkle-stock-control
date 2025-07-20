import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gem, Diamond, Users, BarChart3, Shield, Zap, Star, CheckCircle, ArrowRight } from 'lucide-react';

export const CaratLogicHomepage = () => {
  const subscriptionPlans = [{
    name: "Basic",
    price: "$99",
    period: "/month",
    description: "Perfect for small gem dealers",
    features: ["Manage up to 500 diamonds", "Basic inventory tracking", "CSV exports", "Email support", "Mobile app access"],
    popular: false
  }, {
    name: "Professional",
    price: "$299",
    period: "/month",
    description: "Ideal for growing businesses",
    features: ["Manage up to 5,000 diamonds", "Advanced analytics", "PDF & CSV exports", "QR code generation", "Priority support", "API integrations", "Customer management"],
    popular: true
  }, {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large-scale operations",
    features: ["Unlimited diamonds", "Advanced reporting", "White-label solution", "Dedicated support", "Custom integrations", "KYC compliance", "Multi-location support"],
    popular: false
  }];

  const testimonials = [{
    quote: "CaratLogic transformed our inventory management. We've reduced processing time by 75% and improved accuracy significantly.",
    author: "Sarah Chen",
    role: "Diamond Dealer",
    company: "Precious Stones Ltd."
  }, {
    quote: "The QR code tracking system is revolutionary. Our clients love the transparency and we love the efficiency.",
    author: "Michael Rodriguez",
    role: "Operations Manager",
    company: "Global Gems Trading"
  }, {
    quote: "Finally, a solution built specifically for our industry. The support team understands gem trading like no other platform.",
    author: "Priya Sharma",
    role: "CEO",
    company: "Elite Diamonds"
  }];

  const features = [{
    icon: Diamond,
    title: "Inventory Control",
    description: "Complete gem and diamond tracking with certification management"
  }, {
    icon: Users,
    title: "Customer Management",
    description: "Comprehensive CRM for dealers, suppliers, and jewelry businesses"
  }, {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Real-time insights and reports for informed business decisions"
  }, {
    icon: Shield,
    title: "KYC Compliance",
    description: "Built-in compliance tools for regulatory requirements"
  }, {
    icon: Zap,
    title: "API Integrations",
    description: "Seamless connections with existing business tools"
  }, {
    icon: Gem,
    title: "QR Code Tracking",
    description: "Advanced tracking and authentication for every gem"
  }];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/80"></div>
        <div className="absolute inset-0 opacity-20">
          <div style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} className="w-full h-full"></div>
        </div>
        
        <div className="container mx-auto relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-8 border border-white/20">
              <Diamond className="w-8 h-8 text-white" />
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Modern Inventory Control
              <span className="block bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent mt-2">
                for Gem Professionals
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto leading-relaxed">
              Powered by CaratLogic – Transform your gem and diamond business with intelligent 
              inventory management, seamless tracking, and comprehensive analytics.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-primary font-semibold px-8 py-4 h-auto">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10 px-8 py-4 h-auto">
                Schedule a Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-20 px-6 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Why Choose CaratLogic?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Built specifically for the gem and diamond industry with deep understanding of your unique challenges
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className="group">
              <Card className="h-full border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <Diamond className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">Industry Expertise</h3>
                  <p className="text-sm text-muted-foreground">Specialized for Gem & Diamond B2B Tech</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="group">
              <Card className="h-full border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">Trusted by Professionals</h3>
                  <p className="text-sm text-muted-foreground">Diamond Dealers, Gem Traders & Jewelers</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="group">
              <Card className="h-full border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <BarChart3 className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">Cloud-Based Platform</h3>
                  <p className="text-sm text-muted-foreground">Scalable Subscription Model</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="group">
              <Card className="h-full border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-foreground">Digital Transformation</h3>
                  <p className="text-sm text-muted-foreground">Modernize Your Gem Business</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Features Grid */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Complete IT Solutions</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Everything you need to manage, track, and grow your gem and diamond business with enterprise-grade security and reliability
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Subscription Plans */}
      <section className="py-20 px-6 bg-gradient-to-b from-muted/30 to-background">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Choose Your Plan</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Flexible subscription options designed to scale with your business needs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {subscriptionPlans.map((plan, index) => (
              <div key={index} className={`relative group ${plan.popular ? 'md:-mt-4' : ''}`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                    <Badge className="bg-accent text-primary font-semibold px-4 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <Card className={`h-full p-8 border-0 shadow-sm hover:shadow-xl transition-all duration-300 ${
                  plan.popular 
                    ? 'bg-gradient-to-b from-primary/5 to-primary/10 ring-2 ring-primary/20' 
                    : 'bg-card/50 backdrop-blur-sm'
                }`}>
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-2 text-foreground">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-primary">{plan.price}</span>
                      <span className="text-muted-foreground">{plan.period}</span>
                    </div>
                    <p className="text-muted-foreground">{plan.description}</p>
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-primary mr-3 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary/90' : ''}`} 
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                  >
                    {plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                  </Button>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Trusted by Industry Leaders</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              See how CaratLogic is transforming businesses across the gem and diamond industry
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-all duration-300 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-accent text-accent" />
                    ))}
                  </div>
                  <blockquote className="text-foreground mb-6 leading-relaxed">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="border-t pt-4">
                    <div className="font-semibold text-foreground">{testimonial.author}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    <div className="text-sm text-primary font-medium">{testimonial.company}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-primary to-primary/90 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }} className="w-full h-full"></div>
        </div>
        
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
              Ready to Transform Your Business?
            </h2>
            <p className="text-lg md:text-xl text-white/90 mb-10 leading-relaxed">
              Join hundreds of gem and diamond professionals who trust CaratLogic for streamlined 
              inventory management, enhanced security, and accelerated growth.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-primary font-semibold px-8 py-4 h-auto">
                Start Your Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-white/30 text-white hover:bg-white/10 px-8 py-4 h-auto">
                Contact Our Team
              </Button>
            </div>
            
            <p className="text-sm text-white/70 mt-6">
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};