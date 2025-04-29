import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { useEffect, useState } from 'react';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from 'wouter';
import { getStripe, isStripeAvailable } from '@/lib/stripe-helpers';
import { Stripe } from '@stripe/stripe-js';

const CheckoutForm = ({ amount }: { amount: number }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin,
        },
        redirect: 'if_required',
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Payment Successful",
          description: "Thank you for your purchase!",
        });
        // Redirect to a success page or dashboard
        setTimeout(() => {
          setLocation('/professional-dashboard');
        }, 2000);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button 
        type="submit" 
        disabled={!stripe || isProcessing}
        className="w-full"
      >
        {isProcessing ? "Processing..." : `Pay $${amount.toFixed(2)}`}
      </Button>
    </form>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const [amount, setAmount] = useState(99.99); // Default amount, customize as needed
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  useEffect(() => {
    const fetchPaymentIntent = async () => {
      try {
        setIsLoading(true);
        // Create PaymentIntent as soon as the page loads
        const response = await apiRequest("POST", "/api/create-payment-intent", { 
          amount 
        });
        
        const data = await response.json();
        setClientSecret(data.clientSecret);
      } catch (error: any) {
        toast({
          title: "Error",
          description: "Failed to initialize payment. Please try again later.",
          variant: "destructive",
        });
        // Redirect back on error
        setTimeout(() => {
          setLocation('/');
        }, 2000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentIntent();
  }, [toast, amount, setLocation]);

  if (isLoading || !clientSecret) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  const [stripeInstance, setStripeInstance] = useState<Stripe | null>(null);
  const [loadingStripe, setLoadingStripe] = useState(true);
  const [stripeError, setStripeError] = useState(false);

  // Load Stripe safely
  useEffect(() => {
    const loadStripeInstance = async () => {
      try {
        setLoadingStripe(true);
        
        // Check if Stripe is available, using true to suppress console errors
        if (!isStripeAvailable(true)) {
          console.log("Stripe public key not available - payment functions disabled");
          setStripeError(true);
          toast({
            title: "Payment system unavailable",
            description: "The payment system is currently offline. Please try again later or contact support.",
            variant: "destructive",
          });
          return;
        }
        
        // Try to get Stripe instance
        const instance = await getStripe();
        if (!instance) {
          console.log("Failed to initialize Stripe instance");
          setStripeError(true);
          toast({
            title: "Payment system unavailable",
            description: "Unable to initialize payment processing. Please try again later.",
            variant: "destructive",
          });
        } else {
          console.log("Stripe loaded successfully");
          setStripeInstance(instance);
        }
      } catch (error) {
        console.error("Error loading Stripe:", error);
        setStripeError(true);
        toast({
          title: "Payment system unavailable",
          description: "Unable to load payment processing. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoadingStripe(false);
      }
    };
    
    loadStripeInstance();
  }, [toast]);

  // Show loading state when loading Stripe
  if (isLoading || loadingStripe) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" aria-label="Loading"/>
      </div>
    );
  }

  // Show error message if there is a Stripe error
  if (stripeError || !clientSecret) {
    return (
      <div className="container max-w-md mx-auto py-12">
        <Card>
          <CardHeader>
            <CardTitle>Payment Unavailable</CardTitle>
            <CardDescription>
              We're unable to process payments at this time.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="mb-6">Please try again later or contact support if the issue persists.</p>
            <Button onClick={() => setLocation('/')}>Return to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle>Complete your payment</CardTitle>
          <CardDescription>
            Secure payment processed by Stripe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Order Summary</h3>
            <div className="flex justify-between border-b pb-2 mb-2">
              <span>Premium Membership</span>
              <span>${amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>${amount.toFixed(2)}</span>
            </div>
          </div>
          
          {/* Safely wrap the form in <Elements> using our loaded Stripe instance */}
          {stripeInstance && (
            <Elements stripe={stripeInstance} options={{ clientSecret }}>
              <CheckoutForm amount={amount} />
            </Elements>
          )}
        </CardContent>
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          <p>Your payment information is encrypted and secure.</p>
        </CardFooter>
      </Card>
    </div>
  );
}