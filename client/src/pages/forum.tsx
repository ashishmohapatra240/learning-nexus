import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus } from "lucide-react";
import ForumPosts from "@/components/forum/forum-posts";
import CreatePostForm from "@/components/forum/create-post-form";

export default function Forum() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Handle category selection
  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };
  
  // Handle create post toggle
  const handleCreatePostClick = () => {
    setShowCreateForm(true);
  };
  
  // Handle post creation success
  const handlePostSuccess = () => {
    setShowCreateForm(false);
    // Scroll to top after creating post
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Community Forum</h1>
          <p className="text-gray-500">Connect with the L&D community</p>
        </div>
        
        {user && !showCreateForm && (
          <Button 
            onClick={handleCreatePostClick}
            className="mt-4 md:mt-0"
          >
            <Plus className="mr-2 h-4 w-4" /> New Discussion
          </Button>
        )}
      </div>
      
      {showCreateForm ? (
        <div className="mb-8">
          <CreatePostForm 
            onSuccess={handlePostSuccess} 
            onCancel={() => setShowCreateForm(false)} 
          />
        </div>
      ) : (
        <>
          {/* Categories */}
          <Tabs 
            defaultValue={selectedCategory} 
            onValueChange={handleCategoryChange}
            className="mb-6"
          >
            <TabsList className="w-full md:w-auto grid grid-cols-4 md:inline-flex">
              <TabsTrigger value="all">All Topics</TabsTrigger>
              <TabsTrigger value="discussion">Discussions</TabsTrigger>
              <TabsTrigger value="question">Questions</TabsTrigger>
              <TabsTrigger value="resource">Resources</TabsTrigger>
            </TabsList>
          </Tabs>
          
          {/* Search */}
          <div className="relative mb-8">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search discussions..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </>
      )}
      
      {/* Forum posts */}
      <ForumPosts />
      
      {/* Mobile create button (fixed at bottom) */}
      {user && !showCreateForm && (
        <div className="md:hidden fixed bottom-6 right-6">
          <Button 
            onClick={handleCreatePostClick}
            size="lg"
            className="rounded-full h-14 w-14 p-0 shadow-lg"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  );
}
