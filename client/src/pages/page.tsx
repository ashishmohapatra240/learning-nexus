import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { PageContent } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function PageView() {
  // Get the slug from the URL
  const [, params] = useRoute("/pages/:slug");
  const slug = params?.slug;

  const {
    data: pageContent,
    isLoading,
    isError,
    error,
  } = useQuery<PageContent>({
    queryKey: [`/api/pages/${slug}`],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/pages/${slug}`);
      const data = await res.json();
      return data;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-12 w-3/4 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-5/6" />
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-6 w-4/5" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : "An error occurred while loading the page"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!pageContent) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Page Not Found</AlertTitle>
          <AlertDescription>
            The page you are looking for does not exist.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{pageContent.title}</h1>
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: pageContent.content }}
      />
      <div className="text-sm text-muted-foreground mt-8">
        Last updated: {new Date(pageContent.updatedAt).toLocaleDateString()}
      </div>
    </div>
  );
}