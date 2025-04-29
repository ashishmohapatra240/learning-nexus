import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckIcon } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

type PricingPlan = {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  buttonText: string;
  mostPopular: boolean;
};

const plans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    price: 0,
    description: "Essential tools for L&D professionals",
    features: [
      "Create a basic profile",
      "Browse job listings",
      "Access public resources",
      "Join community forum"
    ],
    buttonText: "Current Plan",
    mostPopular: false
  },
  {
    id: "basic",
    name: "Basic",
    price: 29,
    description: "Essential tools for L&D professionals and companies",
    features: [
      "Create enhanced profile",
      "Browse and apply to job postings",
      "Access full resource library",
      "Apply to up to 5 jobs monthly",
      "Basic analytics dashboard"
    ],
    buttonText: "Subscribe Now",
    mostPopular: false
  },
  {
    id: "premium",
    name: "Premium",
    price: 79,
    description: "Advanced features for serious L&D experts",
    features: [
      "Featured profile placement",
      "Unlimited job applications",
      "Premium resource access",
      "Direct messaging",
      "Priority support",
      "Advanced analytics"
    ],
    buttonText: "Subscribe Now",
    mostPopular: true
  }
];

export default function SubscriptionPlans() {
  const { user } = useAuth();
  
  return (
    <section id="pricing" className="py-24 bg-gradient-to-b from-background to-muted">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Pricing Plans
          </h2>
          <p className="text-muted-foreground text-lg">
            Choose the perfect plan for your L&D professional journey
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`flex flex-col h-full ${
                plan.mostPopular ? "border-primary shadow-lg scale-105" : ""
              }`}
            >
              <CardHeader>
                {plan.mostPopular && (
                  <div className="py-1 px-3 bg-primary text-primary-foreground text-xs font-semibold rounded-full w-fit mb-2">
                    MOST POPULAR
                  </div>
                )}
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="flex items-baseline mt-2">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  {plan.price !== 0 && <span className="ml-1 text-muted-foreground">/month</span>}
                </div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex">
                      <CheckIcon className="h-5 w-5 text-primary shrink-0 mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {plan.id === "free" ? (
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    size="lg"
                    disabled
                  >
                    {plan.buttonText}
                  </Button>
                ) : (
                  <Button 
                    asChild={!!user}
                    className="w-full" 
                    size="lg"
                    onClick={!user ? () => window.location.href = "/login" : undefined}
                  >
                    {user ? (
                      <Link href={`/subscribe/${plan.id}`}>{plan.buttonText}</Link>
                    ) : (
                      plan.buttonText
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
        
        {!user && (
          <div className="text-center mt-8 text-muted-foreground">
            <p>Please <Link href="/login" className="underline text-primary">log in</Link> to subscribe to a plan.</p>
          </div>
        )}
      </div>
    </section>
  );
}