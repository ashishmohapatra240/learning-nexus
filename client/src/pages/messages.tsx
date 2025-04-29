import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { Search, User, Building } from "lucide-react";
import MessageThread from "@/components/messaging/message-thread";
import type { Message, User as UserType } from "@shared/schema";

export default function Messages() {
  const [, setLocation] = useLocation();
  const { user, isLoading: isLoadingAuth } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  
  // Get user from query parameters
  const params = new URLSearchParams(window.location.search);
  const userIdParam = params.get("user");
  const professionalIdParam = params.get("professional");
  const companyIdParam = params.get("company");
  
  // Fetch all messages for current user
  const { 
    data: messages, 
    isLoading: isLoadingMessages 
  } = useQuery<Message[]>({
    queryKey: ["/api/messages"],
    enabled: !!user,
  });
  
  // Fetch user details for all message contacts
  const { 
    data: users 
  } = useQuery<UserType[]>({
    queryKey: ["/api/users/batch"],
    enabled: !!messages && messages.length > 0,
    queryFn: async () => {
      try {
        // Extract unique user IDs from messages, filter out invalid IDs
        const userIds = messages ? 
          Array.from(new Set([
            ...messages.map(msg => msg.senderId),
            ...messages.map(msg => msg.receiverId)
          ])).filter(id => typeof id === 'number' && !isNaN(id)) : [];
        
        if (userIds.length === 0) {
          console.log("No valid user IDs to fetch for messages");
          return [];
        }
        
        console.log("Fetching users for messages:", userIds);
        
        // Fetch user details based on the IDs
        const response = await fetch(`/api/users/batch?userIds=${JSON.stringify(userIds)}`, {
          credentials: "include"
        });
        
        if (!response.ok) {
          console.error("Error fetching users for messages:", await response.text());
          return [];
        }
        
        const data = await response.json();
        
        if (!Array.isArray(data)) {
          console.error("Expected users array but got:", typeof data);
          return [];
        }
        
        return data;
      } catch (error) {
        console.error("Error processing users for messages:", error);
        return [];
      }
    }
  });
  
  // Set selected user from URL params if provided
  useEffect(() => {
    if (userIdParam) {
      setSelectedUserId(parseInt(userIdParam));
    } else if (professionalIdParam || companyIdParam) {
      // In a real app, we'd convert professional/company ID to user ID
      // For now, we'll redirect to the messages page without a parameter
      setLocation("/messages");
    }
  }, [userIdParam, professionalIdParam, companyIdParam, setLocation]);
  
  // Redirect if not logged in
  useEffect(() => {
    if (!isLoadingAuth && !user) {
      setLocation("/login?redirect=/messages");
    }
  }, [user, isLoadingAuth, setLocation]);
  
  // Get unique contacts from messages
  const contacts = messages ? 
    Array.from(new Set(
      messages.map(msg => 
        msg.senderId === user?.id ? msg.receiverId : msg.senderId
      )
    )).map(contactId => {
      // Get the latest message with this contact
      const latestMessage = [...messages]
        .filter(msg => 
          (msg.senderId === contactId && msg.receiverId === user?.id) ||
          (msg.receiverId === contactId && msg.senderId === user?.id)
        )
        .sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )[0];
      
      // Get user details
      const contactUser = users?.find(u => u.id === contactId);
      
      return {
        id: contactId,
        name: contactUser ? `${contactUser.firstName} ${contactUser.lastName}` : `User #${contactId}`,
        userType: contactUser?.userType || "unknown",
        lastMessage: latestMessage?.content || "",
        lastMessageTime: latestMessage?.createdAt || new Date(),
        unread: messages.filter(msg => 
          msg.senderId === contactId && 
          msg.receiverId === user?.id && 
          !msg.read
        ).length
      };
    }) : [];
  
  // Filter contacts by search term
  const filteredContacts = contacts.filter(contact => 
    !searchTerm || 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort contacts by last message time
  const sortedContacts = [...filteredContacts].sort(
    (a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime()
  );
  
  if (isLoadingAuth) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return null; // Will redirect via useEffect
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Messages</h1>
          <p className="text-gray-500">Communicate with professionals and companies</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[70vh]">
        {/* Contacts list */}
        <Card className="md:col-span-1">
          <CardHeader className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search messages..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-auto max-h-[600px]">
            {isLoadingMessages ? (
              // Loading skeletons
              <div className="space-y-1">
                {[...Array(5)].map((_, index) => (
                  <div key={index} className="p-4 border-b hover:bg-gray-50">
                    <div className="flex items-start">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="ml-3 space-y-2 flex-grow">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                  </div>
                ))}
              </div>
            ) : sortedContacts.length === 0 ? (
              // Empty state
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <p className="text-gray-500 mb-2">No messages yet</p>
                <p className="text-sm text-gray-400">
                  Start a conversation by visiting a professional's or company's profile
                </p>
              </div>
            ) : (
              // Contact list
              <div>
                {sortedContacts.map((contact) => (
                  <div 
                    key={contact.id}
                    className={`p-4 border-b hover:bg-gray-50 cursor-pointer ${
                      selectedUserId === contact.id ? 'bg-gray-50' : ''
                    }`}
                    onClick={() => setSelectedUserId(contact.id)}
                  >
                    <div className="flex items-start">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        {contact.userType === "company" ? (
                          <Building className="h-5 w-5 text-gray-500" />
                        ) : (
                          <User className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      <div className="ml-3 flex-grow">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{contact.name}</h3>
                          <span className="text-gray-400 text-xs">
                            {formatDistanceToNow(new Date(contact.lastMessageTime), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-gray-600 text-sm truncate">{contact.lastMessage}</p>
                      </div>
                      {contact.unread > 0 && (
                        <Badge variant="default" className="ml-2">
                          {contact.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Message thread */}
        <Card className="md:col-span-2 h-full flex flex-col">
          {selectedUserId ? (
            <MessageThread otherUserId={selectedUserId} />
          ) : (
            <div className="flex-grow flex flex-col items-center justify-center p-6">
              <div className="bg-gray-100 p-3 rounded-full mb-4">
                <MessageIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-medium mb-2">Your Messages</h3>
              <p className="text-gray-500 text-center mb-6">
                Select a conversation or start a new one by visiting a professional's or company's profile
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// Message icon component
function MessageIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
