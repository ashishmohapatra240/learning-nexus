import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Menu, User, LogOut, MessageSquare, Settings, BookOpen, Award, Briefcase, Users, Home } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [location] = useLocation();
  const { user, logout } = useAuth();

  // Close mobile menu when changing routes
  useEffect(() => {
    setMobileMenuOpen(false);
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
  };

  const isActive = (path: string) => {
    return location === path;
  };

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-md'}`}>
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white font-bold text-xl p-2 rounded-lg mr-2">
                L&D
              </div>
              <span className="text-slate-800 font-heading font-bold text-2xl">Nexus</span>
            </Link>
            <nav className="hidden md:block ml-10">
              <ul className="flex space-x-6">
                <li>
                  <Link href="/" className={`flex items-center px-3 py-2 rounded-md transition-colors ${isActive("/") 
                    ? "text-blue-700 font-medium bg-blue-50" 
                    : "text-slate-700 hover:text-blue-600 hover:bg-slate-50"}`}>
                    <Home className={`h-4 w-4 mr-1.5 ${isActive("/") ? "text-blue-700" : "text-slate-500"}`} />
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/professionals" className={`flex items-center px-3 py-2 rounded-md transition-colors ${isActive("/professionals") 
                    ? "text-blue-700 font-medium bg-blue-50" 
                    : "text-slate-700 hover:text-blue-600 hover:bg-slate-50"}`}>
                    <Users className={`h-4 w-4 mr-1.5 ${isActive("/professionals") ? "text-blue-700" : "text-slate-500"}`} />
                    Professionals
                  </Link>
                </li>
                <li>
                  <Link href="/jobs" className={`flex items-center px-3 py-2 rounded-md transition-colors ${isActive("/jobs") 
                    ? "text-blue-700 font-medium bg-blue-50" 
                    : "text-slate-700 hover:text-blue-600 hover:bg-slate-50"}`}>
                    <Briefcase className={`h-4 w-4 mr-1.5 ${isActive("/jobs") ? "text-blue-700" : "text-slate-500"}`} />
                    Jobs
                  </Link>
                </li>
                <li>
                  <Link href="/resources" className={`flex items-center px-3 py-2 rounded-md transition-colors ${isActive("/resources") 
                    ? "text-blue-700 font-medium bg-blue-50" 
                    : "text-slate-700 hover:text-blue-600 hover:bg-slate-50"}`}>
                    <BookOpen className={`h-4 w-4 mr-1.5 ${isActive("/resources") ? "text-blue-700" : "text-slate-500"}`} />
                    Resources
                  </Link>
                </li>
                <li>
                  <Link href="/forum" className={`flex items-center px-3 py-2 rounded-md transition-colors ${isActive("/forum") 
                    ? "text-blue-700 font-medium bg-blue-50" 
                    : "text-slate-700 hover:text-blue-600 hover:bg-slate-50"}`}>
                    <MessageSquare className={`h-4 w-4 mr-1.5 ${isActive("/forum") ? "text-blue-700" : "text-slate-500"}`} />
                    Community
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="hidden md:flex items-center space-x-2">
                {user.isAdmin ? (
                  <>
                    <Link href="/admin/dashboard" className="px-3 py-2 text-sm text-blue-700 hover:bg-blue-50 rounded-md transition-colors">
                      Admin Dashboard
                    </Link>
                  </>
                ) : user.userType === "professional" ? (
                  <Link href="/professional-dashboard" className="px-3 py-2 text-sm text-blue-700 hover:bg-blue-50 rounded-md transition-colors">
                    Dashboard
                  </Link>
                ) : (
                  <Link href="/company-dashboard" className="px-3 py-2 text-sm text-blue-700 hover:bg-blue-50 rounded-md transition-colors">
                    Dashboard
                  </Link>
                )}
                <Link href="/messages" className="relative group">
                  <Button variant="ghost" size="sm" className="flex items-center gap-1.5 text-slate-700 hover:text-blue-700 hover:bg-blue-50">
                    <MessageSquare className="h-4 w-4" />
                    <span>Messages</span>
                  </Button>
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-medium text-white">2</span>
                </Link>
                <Link href="/subscribe">
                  <Button variant="ghost" size="sm" className="flex items-center gap-1.5 text-slate-700 hover:text-blue-700 hover:bg-blue-50">
                    <Award className="h-4 w-4" />
                    <span>Upgrade</span>
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative h-9 w-9 rounded-full bg-slate-100 border border-slate-200 text-slate-700 hover:bg-blue-50 hover:text-blue-700">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="rounded-full bg-slate-100 p-1">
                        <User className="h-8 w-8 text-slate-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">{user.username}</div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {user.userType === "professional" ? "L&D Professional" : "Company"}
                        </div>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/edit-profile" className="flex items-center cursor-pointer">
                        <Settings className="mr-2 h-4 w-4 text-slate-500" />
                        <span>Profile Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/manage-resources" className="flex items-center cursor-pointer">
                        <BookOpen className="mr-2 h-4 w-4 text-slate-500" />
                        <span>Manage Resources</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-slate-700 hover:text-blue-700 hover:bg-blue-50">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="bg-gradient-to-r from-blue-700 to-blue-600 text-white border-none shadow-sm hover:shadow-md hover:from-blue-800 hover:to-blue-700 transition-all">
                    Register
                  </Button>
                </Link>
              </div>
            )}
            <button 
              className="md:hidden p-1.5 rounded-md text-slate-700 hover:bg-slate-100" 
              onClick={toggleMobileMenu}
              aria-label="Toggle mobile menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 px-2 bg-white border-t border-slate-100 rounded-b-lg shadow-lg">
            <ul className="space-y-1">
              <li>
                <Link href="/" className={`flex items-center px-3 py-2.5 rounded-md ${isActive("/") 
                  ? "text-blue-700 font-medium bg-blue-50" 
                  : "text-slate-700 hover:text-blue-600 hover:bg-slate-50"}`}>
                  <Home className={`h-5 w-5 mr-3 ${isActive("/") ? "text-blue-700" : "text-slate-500"}`} />
                  Home
                </Link>
              </li>
              <li>
                <Link href="/professionals" className={`flex items-center px-3 py-2.5 rounded-md ${isActive("/professionals") 
                  ? "text-blue-700 font-medium bg-blue-50" 
                  : "text-slate-700 hover:text-blue-600 hover:bg-slate-50"}`}>
                  <Users className={`h-5 w-5 mr-3 ${isActive("/professionals") ? "text-blue-700" : "text-slate-500"}`} />
                  Find Professionals
                </Link>
              </li>
              <li>
                <Link href="/jobs" className={`flex items-center px-3 py-2.5 rounded-md ${isActive("/jobs") 
                  ? "text-blue-700 font-medium bg-blue-50" 
                  : "text-slate-700 hover:text-blue-600 hover:bg-slate-50"}`}>
                  <Briefcase className={`h-5 w-5 mr-3 ${isActive("/jobs") ? "text-blue-700" : "text-slate-500"}`} />
                  Job Board
                </Link>
              </li>
              <li>
                <Link href="/resources" className={`flex items-center px-3 py-2.5 rounded-md ${isActive("/resources") 
                  ? "text-blue-700 font-medium bg-blue-50" 
                  : "text-slate-700 hover:text-blue-600 hover:bg-slate-50"}`}>
                  <BookOpen className={`h-5 w-5 mr-3 ${isActive("/resources") ? "text-blue-700" : "text-slate-500"}`} />
                  Resources
                </Link>
              </li>
              <li>
                <Link href="/forum" className={`flex items-center px-3 py-2.5 rounded-md ${isActive("/forum") 
                  ? "text-blue-700 font-medium bg-blue-50" 
                  : "text-slate-700 hover:text-blue-600 hover:bg-slate-50"}`}>
                  <MessageSquare className={`h-5 w-5 mr-3 ${isActive("/forum") ? "text-blue-700" : "text-slate-500"}`} />
                  Community
                </Link>
              </li>
              
              {user ? (
                <>
                  <li className="pt-2 mt-2 border-t border-slate-100">
                    {user.isAdmin ? (
                      <>
                        <Link href="/admin/dashboard" className={`flex items-center px-3 py-2.5 rounded-md ${isActive("/admin/dashboard") 
                          ? "text-blue-700 font-medium bg-blue-50" 
                          : "text-slate-700 hover:text-blue-600 hover:bg-slate-50"}`}>
                          <Settings className={`h-5 w-5 mr-3 ${isActive("/admin/dashboard") ? "text-blue-700" : "text-slate-500"}`} />
                          Admin Dashboard
                        </Link>
                      </>
                    ) : user.userType === "professional" ? (
                      <Link href="/professional-dashboard" className={`flex items-center px-3 py-2.5 rounded-md ${isActive("/professional-dashboard") 
                        ? "text-blue-700 font-medium bg-blue-50" 
                        : "text-slate-700 hover:text-blue-600 hover:bg-slate-50"}`}>
                        <User className={`h-5 w-5 mr-3 ${isActive("/professional-dashboard") ? "text-blue-700" : "text-slate-500"}`} />
                        Dashboard
                      </Link>
                    ) : (
                      <Link href="/company-dashboard" className={`flex items-center px-3 py-2.5 rounded-md ${isActive("/company-dashboard") 
                        ? "text-blue-700 font-medium bg-blue-50" 
                        : "text-slate-700 hover:text-blue-600 hover:bg-slate-50"}`}>
                        <Briefcase className={`h-5 w-5 mr-3 ${isActive("/company-dashboard") ? "text-blue-700" : "text-slate-500"}`} />
                        Dashboard
                      </Link>
                    )}
                  </li>
                  <li>
                    <Link href="/messages" className={`flex items-center px-3 py-2.5 rounded-md ${isActive("/messages") 
                      ? "text-blue-700 font-medium bg-blue-50" 
                      : "text-slate-700 hover:text-blue-600 hover:bg-slate-50"}`}>
                      <MessageSquare className={`h-5 w-5 mr-3 ${isActive("/messages") ? "text-blue-700" : "text-slate-500"}`} />
                      Messages
                      <span className="ml-auto inline-flex items-center justify-center h-5 w-5 text-xs bg-blue-600 text-white rounded-full">2</span>
                    </Link>
                  </li>
                  <li>
                    <Link href="/subscribe" className={`flex items-center px-3 py-2.5 rounded-md ${isActive("/subscribe") 
                      ? "text-blue-700 font-medium bg-blue-50" 
                      : "text-slate-700 hover:text-blue-600 hover:bg-slate-50"}`}>
                      <Award className={`h-5 w-5 mr-3 ${isActive("/subscribe") ? "text-blue-700" : "text-slate-500"}`} />
                      Upgrade Plan
                    </Link>
                  </li>
                  <li>
                    <Link href="/edit-profile" className={`flex items-center px-3 py-2.5 rounded-md ${isActive("/edit-profile") 
                      ? "text-blue-700 font-medium bg-blue-50" 
                      : "text-slate-700 hover:text-blue-600 hover:bg-slate-50"}`}>
                      <Settings className={`h-5 w-5 mr-3 ${isActive("/edit-profile") ? "text-blue-700" : "text-slate-500"}`} />
                      Profile Settings
                    </Link>
                  </li>
                  <li>
                    <Link href="/manage-resources" className={`flex items-center px-3 py-2.5 rounded-md ${isActive("/manage-resources") 
                      ? "text-blue-700 font-medium bg-blue-50" 
                      : "text-slate-700 hover:text-blue-600 hover:bg-slate-50"}`}>
                      <BookOpen className={`h-5 w-5 mr-3 ${isActive("/manage-resources") ? "text-blue-700" : "text-slate-500"}`} />
                      Manage Resources
                    </Link>
                  </li>
                  <li className="pt-2 mt-2 border-t border-slate-100">
                    <button 
                      onClick={handleLogout}
                      className="flex items-center w-full px-3 py-2.5 rounded-md text-red-500 hover:bg-red-50"
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      Log Out
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li className="pt-2 mt-2 border-t border-slate-100">
                    <Link href="/login" className="flex items-center px-3 py-2.5 rounded-md text-slate-700 hover:text-blue-600 hover:bg-slate-50">
                      <User className="h-5 w-5 mr-3 text-slate-500" />
                      Sign In
                    </Link>
                  </li>
                  <li className="mt-3 px-3">
                    <Link href="/register" className="block w-full text-center py-2.5 bg-gradient-to-r from-blue-700 to-blue-600 hover:from-blue-800 hover:to-blue-700 text-white font-medium rounded-md shadow-sm">
                      Register
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
