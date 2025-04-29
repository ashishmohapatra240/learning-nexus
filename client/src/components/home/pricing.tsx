import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle } from "lucide-react";
import { Link } from "wouter";

type PricingPlan = {
  name: string;
  description: string;
  price: string;
  features: string[];
  disabledFeatures: string[];
  ctaText: string;
  ctaLink: string;
  popular?: boolean;
  borderColor: string;
};

export default function Pricing() {
  const [pricingType, setPricingType] = useState<"professional" | "company">("professional");

  const professionalPlans: PricingPlan[] = [
    {
      name: "Free",
      description: "Get started with basic features",
      price: "$0",
      features: [
        "Basic profile",
        "5 job applications per month",
        "Access to community forum",
      ],
      disabledFeatures: [
        "Featured profile placement",
        "Video introduction",
      ],
      ctaText: "Get Started",
      ctaLink: "/register?type=professional&plan=free",
      borderColor: "border-gray-300",
    },
    {
      name: "Pro",
      description: "Everything you need to succeed",
      price: "$29",
      features: [
        "Enhanced profile with portfolio",
        "Unlimited job applications",
        "Video introduction",
        "Early access to job opportunities",
        "Profile analytics",
      ],
      disabledFeatures: [],
      ctaText: "Sign Up Now",
      ctaLink: "/register?type=professional&plan=pro",
      popular: true,
      borderColor: "border-primary",
    },
    {
      name: "Premium",
      description: "For established professionals",
      price: "$79",
      features: [
        "All Pro features",
        "Featured profile placement",
        "Direct consultation bookings",
        "Publish resources & articles",
        "Priority customer support",
      ],
      disabledFeatures: [],
      ctaText: "Get Premium",
      ctaLink: "/register?type=professional&plan=premium",
      borderColor: "border-teal-500",
    },
  ];

  const companyPlans: PricingPlan[] = [
    {
      name: "Basic",
      description: "For small businesses",
      price: "$49",
      features: [
        "Company profile",
        "5 job postings per month",
        "Access to community forum",
        "Browse professional profiles",
      ],
      disabledFeatures: [
        "Featured job listings",
        "Advanced professional filtering",
      ],
      ctaText: "Get Started",
      ctaLink: "/register?type=company&plan=basic",
      borderColor: "border-gray-300",
    },
    {
      name: "Business",
      description: "For growing companies",
      price: "$149",
      features: [
        "Enhanced company profile",
        "20 job postings per month",
        "Featured job listings",
        "Advanced professional filtering",
        "Priority customer support",
      ],
      disabledFeatures: [],
      ctaText: "Sign Up Now",
      ctaLink: "/register?type=company&plan=business",
      popular: true,
      borderColor: "border-primary",
    },
    {
      name: "Enterprise",
      description: "For large organizations",
      price: "$349",
      features: [
        "All Business features",
        "Unlimited job postings",
        "Dedicated account manager",
        "Custom training solutions",
        "API access & integrations",
      ],
      disabledFeatures: [],
      ctaText: "Contact Sales",
      ctaLink: "/contact-sales",
      borderColor: "border-teal-500",
    },
  ];

  const plans = pricingType === "professional" ? professionalPlans : companyPlans;

  return (
    <section id="pricing" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-heading font-bold text-center mb-4">Plans & Pricing</h2>
        <p className="text-gray-600 text-center max-w-2xl mx-auto mb-10">
          Choose the right plan for your L&D needs.
        </p>
        
        {/* Tabs */}
        <div className="flex justify-center mb-10">
          <Tabs 
            defaultValue="professional" 
            className="w-full max-w-md"
            onValueChange={(value) => setPricingType(value as "professional" | "company")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="professional">L&D Professionals</TabsTrigger>
              <TabsTrigger value="company">Companies</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card key={index} className={`relative hover:shadow-lg transition-shadow border-t-4 ${plan.borderColor}`}>
              {plan.popular && (
                <div className="absolute top-0 right-0 bg-primary text-white text-xs px-3 py-1 font-bold">
                  POPULAR
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl font-heading font-bold mb-2">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-4 mb-2">
                  <span className="text-3xl font-heading font-bold">{plan.price}</span>
                  <span className="text-gray-500">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle className="text-green-500 mr-2 text-sm mt-1 h-5 w-5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {plan.disabledFeatures.map((feature, i) => (
                    <li key={i} className="flex items-start text-gray-400">
                      <XCircle className="text-gray-300 mr-2 text-sm mt-1 h-5 w-5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link href={plan.ctaLink}>
                  <Button
                    variant={plan.popular ? "default" : "outline"}
                    className="w-full font-medium"
                  >
                    {plan.ctaText}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
