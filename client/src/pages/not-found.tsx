import { Link } from "wouter";
import { Button } from "@/components/Button";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background text-foreground">
      <div className="max-w-md mx-auto text-center px-4">
        <div className="flex justify-center mb-6">
          <AlertTriangle className="w-24 h-24 text-muted-foreground opacity-20" />
        </div>
        
        <h1 className="text-7xl font-black mb-4 font-display">404</h1>
        <h2 className="text-2xl font-bold mb-6">Page Not Found</h2>
        
        <p className="text-muted-foreground mb-10">
          The page you are looking for doesn't exist or has been moved.
          If you were looking for the manifest, it should be at <code className="text-primary bg-secondary px-1 py-0.5 rounded text-sm">/manifest.json</code>.
        </p>

        <Link href="/">
          <Button variant="primary" size="lg">
            Return Home
          </Button>
        </Link>
      </div>
    </div>
  );
}
