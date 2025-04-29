import { useEffect, useState } from 'react';
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useLocation, useRoute } from 'wouter';
import { getStripe, isStripeAvailable } from '@/lib/stripe-helpers';
import { Stripe } from '@stripe/stripe-js';

const tiers = [
  {
    id: 'basic',
    name: 'Basic',
    price: 29,
    description: 'Essential tools for L&D professionals and companies',
    features: [
      'Create basic profile',
      'Browse job postings',
      'Access resource library',
      'Apply to up to 5 jobs monthly'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 79,
    description: 'Advanced features for serious L&D professionals and growing organizations',
    features: [
      'Featured profile placement',
      'Unlimited job applications',
      'Direct messaging',
      'Access to premium resources',
      'Priority support'
    ]
  }
];

type Tier = {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
};

const SubscriptionForm = ({ selectedTier }: { selectedTier: Tier }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [, navigate] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      console.error("Stripe or elements not initialized");
      return;
    }

    setLoading(true);

    try {
      console.log("Processing payment for tier:", selectedTier.id);
      // Confirm the payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + '/subscription-success',
        },
        redirect: 'if_required'
      });

      if (error) {
        console.error("Payment confirmation error:", error);
        toast({
          title: "Payment Failed",
          description: error.message || "Your payment could not be processed. Please try again.",
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        console.log("Payment succeeded:", paymentIntent.id);
        // Once payment is successful, update the subscription status
        try {
          const response = await apiRequest("POST", "/api/update-subscription", {
            tierId: selectedTier.id,
            status: 'active',
            paymentIntentId: paymentIntent.id
          });
          
          if (response.ok) {
            console.log("Subscription updated successfully");
            toast({
              title: "Subscription Successful",
              description: `You are now subscribed to the ${selectedTier.name} plan!`,
            });
            // Redirect to success page
            navigate('/subscription-success');
          } else {
            const errorData = await response.json().catch(() => ({}));
            console.error("Subscription update failed:", errorData);
            toast({
              title: "Warning",
              description: errorData.message || "Payment processed but subscription update failed. Please contact support.",
              variant: "destructive",
            });
          }
        } catch (err: any) {
          console.error("Error updating subscription:", err);
          toast({
            title: "Warning",
            description: "Payment processed but subscription update failed. Please contact support.",
            variant: "destructive",
          });
        }
      } else {
        console.log("Payment intent status:", paymentIntent?.status);
        toast({
          title: "Payment Status",
          description: `Payment status: ${paymentIntent?.status || 'unknown'}. Please check your payment method.`,
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Payment submission error:", err);
      toast({
        title: "Error",
        description: err.message || "An unexpected error occurred during payment processing",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="py-4">
        <PaymentElement />
      </div>
      <Button 
        disabled={!stripe || loading} 
        type="submit" 
        className="w-full" 
        size="lg"
      >
        {loading ? "Processing..." : `Subscribe - $${selectedTier.price}/month`}
      </Button>
    </form>
  );
};

export default function Subscribe() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clientSecret, setClientSecret] = useState("");
  const [selectedTierId, setSelectedTierId] = useState("basic");
  const [loading, setLoading] = useState(false);
  const [match, params] = useRoute('/subscribe/:tierId');
  const [stripeInstance, setStripeInstance] = useState<Stripe | null>(null);
  const [loadingStripe, setLoadingStripe] = useState(true);
  const [stripeError, setStripeError] = useState(false);
  
  useEffect(() => {
    if (match && params.tierId && (params.tierId === 'basic' || params.tierId === 'premium')) {
      setSelectedTierId(params.tierId);
      // Store selected tier for cross-page reference
      localStorage.setItem('selectedSubscriptionTier', params.tierId);
    }
  }, [match, params]);

  // Load Stripe safely
  useEffect(() => {
    const loadStripeInstance = async () => {
      try {
        setLoadingStripe(true);
        
        // Check if Stripe is available, using true to suppress console errors
        if (!isStripeAvailable(true)) {
          console.log("Stripe public key not available - subscription functions disabled");
          setStripeError(true);
          toast({
            title: "Subscription system unavailable",
            description: "The subscription system is currently offline. Please try again later or contact support.",
            variant: "destructive",
          });
          return;
        }
        
        // Try to get Stripe instance
        const instance = await getStripe();
        if (!instance) {
          console.log("Failed to initialize Stripe instance for subscription");
          setStripeError(true);
          toast({
            title: "Subscription system unavailable",
            description: "Unable to initialize subscription processing. Please try again later.",
            variant: "destructive",
          });
        } else {
          console.log("Stripe loaded successfully for subscription");
          setStripeInstance(instance);
        }
      } catch (error) {
        console.error("Error loading Stripe for subscription:", error);
        setStripeError(true);
        toast({
          title: "Subscription system unavailable",
          description: "Unable to load subscription processing. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoadingStripe(false);
      }
    };
    
    loadStripeInstance();
  }, [toast]);

  const selectedTier = tiers.find(tier => tier.id === selectedTierId) || tiers[0];

  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to subscribe to a plan",
        variant: "destructive",
      });
      return;
    }

    // Create PaymentIntent as soon as the page loads
    const createIntent = async () => {
      setLoading(true);
      try {
        // Create payment intent for one-time payment
        // In a real implementation, we would use proper subscription creation
        const response = await apiRequest("POST", "/api/create-payment-intent", { 
          amount: selectedTier.price,
          tier: selectedTierId
        });
        
        const data = await response.json();
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          toast({
            title: "Error",
            description: data.message || "Could not initialize payment",
            variant: "destructive",
          });
        }
      } catch (error: any) {
        console.error("Payment initialization error:", error);
        toast({
          title: "Error",
          description: error.message || "An unexpected error occurred",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    createIntent();
  }, [user, selectedTierId, selectedTier.price, toast]);

  // Show loading state when loading Stripe or payment intent
  if (loading || loadingStripe) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Show error or authentication required
  if (!user) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Authentication Required</CardTitle>
            <CardDescription className="text-center">
              Please log in to subscribe to a plan
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Show error message if there is a Stripe error
  if (stripeError) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Payment Unavailable</CardTitle>
            <CardDescription className="text-center">
              We're unable to process payments at this time. Please try again later.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Choose Your Subscription Plan</h1>
      
      <div className="mb-8">
        <RadioGroup 
          value={selectedTierId} 
          onValueChange={(value) => {
            setSelectedTierId(value);
            localStorage.setItem('selectedSubscriptionTier', value);
          }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {tiers.map((tier) => (
            <Label
              key={tier.id}
              htmlFor={tier.id}
              className="cursor-pointer"
            >
              <Card className={`h-full transition-all ${selectedTierId === tier.id ? 'border-primary ring-2 ring-primary' : ''}`}>
                <CardHeader>
                  <CardTitle>{tier.name}</CardTitle>
                  <div className="text-3xl font-bold">${tier.price}<span className="text-sm font-normal text-gray-500">/month</span></div>
                  <CardDescription>{tier.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-center">
                        <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <RadioGroupItem 
                    value={tier.id} 
                    id={tier.id} 
                    className="sr-only" 
                  />
                </CardFooter>
              </Card>
            </Label>
          ))}
        </RadioGroup>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
          <CardDescription>
            Enter your payment information to subscribe to the {selectedTier.name} plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && !clientSecret ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : clientSecret && stripeInstance ? (
            <Elements stripe={stripeInstance} options={{ clientSecret }}>
              <SubscriptionForm selectedTier={selectedTier} />
            </Elements>
          ) : (
            <div className="py-8 text-center text-red-500">
              Failed to initialize payment. Please try again.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}