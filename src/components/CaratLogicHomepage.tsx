import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gem, Diamond, Users, BarChart3, Shield, Zap, Star, CheckCircle, ArrowRight } from 'lucide-react';

export const CaratLogicHomepage = () => {
  const subscriptionPlans = [
    {
      name: "Basic",
      price: "$99",
      period: "/month",
      description: "Perfect for small gem dealers",
      features: [
        "Manage up to 500 diamonds",
        "Basic inventory tracking",
        "CSV exports",
        "Email support",
        "Mobile app access"
      ],
      popular: false
    },
    {
      name: "Professional",
      price: "$299",
      period: "/month",
      description: "Ideal for growing businesses",
      features: [
        "Manage up to 5,000 diamonds",
        "Advanced analytics",
        "PDF & CSV exports",
        "QR code generation",
        "Priority support",
        "API integrations",
        "Customer management"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      description: "For large-scale operations",
      features: [
        "Unlimited diamonds",
        "Advanced reporting",
        "White-label solution",
        "Dedicated support",
        "Custom integrations",
        "KYC compliance",
        "Multi-location support"
      ],
      popular: false
    }
  ];

  const testimonials = [
    {
      quote: "CaratLogic transformed our inventory management. We've reduced processing time by 75% and improved accuracy significantly.",
      author: "Sarah Chen",
      role: "Diamond Dealer",
      company: "Precious Stones Ltd."
    },
    {
      quote: "The QR code tracking system is revolutionary. Our clients love the transparency and we love the efficiency.",
      author: "Michael Rodriguez",
      role: "Operations Manager",
      company: "Global Gems Trading"
    },
    {
      quote: "Finally, a solution built specifically for our industry. The support team understands gem trading like no other platform.",
      author: "Priya Sharma",
      role: "CEO",
      company: "Elite Diamonds"
    }
  ];

  const features = [
    {
      icon: Diamond,
      title: "Inventory Control",
      description: "Complete gem and diamond tracking with certification management"
    },
    {
      icon: Users,
      title: "Customer Management",
      description: "Comprehensive CRM for dealers, suppliers, and jewelry businesses"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Real-time insights and reports for informed business decisions"
    },
    {
      icon: Shield,
      title: "KYC Compliance",
      description: "Built-in compliance tools for regulatory requirements"
    },
    {
      icon: Zap,
      title: "API Integrations",
      description: "Seamless connections with existing business tools"
    },
    {
      icon: Gem,
      title: "QR Code Tracking",
      description: "Advanced tracking and authentication for every gem"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="hero-section relative py-20 px-6">
        <div className="container mx-auto text-center relative z-10">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 carat-gradient-luxury rounded-2xl flex items-center justify-center shadow-2xl">
              <Diamond className="w-10 h-10 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 carat-text-luxury">
            Modern Inventory Control for
            <span className="block text-accent">Gems & Diamond Professionals</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto carat-text-luxury">
            Powered by CaratLogic – A smarter way to manage your stock, clients, and growth.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="btn-luxury">
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
              Schedule a Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Company Information */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <Card className="carat-card text-center">
              <CardContent className="pt-6">
                <Diamond className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 carat-heading">Industry Focus</h3>
                <p className="text-muted-foreground">Gem & Diamond (B2B Tech)</p>
              </CardContent>
            </Card>
            
            <Card className="carat-card text-center">
              <CardContent className="pt-6">
                <Users className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 carat-heading">Target Clients</h3>
                <p className="text-muted-foreground">Diamond Dealers, Gem Traders, Jewelry Businesses</p>
              </CardContent>
            </Card>
            
            <Card className="carat-card text-center">
              <CardContent className="pt-6">
                <BarChart3 className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 carat-heading">Service Model</h3>
                <p className="text-muted-foreground">Cloud-based Subscription Platform</p>
              </CardContent>
            </Card>
            
            <Card className="carat-card text-center">
              <CardContent className="pt-6">
                <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2 carat-heading">Mission</h3>
                <p className="text-muted-foreground">Digital Transformation for Gem Industry</p>
              </CardContent>
            </Card>
          </div>

          {/* Features Grid */}
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 carat-heading">Complete IT Solutions</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage, track, and grow your gem and diamond business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {features.map((feature, index) => (
              <Card key={index} className="carat-card">
                <CardContent className="pt-6">
                  <feature.icon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Subscription Plans */}
      <section className="py-16 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 carat-heading">Subscription Plans</h2>
            <p className="text-xl text-muted-foreground">Choose the perfect plan for your business</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {subscriptionPlans.map((plan, index) => (
              <div key={index} className={`subscription-card ${plan.popular ? 'featured' : ''} relative`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold mb-2 carat-heading">{plan.name}</h3>
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-primary">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-muted-foreground">{plan.description}</p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-primary mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  className={`w-full ${plan.popular ? 'btn-luxury' : ''}`}
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.name === "Enterprise" ? "Contact Sales" : "Get Started"}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 carat-heading">What Our Clients Say</h2>
            <p className="text-xl text-muted-foreground">Trusted by professionals worldwide</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="carat-card">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-accent fill-current" />
                    ))}
                  </div>
                  <blockquote className="text-lg mb-6 italic">
                    "{testimonial.quote}"
                  </blockquote>
                  <div>
                    <div className="font-semibold">{testimonial.author}</div>
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
      <section className="py-16 px-6 bg-primary/5">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4 carat-heading">Ready to Transform Your Business?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join hundreds of gem and diamond professionals who trust CaratLogic for their inventory management
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="btn-luxury">
              Start Your Free Trial
            </Button>
            <Button size="lg" variant="outline">
              Contact Our Team
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};