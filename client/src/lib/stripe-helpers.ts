import { loadStripe, Stripe } from '@stripe/stripe-js';

// Add type definitions for the global Stripe object on window
declare global {
  interface Window {
    // Use a more specific type that doesn't conflict with the imported Stripe type
    Stripe?: any; // Using any to avoid type conflicts
  }
}

// Global reference to Stripe Promise
let stripePromise: Promise<Stripe | null> | null = null;

// Declare a global error handler for unhandled promise rejections
// This helps catch any unexpected promise rejections that might slip through our handling
window.addEventListener('unhandledrejection', (event) => {
  // Check if this is a Stripe-related error
  if (event.reason && 
      event.reason.message && 
      typeof event.reason.message === 'string' && 
      event.reason.message.includes('Stripe')) {
    console.warn('Caught unhandled Stripe promise rejection:', event.reason);
    
    // Prevent the error from propagating to the console as an unhandled rejection
    event.preventDefault();
    
    // Reset the stripePromise so next attempt will try to load again
    stripePromise = null;
  }
});

/**
 * Safely loads the Stripe.js script manually before initializing Stripe
 * This gives us more control over the loading process and error handling
 */
function loadStripeScript(publicKey: string): Promise<Stripe | null> {
  return new Promise((resolve) => {
    try {
      // Check if Stripe is already loaded on the window
      if (window.Stripe) {
        console.log('Stripe already available on window');
        try {
          resolve(window.Stripe(publicKey));
        } catch (err) {
          console.error('Error creating Stripe instance:', err);
          resolve(null);
        }
        return;
      }

      // Create script element
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.type = 'text/javascript';
      script.async = true;
      
      // Set up load and error handlers
      script.onload = () => {
        try {
          if (window.Stripe) {
            resolve(window.Stripe(publicKey));
          } else {
            console.error('Stripe.js loaded but Stripe not available on window');
            resolve(null);
          }
        } catch (err) {
          console.error('Error creating Stripe instance after script load:', err);
          resolve(null);
        }
      };
      
      script.onerror = () => {
        console.error('Failed to load Stripe.js script');
        resolve(null);
      };
      
      // Add the script to the document
      document.head.appendChild(script);
    } catch (err) {
      console.error('Error setting up Stripe script:', err);
      resolve(null);
    }
  });
}

/**
 * Loads the Stripe.js library with enhanced error handling
 * Returns a promise that always resolves (either with a Stripe instance or null)
 */
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
    
    if (!stripeKey) {
      console.warn('Missing Stripe public key - stripe features will be disabled');
      return Promise.resolve(null);
    }
    
    // Use our custom manual script loader as fallback
    stripePromise = new Promise((resolve) => {
      try {
        // First try the standard loadStripe method
        loadStripe(stripeKey)
          .then(stripeInstance => {
            if (stripeInstance) {
              console.log('Stripe loaded successfully with loadStripe');
              resolve(stripeInstance);
            } else {
              console.warn('loadStripe returned null, falling back to manual script loading');
              // If it fails, try our manual script loader
              loadStripeScript(stripeKey).then(resolve);
            }
          })
          .catch(error => {
            console.error('Error with loadStripe, falling back to manual script loading:', error);
            // If it fails, try our manual script loader
            loadStripeScript(stripeKey).then(resolve);
          });
      } catch (error) {
        console.error('Exception loading Stripe.js:', error);
        // If everything fails, resolve with null
        resolve(null);
      }
    });
  }
  
  return stripePromise;
}

/**
 * Checks if Stripe is available and the environment is configured correctly
 * @param {boolean} suppressConsoleError - Whether to suppress console error logging
 * @returns {boolean} - Whether Stripe is available
 */
export function isStripeAvailable(suppressConsoleError = false): boolean {
  const stripeKeyAvailable = !!import.meta.env.VITE_STRIPE_PUBLIC_KEY;
  
  if (!stripeKeyAvailable && !suppressConsoleError) {
    console.error('Stripe public key is not available. Set the VITE_STRIPE_PUBLIC_KEY environment variable.');
  }
  
  return stripeKeyAvailable;
}

/**
 * Helper function to format currency amounts
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}