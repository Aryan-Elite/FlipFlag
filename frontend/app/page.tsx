import Link from "next/link"
import { Flag, ToggleLeft, Users, Layers, Code2, ArrowRight, CheckCircle2, Zap, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import HeroDemo from "@/components/HeroDemo"

const features = [
  {
    icon: ToggleLeft,
    title: "Instant toggles",
    description: "Turn features on or off in real time without touching your codebase or triggering a redeploy.",
  },
  {
    icon: Users,
    title: "User targeting",
    description: "Roll out to specific users by ID, plan, country, or any custom attribute you define.",
  },
  {
    icon: Layers,
    title: "Multiple environments",
    description: "Manage flags across Development and Production independently from a single dashboard.",
  },
  {
    icon: Shield,
    title: "Percentage rollouts",
    description: "Gradually roll out features to 5%, 20%, or any percentage of your users with deterministic hashing.",
  },
  {
    icon: Zap,
    title: "Simple SDK",
    description: "One API call. Send your user context and get back evaluated flags. Works with any language.",
  },
  {
    icon: Code2,
    title: "REST API",
    description: "Manage flags programmatically. Integrate with your CI/CD pipeline or internal tooling.",
  },
]

const steps = [
  {
    number: "01",
    title: "Create a flag",
    description: "Give it a name and set targeting rules — by user ID, attribute, or rollout percentage.",
  },
  {
    number: "02",
    title: "Integrate the SDK",
    description: "Add one API call to your app. Pass user context and receive evaluated flag values.",
  },
  {
    number: "03",
    title: "Ship safely",
    description: "Toggle features live without redeploying. Roll back instantly if something goes wrong.",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-md bg-primary">
              <Flag className="size-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">FlipFlag</span>
          </div>

          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <Link href="#features" className="hover:text-foreground transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-foreground transition-colors">How it works</Link>
            <Link href="#sdk" className="hover:text-foreground transition-colors">SDK</Link>
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/register">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <Badge variant="secondary" className="mb-6 font-normal">
          Simple feature flag management
        </Badge>

        <h1 className="mx-auto max-w-3xl text-5xl font-bold leading-tight tracking-tight md:text-6xl">
          Deploy features.{" "}
          <span className="text-muted-foreground">Not risks.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          FlipFlag lets you ship code and control who sees what — without redeploying. Target users, run gradual rollouts, and roll back instantly.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
          <Button size="lg" asChild>
            <Link href="/register">
              Start for free
              <ArrowRight className="ml-2 size-4" />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/login">View dashboard</Link>
          </Button>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          {["No credit card required", "Free to use", "REST API included"].map((item) => (
            <span key={item} className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-emerald-500" />
              {item}
            </span>
          ))}
        </div>

        <HeroDemo />
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">Everything you need</h2>
            <p className="mt-3 text-muted-foreground">
              Built for developers who want simple, reliable feature flags without the complexity.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <Card key={feature.title} className="border-border bg-card">
                <CardContent className="p-5">
                  <div className="mb-3 flex size-9 items-center justify-center rounded-md bg-muted">
                    <feature.icon className="size-4 text-foreground" />
                  </div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">How it works</h2>
            <p className="mt-3 text-muted-foreground">Get set up in under 10 minutes.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="relative">
                <span className="text-4xl font-bold text-muted/60">{step.number}</span>
                <h3 className="mt-3 font-semibold">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SDK snippet */}
      <section id="sdk" className="border-t border-border bg-muted/30 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid items-center gap-12 md:grid-cols-2">
            <div>
              <Badge variant="secondary" className="mb-4 font-normal">Simple SDK</Badge>
              <h2 className="text-3xl font-bold">One call. All your flags.</h2>
              <p className="mt-4 text-muted-foreground">
                Send your user context to the FlipFlag API and get back all evaluated flags in a single response. Works with any language or framework.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                {[
                  "Context-aware evaluation",
                  "Deterministic rollout hashing",
                  "Works server-side and client-side",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 shrink-0 text-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Code block */}
            <div className="rounded-xl border border-border bg-card p-5 font-mono text-sm">
              <div className="mb-3 flex gap-1.5">
                <span className="size-3 rounded-full bg-muted" />
                <span className="size-3 rounded-full bg-muted" />
                <span className="size-3 rounded-full bg-muted" />
              </div>
              <pre className="overflow-x-auto text-sm leading-relaxed">
                <code>
                  <span className="text-muted-foreground">// Evaluate flags for a user</span>{"\n"}
                  <span className="text-blue-400">const</span>{" "}
                  <span className="text-foreground">result</span>{" "}
                  <span className="text-muted-foreground">=</span>{" "}
                  <span className="text-yellow-400">await</span>{" "}
                  <span className="text-foreground">fetch</span>
                  <span className="text-muted-foreground">(</span>
                  <span className="text-emerald-400">&quot;/api/sdk/flags&quot;</span>
                  <span className="text-muted-foreground">, {"{"}</span>{"\n"}
                  {"  "}
                  <span className="text-foreground">method</span>
                  <span className="text-muted-foreground">: </span>
                  <span className="text-emerald-400">&quot;POST&quot;</span>
                  <span className="text-muted-foreground">,</span>{"\n"}
                  {"  "}
                  <span className="text-foreground">body</span>
                  <span className="text-muted-foreground">: </span>
                  <span className="text-blue-400">JSON</span>
                  <span className="text-muted-foreground">.</span>
                  <span className="text-yellow-400">stringify</span>
                  <span className="text-muted-foreground">({"{"}</span>{"\n"}
                  {"    "}
                  <span className="text-foreground">userId</span>
                  <span className="text-muted-foreground">: </span>
                  <span className="text-emerald-400">&quot;user_123&quot;</span>
                  <span className="text-muted-foreground">,</span>{"\n"}
                  {"    "}
                  <span className="text-foreground">attributes</span>
                  <span className="text-muted-foreground">: {"{"}</span>{"\n"}
                  {"      "}
                  <span className="text-foreground">plan</span>
                  <span className="text-muted-foreground">: </span>
                  <span className="text-emerald-400">&quot;pro&quot;</span>
                  <span className="text-muted-foreground">,</span>{"\n"}
                  {"      "}
                  <span className="text-foreground">country</span>
                  <span className="text-muted-foreground">: </span>
                  <span className="text-emerald-400">&quot;IN&quot;</span>{"\n"}
                  {"    "}
                  <span className="text-muted-foreground">{"}"}</span>{"\n"}
                  {"  "}
                  <span className="text-muted-foreground">{"})"})</span>{"\n"}
                  <span className="text-muted-foreground">{"})"}</span>{"\n\n"}
                  <span className="text-muted-foreground">// Use the evaluated flag</span>{"\n"}
                  <span className="text-blue-400">if</span>{" "}
                  <span className="text-muted-foreground">(</span>
                  <span className="text-foreground">result</span>
                  <span className="text-muted-foreground">.</span>
                  <span className="text-foreground">flags</span>
                  <span className="text-muted-foreground">[</span>
                  <span className="text-emerald-400">&quot;new-checkout&quot;</span>
                  <span className="text-muted-foreground">]) {"{"}</span>{"\n"}
                  {"  "}
                  <span className="text-muted-foreground">// show new checkout UI</span>{"\n"}
                  <span className="text-muted-foreground">{"}"}</span>
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-3xl font-bold">Ready to ship safer?</h2>
          <p className="mt-4 text-muted-foreground">
            Get started for free. No credit card, no setup fees — just feature flags that work.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/register">
                Create free account
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/login">Log in</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Flag className="size-4" />
            <span className="font-medium text-foreground">FlipFlag</span>
          </div>
          <span>Feature flag management for developers.</span>
          <div className="flex gap-4">
            <Link href="/login" className="hover:text-foreground transition-colors">Log in</Link>
            <Link href="/register" className="hover:text-foreground transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
