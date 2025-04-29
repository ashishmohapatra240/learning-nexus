import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  MapPin, 
  Filter, 
  Star,
  ArrowUpDown
} from "lucide-react";
import ProfessionalCard from "@/components/home/professional-card";
import type { ProfessionalProfile, Expertise } from "@shared/schema";

export default function Professionals() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedExpertise, setSelectedExpertise] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("rating");
  const [experienceLevel, setExperienceLevel] = useState<string>("");
  const [rateRange, setRateRange] = useState<[number, number]>([0, 500]);
  
  // Fetch all professionals
  const { 
    data: professionals, 
    isLoading: isLoadingProfessionals,
    error: professionalError
  } = useQuery<ProfessionalProfile[]>({
    queryKey: ["/api/professional-profiles"],
  });
  
  // Fetch all expertise areas for filtering
  const { data: expertise } = useQuery<Expertise[]>({
    queryKey: ["/api/expertise"],
  });
  
  // Filter and sort professionals
  const filteredProfessionals = professionals?.filter(professional => {
    // Search by title, bio or location
    const matchesSearch = !searchTerm || 
      professional.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      professional.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      professional.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by rate range
    const matchesRate = !professional.ratePerHour || 
      (professional.ratePerHour >= rateRange[0] && professional.ratePerHour <= rateRange[1]);

    // Filter by experience level
    const yearsExp = professional.yearsExperience || 0;
    const matchesExperience = !experienceLevel || 
      (experienceLevel === "junior" && (yearsExp <= 2)) ||
      (experienceLevel === "mid-level" && (yearsExp > 2 && yearsExp <= 5)) ||
      (experienceLevel === "senior" && (yearsExp > 5 && yearsExp <= 8)) ||
      (experienceLevel === "expert" && (yearsExp > 8)) ||
      professional.title.toLowerCase().includes(experienceLevel.toLowerCase());

    // For expertise, we just show all if "all" is selected
    const matchesExpertise = selectedExpertise === "all";
    
    return matchesSearch && matchesRate && matchesExperience || matchesExpertise;
  }) || [];
  
  // Sort professionals
  const sortedProfessionals = [...filteredProfessionals].sort((a, b) => {
    if (sortOrder === "rating") {
      const aRating = a.rating || 0;
      const bRating = b.rating || 0;
      return bRating - aRating;
    } else if (sortOrder === "ratePerHour") {
      const aRate = a.ratePerHour || 0;
      const bRate = b.ratePerHour || 0;
      return bRate - aRate;
    }
    // Default sorting by rating
    const aRating = a.rating || 0;
    const bRating = b.rating || 0;
    return bRating - aRating;
  });
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="relative overflow-hidden mb-10 rounded-2xl">
        {/* Background with gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-800 to-blue-800"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iLjUiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCIgb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNNjAgMEgwdjYwaDYweiIvPjwvZz48L3N2Zz4=')] bg-[size:20px_20px]"></div>
        
        <div className="relative p-10 md:p-16 text-white">
          <div className="max-w-4xl">
            <div className="inline-flex items-center bg-blue-600/30 backdrop-blur-sm px-4 py-2 rounded-full text-sm text-blue-100 font-medium mb-6 border border-blue-500/40">
              <Star className="h-4 w-4 mr-2 text-blue-300" />
              <span>Search our curated network of L&D professionals</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
              Find <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-white">Expert L&D Professionals</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl">
              Connect with industry-leading trainers and specialists who can elevate your organization's learning and development initiatives.
            </p>
          </div>
        </div>
      </div>
      
      {/* Search and filter section */}
      <div className="relative mb-8">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-slate-700 rounded-xl blur opacity-20"></div>
        <div className="relative bg-white p-8 rounded-xl shadow-lg ring-1 ring-slate-200/50">
          <h2 className="text-xl font-bold mb-6 text-slate-800 flex items-center gap-2">
            <span className="bg-blue-600/90 h-6 w-1 rounded-full"></span>
            Find Your Perfect Match
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search box */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500" />
              <Input
                placeholder="Search by title, skills, or location..."
                className="pl-10 bg-white border border-slate-200 text-slate-800 focus:border-blue-400 focus:ring-blue-500 placeholder:text-slate-400 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Experience Level filter */}
            <div>
              <Select value={experienceLevel} onValueChange={setExperienceLevel}>
                <SelectTrigger className="w-full bg-white border border-slate-200 text-slate-700 shadow-sm">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4 text-blue-500" />
                    <SelectValue placeholder="Experience level" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white border border-slate-200">
                  <SelectItem value="any" className="text-slate-700 focus:bg-blue-50 focus:text-blue-800">Any Experience Level</SelectItem>
                  <SelectItem value="junior" className="text-slate-700 focus:bg-blue-50 focus:text-blue-800">Junior (0-2 years)</SelectItem>
                  <SelectItem value="mid-level" className="text-slate-700 focus:bg-blue-50 focus:text-blue-800">Mid Level (2-5 years)</SelectItem>
                  <SelectItem value="senior" className="text-slate-700 focus:bg-blue-50 focus:text-blue-800">Senior (5-8 years)</SelectItem>
                  <SelectItem value="expert" className="text-slate-700 focus:bg-blue-50 focus:text-blue-800">Expert (8+ years)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Expertise filter */}
            <div>
              <Select value={selectedExpertise} onValueChange={setSelectedExpertise}>
                <SelectTrigger className="w-full bg-white border border-slate-200 text-slate-700 shadow-sm">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4 text-blue-500" />
                    <SelectValue placeholder="Filter by expertise" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white border border-slate-200">
                  <SelectItem value="all" className="text-slate-700 focus:bg-blue-50 focus:text-blue-800">All Expertise</SelectItem>
                  {expertise?.map((exp) => (
                    <SelectItem key={exp.id} value={exp.name} className="text-slate-700 focus:bg-blue-50 focus:text-blue-800">
                      {exp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Sort options */}
            <div>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-full bg-white border border-slate-200 text-slate-700 shadow-sm">
                  <div className="flex items-center">
                    <ArrowUpDown className="mr-2 h-4 w-4 text-blue-500" />
                    <SelectValue placeholder="Sort by" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white border border-slate-200">
                  <SelectItem value="rating" className="text-slate-700 focus:bg-blue-50 focus:text-blue-800">Highest Rated</SelectItem>
                  <SelectItem value="ratePerHour" className="text-slate-700 focus:bg-blue-50 focus:text-blue-800">Hourly Rate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Rate range filter */}
      <div className="relative mb-8">
        <div className="absolute -inset-1 bg-gradient-to-r from-slate-700 to-blue-600 rounded-xl blur opacity-20"></div>
        <div className="relative bg-white p-8 rounded-xl shadow-lg ring-1 ring-slate-200/50">
          <label className="block text-lg font-bold mb-4 text-slate-800 flex items-center gap-2">
            <span className="bg-slate-700/90 h-6 w-1 rounded-full"></span>
            Hourly Rate Range ($)
          </label>
          <div className="flex items-center gap-6">
            <input
              type="range"
              min="0"
              max="500"
              value={rateRange[0]}
              onChange={(e) => setRateRange([parseInt(e.target.value), rateRange[1]])}
              className="w-full accent-blue-600"
            />
            <input
              type="range"
              min="0"
              max="500"
              value={rateRange[1]}
              onChange={(e) => setRateRange([rateRange[0], parseInt(e.target.value)])}
              className="w-full accent-blue-600"
            />
            <span className="text-md font-medium bg-gradient-to-r from-slate-800 to-blue-700 text-white px-6 py-2 rounded-md min-w-[120px] text-center shadow-md">
              ${rateRange[0]} - ${rateRange[1]}
            </span>
          </div>
        </div>
      </div>

      {/* Results count and filters */}
      <div className="relative mb-8">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-700 to-slate-800 rounded-lg blur opacity-10"></div>
        <div className="relative flex justify-between items-center bg-white p-6 rounded-lg shadow-md ring-1 ring-slate-200/50">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600/90 h-10 w-1 rounded-full"></div>
            <p className="text-slate-700 font-medium">
              <span className="font-bold text-xl text-blue-700">{sortedProfessionals.length}</span> professionals found
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => {
              setSearchTerm("");
              setSelectedExpertise("all");
              setExperienceLevel("");
              setRateRange([0, 500]);
            }}
            className="border-slate-300 bg-white hover:bg-slate-100 text-slate-700 font-medium shadow-sm"
          >
            Clear All Filters
          </Button>
        </div>
      </div>
      
      {/* Professionals listing */}
      <div className="space-y-6">
        {isLoadingProfessionals ? (
          // Loading skeletons
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-slate-500/30 to-blue-500/30 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
                <Card className="relative rounded-xl shadow-lg ring-1 ring-slate-200/50 overflow-hidden h-96 bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center mb-4">
                      <Skeleton className="h-16 w-16 rounded-full bg-slate-200/60" />
                      <div className="ml-4 space-y-2">
                        <Skeleton className="h-5 w-48 bg-slate-200/60" />
                        <Skeleton className="h-4 w-32 bg-slate-200/60" />
                        <Skeleton className="h-4 w-24 bg-slate-200/60" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <Skeleton className="h-4 w-full bg-slate-200/60" />
                      <Skeleton className="h-4 w-full bg-slate-200/60" />
                      <Skeleton className="h-4 w-3/4 bg-slate-200/60" />
                      <div className="flex flex-wrap gap-2">
                        <Skeleton className="h-7 w-20 rounded-full bg-slate-200/60" />
                        <Skeleton className="h-7 w-28 rounded-full bg-slate-200/60" />
                        <Skeleton className="h-7 w-24 rounded-full bg-slate-200/60" />
                      </div>
                      <div className="mt-8">
                        <Skeleton className="h-10 w-full bg-slate-200/60 rounded-md" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        ) : professionalError ? (
          // Error state
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-red-500/30 to-slate-500/30 rounded-xl blur opacity-30"></div>
            <Card className="relative bg-white rounded-xl shadow-lg overflow-hidden ring-1 ring-slate-200/50">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <div className="bg-red-50 p-4 rounded-full mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Connection Error</h3>
                <p className="text-slate-600 mb-6 text-center max-w-md">
                  Failed to load professionals. This could be due to a network issue or server problem.
                </p>
                <Button 
                  onClick={() => window.location.reload()} 
                  className="bg-gradient-to-r from-slate-800 to-blue-700 hover:from-slate-900 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Retry Connection
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : sortedProfessionals.length > 0 ? (
          // Professional cards
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProfessionals.map((professional) => (
              <ProfessionalCard key={professional.id} professional={professional} />
            ))}
          </div>
        ) : (
          // Empty state
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-slate-500/20 rounded-xl blur opacity-30"></div>
            <Card className="relative bg-white rounded-xl shadow-lg overflow-hidden ring-1 ring-slate-200/50">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <div className="bg-blue-50 p-4 rounded-full mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No Results Found</h3>
                <p className="text-slate-600 mb-6 text-center max-w-md">
                  No professionals match your current filter criteria. Try adjusting your filters or broadening your search.
                </p>
                <Button 
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedExpertise("all");
                    setExperienceLevel("");
                    setRateRange([0, 500]);
                  }}
                  className="bg-gradient-to-r from-slate-700 to-blue-600 hover:from-slate-800 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Reset All Filters
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      
      {/* Pagination (simplified for now) */}
      {sortedProfessionals.length > 0 && (
        <div className="relative mt-10">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-slate-700 rounded-xl blur opacity-20"></div>
          <div className="relative bg-white p-6 rounded-xl shadow-md ring-1 ring-slate-200/50 flex justify-center">
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm"
              >
                Previous
              </Button>
              
              <Button 
                variant="default" 
                className="bg-gradient-to-r from-blue-700 to-slate-800 text-white shadow-md border-none hover:opacity-90"
              >
                1
              </Button>
              
              <Button 
                variant="outline" 
                className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm"
              >
                2
              </Button>
              
              <Button 
                variant="outline" 
                className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm"
              >
                3
              </Button>
              
              <Button 
                variant="outline" 
                className="border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-sm"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
