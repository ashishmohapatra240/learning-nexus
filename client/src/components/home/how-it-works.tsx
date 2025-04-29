import { CheckCircle, Building, User, Settings, Sparkles, Shield, Network } from "lucide-react";

export default function HowItWorks() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-slate-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-slate-900">How L&D Nexus Works</h2>
          <div className="h-1 w-20 bg-blue-600 mx-auto mb-6 rounded-full"></div>
          <p className="text-lg text-slate-600">Connecting the right talent with the right opportunities through our specialized marketplace for Learning & Development professionals.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* For Companies */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-blue-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-white rounded-xl shadow-xl p-8 ring-1 ring-slate-200/50 hover:shadow-2xl transition duration-500">
              <div className="bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-2xl w-16 h-16 flex items-center justify-center mb-6 shadow-md">
                <Building className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-800">For Companies</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <CheckCircle className="text-blue-600 h-4 w-4" />
                  </span>
                  <span className="text-slate-700">Post L&D job opportunities and projects</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <CheckCircle className="text-blue-600 h-4 w-4" />
                  </span>
                  <span className="text-slate-700">Find specialized training professionals</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <CheckCircle className="text-blue-600 h-4 w-4" />
                  </span>
                  <span className="text-slate-700">Book consultations and direct services</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <CheckCircle className="text-blue-600 h-4 w-4" />
                  </span>
                  <span className="text-slate-700">Access training resources and materials</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* For L&D Professionals */}
          <div className="relative group mt-8 md:mt-0">
            <div className="absolute -inset-1 bg-gradient-to-r from-slate-700 to-blue-700 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-white rounded-xl shadow-xl p-8 ring-1 ring-slate-200/50 hover:shadow-2xl transition duration-500">
              <div className="bg-gradient-to-br from-slate-800 to-slate-600 text-white rounded-2xl w-16 h-16 flex items-center justify-center mb-6 shadow-md">
                <User className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-800">For L&D Professionals</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 bg-slate-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <CheckCircle className="text-slate-600 h-4 w-4" />
                  </span>
                  <span className="text-slate-700">Create professional showcase profiles</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 bg-slate-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <CheckCircle className="text-slate-600 h-4 w-4" />
                  </span>
                  <span className="text-slate-700">Display certifications and expertise</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 bg-slate-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <CheckCircle className="text-slate-600 h-4 w-4" />
                  </span>
                  <span className="text-slate-700">Offer consultation services</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 bg-slate-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <CheckCircle className="text-slate-600 h-4 w-4" />
                  </span>
                  <span className="text-slate-700">Apply to targeted job opportunities</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Platform Features */}
          <div className="relative group mt-8 md:mt-16">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-slate-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
            <div className="relative bg-white rounded-xl shadow-xl p-8 ring-1 ring-slate-200/50 hover:shadow-2xl transition duration-500">
              <div className="bg-gradient-to-br from-blue-500 to-slate-700 text-white rounded-2xl w-16 h-16 flex items-center justify-center mb-6 shadow-md">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-800">Platform Features</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 bg-blue-50 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <Sparkles className="text-blue-500 h-4 w-4" />
                  </span>
                  <span className="text-slate-700">AI-powered matching system</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 bg-blue-50 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <Shield className="text-blue-500 h-4 w-4" />
                  </span>
                  <span className="text-slate-700">Secure payment processing</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 bg-blue-50 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <Network className="text-blue-500 h-4 w-4" />
                  </span>
                  <span className="text-slate-700">Community forums and networking</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 bg-blue-50 rounded-full flex items-center justify-center mr-3 mt-0.5">
                    <Settings className="text-blue-500 h-4 w-4" />
                  </span>
                  <span className="text-slate-700">Resource hub and knowledge sharing</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
