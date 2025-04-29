import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AlertCircle, Home, ChevronLeft } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-blue-700">
      <Card className="w-full max-w-md mx-4 shadow-lg border-0">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Page Not Found</h1>
            <div className="w-16 h-1 bg-blue-600 rounded my-2"></div>
            <p className="mt-4 text-gray-600">
              We couldn't find the page you were looking for. It might have been moved or deleted.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center gap-4 pb-6">
          <Button asChild variant="outline" className="gap-2">
            <Link to="/">
              <ChevronLeft className="h-4 w-4" />
              Go Back
            </Link>
          </Button>
          <Button asChild className="gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600">
            <Link to="/">
              <Home className="h-4 w-4" />
              Home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
