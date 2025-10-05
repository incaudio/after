import { useLocation } from "wouter";
import { Music, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="text-center space-y-6 max-w-md">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-blue-500 blur-3xl opacity-20 animate-pulse" />
          <Music className="w-24 h-24 mx-auto text-violet-400 relative" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-6xl font-display font-bold text-foreground">404</h1>
          <h2 className="text-2xl font-display font-semibold">Page Not Found</h2>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <Button
          onClick={() => setLocation("/")}
          className="bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600"
          data-testid="button-home"
        >
          <Home className="w-4 h-4 mr-2" />
          Back to Home
        </Button>
      </div>
    </div>
  );
}
