import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Dumbbell, BarChart, Calendar, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="w-full py-4 px-6 md:px-8 lg:px-12 flex items-center justify-between border-b bg-white">
        <div className="flex items-center gap-2 text-primary font-bold text-xl">
          <Dumbbell className="h-6 w-6" />
          <span>FitConnect Pro</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link href="/register">
            <Button>Sign Up</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 px-6 md:px-8 lg:px-12 bg-gradient-to-br from-primary-50 to-background">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Elevate Your Training Business
            </h1>
            <p className="mt-6 text-lg text-muted-foreground">
              The complete platform for personal trainers to manage students, create workouts, track progress, and grow your fitness business.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link href="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="#pricing">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-video bg-muted rounded-lg overflow-hidden shadow-2xl">
              <img 
                src="https://images.pexels.com/photos/4498362/pexels-photo-4498362.jpeg" 
                alt="FitConnect Pro Dashboard" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 px-6 md:px-8 lg:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">All-in-one Fitness Management</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to manage your personal training business in one place.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Dumbbell className="h-8 w-8 text-primary" />,
                title: "Exercise Library",
                description: "Create and manage a comprehensive library of exercises with videos, instructions, and variations."
              },
              {
                icon: <BarChart className="h-8 w-8 text-primary" />,
                title: "Progress Tracking",
                description: "Track physical assessments and visualize progress with detailed charts and metrics."
              },
              {
                icon: <Calendar className="h-8 w-8 text-primary" />,
                title: "Smart Scheduling",
                description: "Efficiently manage appointments with your students through an intuitive calendar interface."
              },
              {
                icon: <Shield className="h-8 w-8 text-primary" />,
                title: "AI-Powered Analysis",
                description: "Leverage AI for posture analysis and personalized workout recommendations."
              },
              {
                icon: <svg className="h-8 w-8 text-primary\" xmlns="http://www.w3.org/2000/svg\" width="24\" height="24\" viewBox="0 0 24 24\" fill="none\" stroke="currentColor\" strokeWidth="2\" strokeLinecap="round\" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9\" cy="7\" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
                title: "Team Management",
                description: "Add and manage trainers in your team with customized access controls based on your plan."
              },
              {
                icon: <svg className="h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M17.5 15a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z"/></svg>,
                title: "Gamification",
                description: "Keep students motivated with achievements, challenges, and performance rewards."
              },
            ].map((feature, index) => (
              <div key={index} className="bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow border">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 md:py-24 px-6 md:px-8 lg:px-12 bg-muted/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">Simple, Transparent Pricing</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that fits your business needs and scale as you grow.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Free Plan */}
            <div className="bg-card rounded-lg overflow-hidden border shadow-sm">
              <div className="p-6">
                <h3 className="text-xl font-semibold">Free Trial</h3>
                <div className="mt-4 flex items-end">
                  <span className="text-3xl font-bold">$0</span>
                  <span className="text-muted-foreground ml-2">/ 14 days</span>
                </div>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Up to 5 students
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Basic exercise library
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Simple workout plans
                  </li>
                  <li className="flex items-center text-muted-foreground">
                    <svg className="h-5 w-5 text-muted-foreground mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    No additional trainers
                  </li>
                  <li className="flex items-center text-muted-foreground">
                    <svg className="h-5 w-5 text-muted-foreground mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    Limited AI features
                  </li>
                </ul>
                <div className="mt-8">
                  <Link href="/register?plan=free">
                    <Button className="w-full" variant="outline">Start Free Trial</Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Platinum Plan */}
            <div className="bg-card rounded-lg overflow-hidden border shadow-sm relative">
              <div className="absolute top-0 right-0 bg-primary text-white px-4 py-1 text-sm font-medium rounded-bl-lg">
                Popular
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold">Platinum</h3>
                <div className="mt-4 flex items-baseline gap-4">
                  <div className="flex items-end">
                    <span className="text-3xl font-bold">$49</span>
                    <span className="text-muted-foreground ml-1">/ month</span>
                  </div>
                  <div className="flex items-end">
                    <span className="text-xl font-semibold">$499</span>
                    <span className="text-muted-foreground ml-1">/ year</span>
                  </div>
                </div>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Up to 100 students (monthly)
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Up to 1000 students (yearly)
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    5-20 additional trainers
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Full exercise library
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    AI-powered features
                  </li>
                </ul>
                <div className="mt-8">
                  <Link href="/register?plan=platinum">
                    <Button className="w-full">Choose Platinum</Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Gold Plan */}
            <div className="bg-card rounded-lg overflow-hidden border shadow-sm">
              <div className="p-6">
                <h3 className="text-xl font-semibold">Gold</h3>
                <div className="mt-4 flex items-baseline gap-4">
                  <div className="flex items-end">
                    <span className="text-3xl font-bold">$99</span>
                    <span className="text-muted-foreground ml-1">/ month</span>
                  </div>
                  <div className="flex items-end">
                    <span className="text-xl font-semibold">$999</span>
                    <span className="text-muted-foreground ml-1">/ year</span>
                  </div>
                </div>
                <ul className="mt-6 space-y-3">
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Up to 1000 students (monthly)
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Up to 5000 students (yearly)
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    10-50 additional trainers
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Premium features
                  </li>
                  <li className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Priority support
                  </li>
                </ul>
                <div className="mt-8">
                  <Link href="/register?plan=gold">
                    <Button className="w-full" variant="outline">Choose Gold</Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 md:px-8 lg:px-12 bg-muted">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Features</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Pricing</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Documentation</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Guides</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">About</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Blog</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Privacy Policy</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Terms of Service</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-foreground">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2 text-primary font-bold">
              <Dumbbell className="h-5 w-5" />
              <span>FitConnect Pro</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} FitConnect Pro. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}