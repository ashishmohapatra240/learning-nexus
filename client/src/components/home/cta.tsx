import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Star, Users, LightbulbIcon } from "lucide-react";

export default function CTA() {
  const { user } = useAuth();

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background with subtle patterns */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-slate-100"></div>
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="relative max-w-6xl mx-auto">
          {/* Design elements */}
          <div className="absolute -top-10 -left-10 w-24 h-24 bg-blue-500 opacity-10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-slate-700 opacity-10 rounded-full blur-3xl"></div>
          
          <div className="relative bg-gradient-to-br from-slate-900 to-blue-900 rounded-2xl shadow-2xl overflow-hidden">
            {/* Radial gradient overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent"></div>
            
            <div className="md:flex items-stretch">
              <div className="md:w-2/3 p-10 lg:p-14 text-white">
                <div className="inline-flex items-center bg-blue-900/50 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-blue-200 font-medium mb-8 border border-blue-700/40">
                  <Star className="h-4 w-4 mr-2 text-blue-400" />
                  <span>Join thousands of L&D professionals worldwide</span>
                </div>
                
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                  Ready to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-white">Transform</span> Your Learning & Development?
                </h2>
                
                <div className="space-y-4 mb-10">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-blue-800/50 rounded-lg p-2 mt-1 mr-4">
                      <Users className="h-5 w-5 text-blue-300" />
                    </div>
                    <p className="text-blue-50">
                      Connect with top L&D professionals that perfectly match your organization's needs
                    </p>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 bg-blue-800/50 rounded-lg p-2 mt-1 mr-4">
                      <LightbulbIcon className="h-5 w-5 text-blue-300" />
                    </div>
                    <p className="text-blue-50">
                      Showcase your expertise and find high-quality L&D opportunities with leading companies
                    </p>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                  {user ? (
                    <Link href={user.userType === "professional" ? "/professional-dashboard" : "/company-dashboard"}>
                      <Button size="lg" className="bg-white hover:bg-blue-50 text-blue-900 font-semibold shadow-lg hover:shadow-xl border-none transition-all duration-300 hover:-translate-y-0.5 w-full sm:w-auto">
                        Go to Dashboard
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Link href="/register">
                        <Button size="lg" className="bg-white hover:bg-blue-50 text-blue-900 font-semibold shadow-lg hover:shadow-xl border-none transition-all duration-300 hover:-translate-y-0.5 w-full sm:w-auto">
                          Create Account
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                      <Link href="/professionals">
                        <Button size="lg" variant="outline" className="border-2 border-blue-400 bg-transparent text-white hover:bg-white/10 font-semibold transition-all duration-300 w-full sm:w-auto">
                          Explore Professionals
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </div>
              
              <div className="md:w-1/3 hidden md:block relative">
                {/* Gradient overlay on image */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-transparent z-10"></div>
                <img 
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                  alt="L&D professionals collaborating" 
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            
            {/* Bottom badge removed */}
          </div>
        </div>
      </div>
    </section>
  );
}
