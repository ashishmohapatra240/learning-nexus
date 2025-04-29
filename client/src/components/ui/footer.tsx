import { Link } from "wouter";
import { Facebook, Twitter, Linkedin, Instagram, Mail, MapPin, Phone, ChevronRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white pt-16 pb-8 overflow-hidden relative">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iLjUiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCIgb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNNjAgMEgwdjYwaDYweiIvPjwvZz48L3N2Zz4=')] bg-[size:20px_20px]"></div>
      
      {/* Gradient Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-700/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
      
      <div className="container mx-auto px-4 relative">
      
        {/* Footer Top - Newsletter */}
        <div className="lg:flex items-center justify-between bg-gradient-to-br from-blue-900/80 to-slate-800/80 p-8 rounded-2xl backdrop-blur-sm mb-16 border border-slate-700/50 shadow-lg">
          <div className="lg:w-1/2 mb-6 lg:mb-0 lg:pr-8">
            <h3 className="text-2xl font-bold mb-3 text-white">Stay updated with L&D trends</h3>
            <p className="text-slate-300">
              Join our newsletter to receive the latest insights, resources, and opportunities.
            </p>
          </div>
          <div className="lg:w-1/2">
            <div className="flex flex-col sm:flex-row gap-3">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-grow px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 px-6 border-none">
                Subscribe
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Main Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-12 mb-12">
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white font-bold text-lg p-2 rounded-lg mr-2">
                L&D
              </div>
              <span className="text-white font-bold text-2xl">Nexus</span>
            </div>
            <p className="text-slate-300 mb-6 max-w-md">
              Connecting learning & development professionals with organizations to create impactful training solutions. Our platform helps organizations find the right expertise and professionals showcase their skills.
            </p>
            <div className="space-y-3">
              <div className="flex items-start">
                <MapPin className="text-blue-400 h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-slate-300">123 Innovation Drive, San Francisco, CA 94103</span>
              </div>
              <div className="flex items-start">
                <Mail className="text-blue-400 h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-slate-300">contact@ldnexus.com</span>
              </div>
              <div className="flex items-start">
                <Phone className="text-blue-400 h-5 w-5 mt-0.5 mr-3 flex-shrink-0" />
                <span className="text-slate-300">+1 (555) 123-4567</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-5 text-white flex items-center">
              <span className="bg-blue-800/50 h-6 w-1 mr-3 rounded-full"></span>
              Platform
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/professionals" className="text-slate-300 hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  For Professionals
                </Link>
              </li>
              <li>
                <Link href="/jobs" className="text-slate-300 hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  For Companies
                </Link>
              </li>
              <li>
                <Link href="/subscribe" className="text-slate-300 hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Pricing Plans
                </Link>
              </li>
              <li>
                <Link href="/#testimonials" className="text-slate-300 hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Success Stories
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-slate-300 hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Resources
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-5 text-white flex items-center">
              <span className="bg-blue-800/50 h-6 w-1 mr-3 rounded-full"></span>
              Company
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Press
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Contact
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-5 text-white flex items-center">
              <span className="bg-blue-800/50 h-6 w-1 mr-3 rounded-full"></span>
              Support
            </h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Trust & Safety
                </a>
              </li>
              <li>
                <a href="#" className="text-slate-300 hover:text-white transition-colors flex items-center group">
                  <ChevronRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                  Accessibility
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex flex-wrap justify-center gap-6 mb-10">
          <a href="#" className="bg-slate-800 hover:bg-blue-800 text-white p-3 rounded-full transition-colors">
            <Facebook size={20} />
          </a>
          <a href="#" className="bg-slate-800 hover:bg-blue-800 text-white p-3 rounded-full transition-colors">
            <Twitter size={20} />
          </a>
          <a href="#" className="bg-slate-800 hover:bg-blue-800 text-white p-3 rounded-full transition-colors">
            <Linkedin size={20} />
          </a>
          <a href="#" className="bg-slate-800 hover:bg-blue-800 text-white p-3 rounded-full transition-colors">
            <Instagram size={20} />
          </a>
        </div>

        {/* Bottom Copyright */}
        <div className="border-t border-slate-800 pt-8 mt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} L&D Nexus. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">Terms of Service</a>
              <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">Cookies</a>
              <a href="#" className="text-slate-400 hover:text-white text-sm transition-colors">GDPR</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}