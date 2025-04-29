import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { DragAndDropProvider } from "@/components/dnd";
import { useState, useEffect } from "react";

import Navbar from "@/components/ui/navbar";
import Footer from "@/components/ui/footer";
import { ProtectedRoute } from "@/components/auth/protected-route";
import Home from "@/pages/home";
import Register from "@/pages/register";
import Login from "@/pages/login";
import ForgotPassword from "@/pages/forgot-password";
import ResetPassword from "@/pages/reset-password";
import RecoverUsername from "@/pages/recover-username";
import ProfessionalDashboard from "@/pages/professional-dashboard";
import CompanyDashboard from "@/pages/company-dashboard";
import Professionals from "@/pages/professionals";
import ProfessionalProfile from "@/pages/professional-profile";
import CompanyProfile from "@/pages/company-profile";
import EditProfile from "@/pages/edit-profile";
import Jobs from "@/pages/jobs";
import PostJob from "@/pages/post-job";
import JobDetail from "@/pages/job-detail";
import Resources from "@/pages/resources";
import ManageResources from "@/pages/manage-resources";
import CreateResource from "@/pages/create-resource";
import CareerRecommendations from "@/pages/career-recommendations";
import ResourceDetail from "@/pages/resource-detail";
import Forum from "@/pages/forum";
import Messages from "@/pages/messages";
import Checkout from "@/pages/checkout";
import Subscribe from "@/pages/subscribe";
import SubscriptionSuccess from "@/pages/subscription-success";
import ProfileSuccess from "@/pages/profile-success";
import BookConsultation from "@/pages/book-consultation";
import PageView from "@/pages/page";
import AdminLogin from "@/pages/admin-login";
import AdminIndex from "@/pages/admin/index";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/lib/auth";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/register" component={Register} />
      <Route path="/login" component={Login} />
      <Route path="/forgot-password" component={ForgotPassword} />
      <Route path="/reset-password" component={ResetPassword} />
      <Route path="/recover-username" component={RecoverUsername} />
      <Route path="/professionals" component={Professionals} />
      <Route path="/professional-profile/:id" component={ProfessionalProfile} />
      <Route path="/company-profile/:id" component={CompanyProfile} />
      <Route path="/jobs" component={Jobs} />
      <Route path="/job/:id" component={JobDetail} />
      <Route path="/resources" component={Resources} />
      <Route path="/resource/:id" component={ResourceDetail} />
      <Route path="/forum" component={Forum} />
      <Route path="/pages/:slug" component={PageView} />
      <Route path="/admin-login" component={AdminLogin} />
      {/* Protected routes with user type restrictions */}
      <ProtectedRoute 
        path="/professional-dashboard" 
        component={ProfessionalDashboard} 
        userTypes={["professional"]} 
      />
      <ProtectedRoute 
        path="/company-dashboard" 
        component={CompanyDashboard} 
        userTypes={["company"]} 
      />
      <ProtectedRoute 
        path="/edit-profile" 
        component={EditProfile} 
      />
      <ProtectedRoute 
        path="/post-job" 
        component={PostJob} 
        userTypes={["company"]} 
      />
      <ProtectedRoute 
        path="/manage-resources" 
        component={ManageResources} 
        userTypes={["professional"]} 
      />
      <ProtectedRoute 
        path="/create-resource" 
        component={CreateResource} 
        userTypes={["professional"]} 
      />
      <ProtectedRoute 
        path="/career-recommendations" 
        component={CareerRecommendations} 
        userTypes={["professional"]} 
      />
      <ProtectedRoute 
        path="/messages" 
        component={Messages} 
      />
      <ProtectedRoute 
        path="/checkout" 
        component={Checkout} 
      />
      <ProtectedRoute 
        path="/subscribe" 
        component={Subscribe} 
      />
      <ProtectedRoute 
        path="/subscribe/:tierId" 
        component={Subscribe} 
      />
      <ProtectedRoute 
        path="/subscription-success" 
        component={SubscriptionSuccess} 
      />
      <ProtectedRoute 
        path="/profile-success" 
        component={ProfileSuccess} 
      />
      <ProtectedRoute 
        path="/book-consultation/:id" 
        component={BookConsultation} 
      />
      
      {/* Admin routes */}
      <Route path="/admin" component={AdminIndex} />

      {/* 404 route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  const isAdminRoute = location === "/admin" || location === "/admin-login";
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <DragAndDropProvider>
          <div className="flex flex-col min-h-screen">
            {!isAdminRoute && <Navbar />}
            <main className={`flex-grow ${isAdminRoute ? 'p-0' : ''}`}>
              <Router />
            </main>
            {!isAdminRoute && <Footer />}
          </div>
          <Toaster />
        </DragAndDropProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
