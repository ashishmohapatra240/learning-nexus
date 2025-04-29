import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, Award, Users, Briefcase, Sparkles } from "lucide-react";

export default function Hero() {
  const { user } = useAuth();

  return (
    <section className="relative overflow-hidden">
      {/* Background gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-blue-900"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-700/20 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-slate-800/40 via-transparent to-transparent"></div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iLjUiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCIgb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNNjAgMEgwdjYwaDYweiIvPjwvZz48L3N2Zz4=')] opacity-30"></div>

      <div className="container mx-auto px-4 py-20 lg:py-32 relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="md:w-1/2 mb-8 md:mb-0">
            <div className="inline-block px-3 py-1 rounded-full bg-blue-900/60 backdrop-blur-sm text-blue-200 text-sm font-medium mb-6 border border-blue-700/50">
              The Premier L&D Marketplace
            </div>
            <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold mb-6 text-white leading-tight">
              Connect With <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-white">Learning & Development</span> Professionals
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl">
              Find expert trainers, post your L&D projects, or showcase your professional expertise - all in one powerful platform built for enterprise.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              {user ? (
                user.isAdmin ? (
                  <Button size="lg" className="font-medium bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 border-none shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 w-full sm:w-auto" asChild>
                    <Link href="/admin-dashboard">
                      Admin Dashboard
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                ) : user.userType === "professional" ? (
                  <Button size="lg" className="font-medium bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 border-none shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 w-full sm:w-auto" asChild>
                    <Link href="/professional-dashboard">
                      My Dashboard
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                ) : (
                  <Button size="lg" className="font-medium bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 border-none shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 w-full sm:w-auto" asChild>
                    <Link href="/company-dashboard">
                      My Dashboard
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                )
              ) : (
                <>
                  <Button size="lg" className="font-medium bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 border-none shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 w-full sm:w-auto" asChild>
                    <Link href="/register?type=company">
                      I'm an Employer
                      <Briefcase className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="font-medium border-2 border-blue-400 text-blue-100 bg-blue-900/20 backdrop-blur-sm hover:bg-blue-800/40 hover:border-blue-300 hover:text-white transition-all duration-300 w-full sm:w-auto" asChild>
                    <Link href="/register?type=professional">
                      I'm an L&D Professional
                      <Award className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                  <div className="mt-4 w-full text-center sm:text-left">
                    <Button variant="ghost" size="sm" className="text-blue-300 hover:text-blue-100 hover:bg-blue-900/40" asChild>
                      <Link href="/admin-login">
                        Admin Login
                      </Link>
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="md:w-1/2 relative">
            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-400 opacity-50 blur-sm"></div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-blue-500/20">
              <img 
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80" 
                alt="L&D professionals collaborating" 
                className="w-full h-auto rounded-2xl"
                width="600"
                height="400"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>

              {/* Feature badges */}
              <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-wrap gap-3 justify-center">
                <div className="bg-blue-900/80 backdrop-blur-sm rounded-full px-4 py-2 flex items-center text-sm text-blue-100 border border-blue-700/50">
                  <Sparkles className="h-4 w-4 mr-2 text-blue-400" />
                  AI-Powered Matching
                </div>
                <div className="bg-blue-900/80 backdrop-blur-sm rounded-full px-4 py-2 flex items-center text-sm text-blue-100 border border-blue-700/50">
                  <Users className="h-4 w-4 mr-2 text-blue-400" />
                  Verified Experts
                </div>
                <div className="bg-blue-900/80 backdrop-blur-sm rounded-full px-4 py-2 flex items-center text-sm text-blue-100 border border-blue-700/50">
                  <Award className="h-4 w-4 mr-2 text-blue-400" />
                  Enterprise Ready
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}