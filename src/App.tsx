import { lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ExitIntentPopup } from "@/components/ExitIntentPopup";
import { GoogleReviewsBadge } from "@/components/GoogleReviewsBadge";

const Home = lazy(() => import("@/pages/Home"));
const Blog = lazy(() => import("@/pages/Blog"));
const BlogPost = lazy(() => import("@/pages/BlogPost"));
const ServicePage = lazy(() => import("@/pages/ServicePage"));
const CityPage = lazy(() => import("@/pages/CityPage"));
const Contact = lazy(() => import("@/pages/Contact"));
const Legal = lazy(() => import("@/pages/Legal"));
const Guide = lazy(() => import("@/pages/Guide"));
const NotFound = lazy(() => import("@/pages/not-found"));

const queryClient = new QueryClient();

function Router() {
  return (
    <Suspense fallback={null}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/blog" component={Blog} />
        <Route path="/blog/:slug" component={BlogPost} />
        <Route path="/contact" component={Contact} />
        <Route path="/deep-cleaning" component={ServicePage} />
        <Route path="/regular-cleaning" component={ServicePage} />
        <Route path="/move-in-out-cleaning" component={ServicePage} />
        <Route path="/office-cleaning" component={ServicePage} />
        <Route path="/guides/:slug" component={Guide} />
        <Route path="/legal/:page" component={Legal} />
        <Route path="/:slug" component={CityPage} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <ExitIntentPopup />
        <GoogleReviewsBadge />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
