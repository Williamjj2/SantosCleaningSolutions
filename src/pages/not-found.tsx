import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-black text-white p-4">
      <div className="text-center max-w-md">
        <h1 className="text-6xl font-display font-bold text-blue-500 mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-4">Page not found</h2>
        <p className="text-white/60 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button variant="brand" asChild>
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    </div>
  );
}
