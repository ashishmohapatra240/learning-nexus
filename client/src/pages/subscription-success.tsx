import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function SubscriptionSuccess() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [subscriptionDetails, setSubscriptionDetails] = useState<{
    tier: string;
    status: string;
    nextBillingDate?: string;
  } | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchSubscriptionStatus = async () => {
      try {
        const response = await apiRequest('GET', '/api/subscription-status');
        
        // Check specifically for 404 which means no subscription (not an error)
        if (response.status === 404) {
          console.log("No subscription found on subscription success page");
          setSubscriptionDetails(null);
          return;
        }
        
        if (response.ok) {
          const data = await response.json();
          setSubscriptionDetails(data);
        } else {
          // For other error types
          let errorMessage = "Could not verify subscription status.";
          try {
            const errorData = await response.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            // If we can't parse JSON, use the status text
            errorMessage = response.statusText || errorMessage;
          }
          
          toast({
            title: 'Error',
            description: errorMessage,
            variant: 'destructive',
          });
        }
      } catch (error: any) {
        // Don't show toast for network issues that will auto-retry
        if (!error.message?.includes("Network connection issue")) {
          toast({
            title: 'Error',
            description: error.message || 'An unexpected error occurred.',
            variant: 'destructive',
          });
        }
      } finally {
        setLoading(false);
      }
    };

    // Check if payment was successful from URL params
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment_status');
    const paymentIntent = urlParams.get('payment_intent');
    const redirectStatus = urlParams.get('redirect_status');
    
    const handleSuccessfulPayment = async () => {
      // If we have a successful payment or redirect status, update subscription
      if ((paymentStatus === 'success' || redirectStatus === 'succeeded') && paymentIntent) {
        try {
          console.log('Payment success detected, updating subscription status');
          // Default to basic tier if we don't have specific info
          const tier = localStorage.getItem('selectedSubscriptionTier') || 'basic';
          
          // Update subscription based on the successful payment
          const updateResponse = await apiRequest('POST', '/api/update-subscription', {
            tierId: tier,
            status: 'active',
            paymentIntentId: paymentIntent
          });
          
          if (updateResponse.ok) {
            console.log('Subscription updated successfully');
          } else {
            console.error('Failed to update subscription');
          }
        } catch (error) {
          console.error('Error updating subscription:', error);
        }
      }
      
      // Fetch subscription status regardless of payment param
      fetchSubscriptionStatus();
    };
    
    handleSuccessfulPayment();
  }, [user, navigate, toast]);

  const handleDashboardClick = () => {
    if (user?.userType === 'professional') {
      navigate('/professional-dashboard');
    } else if (user?.userType === 'company') {
      navigate('/company-dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="container max-w-2xl mx-auto py-16 px-4">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto w-16 h-16 flex items-center justify-center bg-green-100 rounded-full mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Subscription Complete!</CardTitle>
          <CardDescription>
            Thank you for subscribing to the L&D Nexus platform.
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {loading ? (
            <div className="py-8 flex justify-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : subscriptionDetails ? (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium">Subscription Details</p>
                <div className="mt-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-left text-gray-500">Plan:</div>
                    <div className="text-right font-medium capitalize">{subscriptionDetails.tier} Plan</div>
                    
                    <div className="text-left text-gray-500">Status:</div>
                    <div className="text-right font-medium capitalize">{subscriptionDetails.status}</div>
                    
                    {subscriptionDetails.nextBillingDate && (
                      <>
                        <div className="text-left text-gray-500">Next Billing Date:</div>
                        <div className="text-right font-medium">
                          {new Date(subscriptionDetails.nextBillingDate).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <p>
                You now have access to all features included in your subscription plan.
                Visit your dashboard to explore the platform's capabilities.
              </p>
            </div>
          ) : (
            <p className="py-4">
              Your subscription has been processed successfully. You can now enjoy all the benefits
              of your subscription plan.
            </p>
          )}
        </CardContent>
        
        <CardFooter className="flex flex-col space-y-2">
          <Button onClick={handleDashboardClick} className="w-full">
            Go to Dashboard
          </Button>
          <Button variant="outline" onClick={() => navigate('/')} className="w-full">
            Return to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}