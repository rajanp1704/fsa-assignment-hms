"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Calendar,
  Stethoscope,
  FileText,
  Shield,
  ArrowRight,
  Heart,
  Activity,
  Microscope,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function HomePage() {
  return (
    <div className="flex flex-col relative">
      {/* Mesh Background Decorations */}
      <div className="absolute top-20 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-40 -right-20 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 md:pt-32 md:pb-48 overflow-hidden">
        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-10 animate-in slide-in-from-left duration-700">
              <div className="inline-flex items-center gap-3 bg-white/50 backdrop-blur-md border border-white/20 rounded-full px-5 py-2 text-sm font-black tracking-wide text-primary shadow-sm floating">
                <Heart className="h-5 w-5 text-red-500 animate-pulse" />
                <span className="text-secondary">
                  TRUSTED BY 10,000+ PATIENTS GLOBALLY
                </span>
              </div>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter">
                ELEVATE YOUR <br />
                <span className="gradient-text">HEALTHCARE</span> <br />
                EXPERIENCE
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-xl leading-relaxed">
                Experience the future of medical management. Seamlessly connect
                with specialists, manage records, and prioritize your
                well-being.
              </p>
              <div className="flex flex-wrap gap-5 pt-4">
                <Button
                  size="lg"
                  asChild
                  className="h-16 px-10 rounded-2xl text-lg font-black bg-primary text-primary-foreground shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
                >
                  <Link href="/register">
                    START JOURNEY
                    <ArrowRight className="ml-3 h-6 w-6" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="h-16 px-12 rounded-2xl text-xl font-black shadow-2xl shadow-primary/30  hover:scale-105 active:scale-95 transition-all"
                >
                  <Link href="/login">SIGN IN</Link>
                </Button>
              </div>
            </div>

            <div className="relative hidden lg:block animate-in zoom-in duration-1000 delay-200">
              <div className="absolute inset-0 bg-primary/10 rounded-[4rem] blur-[80px] -rotate-6" />
              <div className="relative glass-card p-10 rounded-[3.5rem] border-white/40 shadow-2xl scale-105 rotate-3 hover:rotate-0 transition-transform duration-700">
                <div className="grid grid-cols-2 gap-6">
                  {[
                    {
                      icon: Calendar,
                      title: "EXPRESS BOOKING",
                      color: "text-primary",
                      bg: "bg-primary/20",
                      desc: "Instant Confirmation",
                    },
                    {
                      icon: Stethoscope,
                      title: "TOP SPECIALISTS",
                      color: "text-blue-500",
                      bg: "bg-blue-500/20",
                      desc: "50+ Experts Available",
                    },
                    {
                      icon: FileText,
                      title: "SECURE VAULT",
                      color: "text-purple-500",
                      bg: "bg-purple-500/20",
                      desc: "Encrypted Records",
                    },
                    {
                      icon: Shield,
                      title: "TOTAL PRIVACY",
                      color: "text-green-500",
                      bg: "bg-green-500/20",
                      desc: "HIPAA Compliant",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="bg-white/40 backdrop-blur-md rounded-[2rem] p-8 space-y-3 border border-white/50 hover:bg-white/60 transition-colors group"
                    >
                      <div
                        className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110",
                          item.bg
                        )}
                      >
                        <item.icon className={cn("h-7 w-7", item.color)} />
                      </div>
                      <p className="font-black text-sm tracking-widest text-foreground uppercase">
                        {item.title}
                      </p>
                      <p className="text-xs font-bold text-muted-foreground">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-32 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-1/2 bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="relative z-10 text-center max-w-4xl mx-auto mb-24">
          <Badge className="mb-6 rounded-full px-5 py-1 text-xs font-black tracking-[0.2em] uppercase bg-primary/10 text-primary border-none">
            Our Ecosystem
          </Badge>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 leading-tight">
            COMPREHENSIVE CARE <br />
            AT YOUR FINGERTIPS
          </h2>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
            We&apos;ve revolutionized every aspect of your healthcare journey
            with cutting-edge digital solutions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 relative z-10">
          {[
            {
              icon: Calendar,
              title: "Intuitive Scheduling",
              desc: "Book appointments with precision. Multi-slot views and real-time availability sync.",
              bg: "from-blue-500 to-cyan-500",
            },
            {
              icon: Stethoscope,
              title: "Live Queue Logic",
              desc: "Track your token in real-time. No more dark-room waiting; arrive exactly when needed.",
              bg: "from-green-500 to-emerald-500",
            },
            {
              icon: FileText,
              title: "Digital Blueprint",
              desc: "Your entire medical journey preserved in a high-fidelity digital format.",
              bg: "from-purple-500 to-indigo-500",
            },
            {
              icon: Microscope,
              title: "Instant Analysis",
              desc: "View lab results the moment they are certified. Integrated diagnostic trends.",
              bg: "from-orange-500 to-red-500",
            },
            {
              icon: Activity,
              title: "Health Analytics",
              desc: "Monitor your vitals and progress through beautiful data visualizations.",
              bg: "from-rose-500 to-pink-500",
            },
            {
              icon: Shield,
              title: "Ironclad Security",
              desc: "Your data is protected by industry-standard encryption and biometric protocols.",
              bg: "from-cyan-500 to-teal-500",
            },
          ].map((feature, i) => (
            <Card
              key={i}
              className="glass-card group hover-lift rounded-[2.5rem] border-white/50 p-2 overflow-hidden"
            >
              <CardHeader className="p-8">
                <div
                  className={cn(
                    "w-16 h-16 rounded-3xl bg-gradient-to-br flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-transform",
                    feature.bg
                  )}
                >
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-black tracking-tight mb-4">
                  {feature.title}
                </CardTitle>
                <CardDescription className="text-base font-medium leading-relaxed">
                  {feature.desc}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Stats Section with Glassmorphism */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 pointer-events-none" />
        <div className="container relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
            {[
              { val: "50+", label: "Expert Doctors" },
              { val: "10K+", label: "Happy Patients" },
              { val: "15+", label: "Specializations" },
              { val: "24/7", label: "Live Support" },
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="text-5xl md:text-7xl font-black gradient-text mb-4 transition-transform group-hover:scale-110 duration-500">
                  {stat.val}
                </div>
                <p className="text-sm font-black tracking-widest text-muted-foreground uppercase opacity-70">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium CTA Section */}
      <section className="container py-32 mb-20 animate-in fade-in duration-1000">
        <div className="relative rounded-[4rem] p-1 overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-blue-500 to-purple-600 animate-gradient-x p-1" />
          <div className="relative bg-background rounded-[3.9rem] p-12 md:p-24 text-center overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-primary/5 pointer-events-none" />
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/20 rounded-full blur-[100px]" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px]" />

            <div className="relative z-10 space-y-10">
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter max-w-3xl mx-auto leading-[0.9]">
                REVOLUTIONIZE YOUR <br />
                <span className="gradient-text">HEALTH JOURNEY</span> TODAY.
              </h2>
              <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto">
                Join thousands of visionary patients who have already
                transformed their healthcare experience.
              </p>
              <div className="pt-6">
                <Button
                  size="lg"
                  asChild
                  className="h-16 px-12 rounded-2xl text-xl font-black shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
                >
                  <Link href="/register">
                    CREATE FREE ACCOUNT
                    <ArrowRight className="ml-3 h-7 w-7" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
