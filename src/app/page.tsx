import { ArrowRight, Shield, Users, DollarSign, Clock, CheckCircle, Star, Zap, Lock } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import PublicLayout from "@/components/layout/PublicLayout"

const features = [
  {
    icon: <Shield className="h-8 w-8 text-blue-600" />,
    title: "Smart Escrow",
    description: "Funds locked until both parties deliver. No more ghosting, no more scams.",
    color: "bg-blue-50 text-blue-600"
  },
  {
    icon: <Users className="h-8 w-8 text-green-600" />,
    title: "Trust Profiles",
    description: "Reputation that follows you. Build credibility with every successful deal.",
    color: "bg-green-50 text-green-600"
  },
  {
    icon: <Zap className="h-8 w-8 text-purple-600" />,
    title: "Instant Verification",
    description: "KYC & identity verification. Know who you're dealing with.",
    color: "bg-purple-50 text-purple-600"
  },
  {
    icon: <Lock className="h-8 w-8 text-orange-600" />,
    title: "Savings Vault",
    description: "Self-lock funds for goals. Send money to other users securely.",
    color: "bg-orange-50 text-orange-600"
  }
]

const howItWorksSteps = [
  {
    step: "1",
    title: "Create Deal",
    description: "Set terms, milestones, and payment amount",
    icon: <CheckCircle className="h-6 w-6" />
  },
  {
    step: "2", 
    title: "Lock Funds",
    description: "Buyer deposits money into secure escrow",
    icon: <Lock className="h-6 w-6" />
  },
  {
    step: "3",
    title: "Deliver & Confirm",
    description: "Both parties complete their obligations",
    icon: <Users className="h-6 w-6" />
  },
  {
    step: "4",
    title: "Release Payment",
    description: "Funds automatically released to seller",
    icon: <DollarSign className="h-6 w-6" />
  }
]

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Freelance Developer",
    avatar: "SC",
    trustScore: 94,
    quote: "Finally got paid on time! SafeSwap's escrow saved me from another ghosting client.",
    deals: 27
  },
  {
    name: "Marcus Johnson", 
    role: "Digital Marketer",
    avatar: "MJ",
    trustScore: 89,
    quote: "Trust scores are genius. Clients can see my track record before we even talk.",
    deals: 41
  },
  {
    name: "Elena Rodriguez",
    role: "Graphic Designer", 
    avatar: "ER",
    trustScore: 96,
    quote: "The milestone system keeps projects on track. Both sides know what's expected.",
    deals: 63
  }
]

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    description: "Perfect for getting started",
    features: [
      "Up to 3 deals/month",
      "Basic escrow protection", 
      "Trust profile",
      "Standard support"
    ],
    cta: "Get Started Free",
    popular: false
  },
  {
    name: "Pro",
    price: "$19",
    period: "/month", 
    description: "For active freelancers & businesses",
    features: [
      "Unlimited deals",
      "Advanced escrow features",
      "Priority verification",
      "API access",
      "Premium support"
    ],
    cta: "Start Pro Trial",
    popular: true
  }
]

const faqs = [
  {
    question: "What if someone disputes a deal?",
    answer: "Our admin team reviews evidence from both parties and makes a fair decision. Most disputes resolve in 2-3 business days."
  },
  {
    question: "How do I build my trust score?", 
    answer: "Complete deals successfully, get verified, maintain good communication, and resolve any issues quickly. Scores update after each transaction."
  },
  {
    question: "Are my funds really safe?",
    answer: "Yes. We use Stripe for payment processing and hold funds in secure escrow accounts. Your money is protected by banking-grade security."
  },
  {
    question: "Can I use SafeSwap internationally?",
    answer: "Absolutely! We support international transactions with automatic currency conversion and compliance with local regulations."
  }
]

export default function LandingPage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-4">
              PayPal for Trust
            </Badge>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              The Trust Layer for 
              <span className="text-blue-600"> Online Deals</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Escrow + trust profiles for freelancers, buyers, and sellers. SafeSwap secures your digital transactions until both sides deliver.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link href="/register">
                <Button size="lg" className="px-8">
                  Start Your First Deal
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/demo">
                <Button variant="outline" size="lg">
                  Watch Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-blue-400 to-purple-600 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>
      </section>

      {/* Problem → Solution */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                Tired of getting burned by online deals?
              </h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <p className="text-gray-600 dark:text-gray-300">
                    <strong>Freelancers:</strong> Clients disappear after you deliver the work
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <p className="text-gray-600 dark:text-gray-300">
                    <strong>Buyers:</strong> Sellers take the money and vanish
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                  <p className="text-gray-600 dark:text-gray-300">
                    <strong>Everyone:</strong> No way to verify if someone is trustworthy
                  </p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                SafeSwap changes everything
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <p className="text-gray-600 dark:text-gray-300">
                    <strong>Escrow protection:</strong> Funds locked until both sides deliver
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <p className="text-gray-600 dark:text-gray-300">
                    <strong>Trust profiles:</strong> See someone&apos;s reputation before you deal
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <p className="text-gray-600 dark:text-gray-300">
                    <strong>Milestone tracking:</strong> Clear expectations, better outcomes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need for safe deals
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Built-in protection, reputation system, and tools that make online transactions as safe as meeting in person.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className={`w-16 h-16 mx-auto rounded-full ${feature.color} flex items-center justify-center mb-4`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              How SafeSwap works
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Simple, secure, and automatic. No complicated setup required.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorksSteps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative">
                  <div className="w-16 h-16 mx-auto bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4">
                    {step.step}
                  </div>
                  {index < howItWorksSteps.length - 1 && (
                    <ArrowRight className="hidden lg:block absolute top-6 -right-12 h-6 w-6 text-gray-400" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof - Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Trusted by thousands of users
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              See what our community says about SafeSwap
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold mr-4">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {testimonial.name}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 dark:text-gray-300 mb-4 italic">
                    &quot;{testimonial.quote}&quot;
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium">{testimonial.trustScore}</span>
                      <span className="text-gray-500">Trust Score</span>
                    </div>
                    <span className="text-gray-500">
                      {testimonial.deals} deals completed
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Start free, upgrade when you need more
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card key={index} className={`relative border-2 ${plan.popular ? 'border-blue-600' : 'border-gray-200'}`}>
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white">Most Popular</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                      {plan.price}
                    </span>
                    <span className="text-gray-600 dark:text-gray-300">
                      {plan.period}
                    </span>
                  </div>
                  <CardDescription className="mt-2">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="text-gray-700 dark:text-gray-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  <Link href={plan.popular ? "/register?plan=pro" : "/register"}>
                    <Button 
                      className="w-full" 
                      variant={plan.popular ? "default" : "outline"}
                      size="lg"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently asked questions
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Everything you need to know about SafeSwap
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <div key={index}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  {faq.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-blue-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to make your first safe deal?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of freelancers, buyers, and sellers who trust SafeSwap with their online transactions.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="px-8">
                Start Your First Deal Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}