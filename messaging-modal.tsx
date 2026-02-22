import { useState, useEffect, useCallback } from "react";
import { queryClient, apiRequest, getQueryFn } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AuthPage from "@/pages/auth";
import RadarPage from "@/pages/radar";
import { Loader2 } from "lucide-react";
import { useTranslation } from "@/lib/i18n";

function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState<any>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["/api/auth/me"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
  });

  const { setLang } = useTranslation();

  useEffect(() => {
    if (isLoading) return;
    if (data && !("error" in (data as any))) {
      setUser(data);
      setIsAuthenticated(true);
      const userData = data as any;
      if (userData.language && ["en", "it", "fr", "de", "es", "pt", "sv"].includes(userData.language)) {
        setLang(userData.language);
      }
    } else {
      setIsAuthenticated(false);
    }
  }, [data, isLoading]);

  const handleAuth = useCallback(() => {
    refetch().then((res) => {
      if (res.data) {
        setUser(res.data);
        setIsAuthenticated(true);
      }
    });
  }, [refetch]);

  const handleLogout = useCallback(async () => {
    await apiRequest("POST", "/api/auth/logout", {});
    queryClient.clear();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  if (isAuthenticated === null || isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <AuthPage onAuth={handleAuth} />;
  }

  return <RadarPage user={user} onLogout={handleLogout} />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AppContent />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
