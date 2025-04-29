import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest, queryClient } from "@/lib/queryClient";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  MessageSquare, 
  ThumbsUp, 
  User, 
  ChevronDown, 
  ChevronUp,
  Building,
  Send,
  Loader2
} from "lucide-react";
import type { ForumPost, ForumComment, User as UserType } from "@shared/schema";

export default function ForumPosts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [expandedPosts, setExpandedPosts] = useState<number[]>([]);
  const [commentInputs, setCommentInputs] = useState<Record<number, string>>({});
  const [submittingComment, setSubmittingComment] = useState<number | null>(null);

  // Fetch forum posts
  const { 
    data: posts, 
    isLoading: isLoadingPosts 
  } = useQuery<ForumPost[]>({
    queryKey: ["/api/forum-posts"],
  });

  // Fetch comments for expanded posts
  const { 
    data: commentsMap, 
    isLoading: isLoadingComments 
  } = useQuery<Record<number, ForumComment[]>>({
    queryKey: ["/api/forum-comments", expandedPosts],
    enabled: expandedPosts.length > 0,
    queryFn: async () => {
      const results: Record<number, ForumComment[]> = {};
      
      for (const postId of expandedPosts) {
        try {
          const response = await fetch(`/api/forum-posts/${postId}/comments`, {
            credentials: "include",
          });
          
          if (!response.ok) {
            throw new Error(`Failed to fetch comments for post ${postId}`);
          }
          
          results[postId] = await response.json();
        } catch (error) {
          console.error(`Error fetching comments for post ${postId}:`, error);
          results[postId] = [];
        }
      }
      
      return results;
    }
  });

  // Fetch user details for posts and comments
  const { data: userMap } = useQuery<Record<number, UserType>>({
    queryKey: ["/api/users/batch", posts],
    enabled: !!posts && posts.length > 0,
    queryFn: async () => {
      const results: Record<number, UserType> = {};
      
      if (!posts) return results;
      
      const userIds = new Set<number>();
      posts.forEach(post => userIds.add(post.authorId));
      
      if (commentsMap) {
        Object.values(commentsMap).flat().forEach(comment => {
          userIds.add(comment.authorId);
        });
      }
      
      // Use the batch endpoint to get all users at once
      try {
        // Filter out any invalid IDs
        const userIdsArray = Array.from(userIds).filter(id => typeof id === 'number' && !isNaN(id));
        
        if (userIdsArray.length === 0) {
          console.log("No valid user IDs to fetch for forum");
          return results;
        }
        
        console.log("Fetching forum users for IDs:", userIdsArray);
        
        const response = await fetch(`/api/users/batch?userIds=${JSON.stringify(userIdsArray)}`, {
          credentials: "include"
        });
        
        if (!response.ok) {
          console.error("Error fetching forum users:", await response.text());
          return results;
        }
        
        const users = await response.json();
        
        if (!Array.isArray(users)) {
          console.error("Expected users array but got:", typeof users);
          return results;
        }
        
        // Index users by ID for easy lookup
        users.forEach((user: UserType) => {
          if (user && typeof user.id === 'number') {
            results[user.id] = user;
          }
        });
      } catch (error) {
        console.error("Error fetching forum users:", error);
      }
      
      return results;
    }
  });

  const toggleExpandPost = (postId: number) => {
    if (expandedPosts.includes(postId)) {
      setExpandedPosts(expandedPosts.filter(id => id !== postId));
    } else {
      setExpandedPosts([...expandedPosts, postId]);
    }
  };

  const handleCommentInputChange = (postId: number, value: string) => {
    setCommentInputs({
      ...commentInputs,
      [postId]: value
    });
  };

  const handleSubmitComment = async (postId: number) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to sign in to post comments",
        variant: "destructive"
      });
      return;
    }

    const comment = commentInputs[postId];
    if (!comment || comment.trim() === "") {
      toast({
        title: "Empty comment",
        description: "Please enter a comment",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmittingComment(postId);
      
      await apiRequest("POST", `/api/forum-posts/${postId}/comments`, {
        content: comment,
        postId,
        authorId: user.id
      });
      
      // Clear input
      setCommentInputs({
        ...commentInputs,
        [postId]: ""
      });
      
      // Invalidate queries to update UI
      queryClient.invalidateQueries({ queryKey: ["/api/forum-comments", expandedPosts] });
      
      toast({
        title: "Comment added",
        description: "Your comment was posted successfully"
      });
    } catch (error) {
      console.error("Failed to submit comment:", error);
      toast({
        title: "Failed to submit comment",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setSubmittingComment(null);
    }
  };

  if (isLoadingPosts) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-start gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-28" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium mb-2">No discussions yet</h3>
        <p className="text-gray-500 mb-6">Be the first to start a discussion in the community</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => {
        const isExpanded = expandedPosts.includes(post.id);
        const postComments = commentsMap?.[post.id] || [];
        const author = userMap?.[post.authorId];
        
        return (
          <Card key={post.id}>
            <CardHeader>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  {author?.userType === "company" ? (
                    <Building className="h-5 w-5 text-gray-500" />
                  ) : (
                    <User className="h-5 w-5 text-gray-500" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-lg">
                    {post.title}
                  </CardTitle>
                  <div className="text-sm text-gray-500 mt-1">
                    Posted by {author ? `${author.firstName} ${author.lastName}` : "Unknown"} • {
                      formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
                    }
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="whitespace-pre-line">{post.content}</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4">
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm" className="text-gray-500">
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  Like
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-500" 
                  onClick={() => toggleExpandPost(post.id)}
                >
                  <MessageSquare className="h-4 w-4 mr-1" />
                  {isExpanded ? "Hide Comments" : "Comments"}
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 ml-1" />
                  ) : (
                    <ChevronDown className="h-4 w-4 ml-1" />
                  )}
                </Button>
              </div>
              <div className="text-sm text-gray-500">
                {postComments.length} {postComments.length === 1 ? "comment" : "comments"}
              </div>
            </CardFooter>
            
            {isExpanded && (
              <div className="px-6 pb-6 space-y-4">
                <div className="border-t pt-4">
                  {isLoadingComments ? (
                    <div className="space-y-4">
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <Skeleton className="h-8 w-8 rounded-full" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-36" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-20" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : postComments.length > 0 ? (
                    <div className="space-y-4">
                      {postComments.map((comment) => {
                        const commentAuthor = userMap?.[comment.authorId];
                        
                        return (
                          <div key={comment.id} className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                              {commentAuthor?.userType === "company" ? (
                                <Building className="h-4 w-4 text-gray-500" />
                              ) : (
                                <User className="h-4 w-4 text-gray-500" />
                              )}
                            </div>
                            <div>
                              <div className="bg-muted p-3 rounded-lg">
                                <p className="font-medium text-sm">
                                  {commentAuthor ? `${commentAuthor.firstName} ${commentAuthor.lastName}` : "Unknown"}
                                </p>
                                <p className="text-gray-700 mt-1 text-sm whitespace-pre-line">
                                  {comment.content}
                                </p>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-2">
                      No comments yet. Be the first to comment!
                    </p>
                  )}
                </div>
                
                {user ? (
                  <div className="flex items-start gap-3 mt-4">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      {user.userType === "company" ? (
                        <Building className="h-4 w-4 text-gray-500" />
                      ) : (
                        <User className="h-4 w-4 text-gray-500" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex gap-2">
                        <Textarea
                          placeholder="Write a comment..."
                          className="min-h-0 h-10 py-2 resize-none flex-1"
                          value={commentInputs[post.id] || ""}
                          onChange={(e) => handleCommentInputChange(post.id, e.target.value)}
                        />
                        <Button 
                          size="icon"
                          onClick={() => handleSubmitComment(post.id)}
                          disabled={submittingComment === post.id || !commentInputs[post.id]?.trim()}
                        >
                          {submittingComment === post.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Send className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center mt-4">
                    <p className="text-sm text-gray-500 mb-2">
                      Sign in to join the discussion
                    </p>
                    <Button size="sm" asChild>
                      <a href="/login">Sign In</a>
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
