import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, BellRing, LogOut } from "lucide-react";
import sseService from "../services/sseService";
import NotificationCard from "./NotificationCard";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "../contexts/UserContext";

const Dashboard = () => {
  const [notifications, setNotifications] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();
  const { user, logout } = useUser();

  useEffect(() => {
    sseService.connectAll(user.name, {
      onOpen: () => {
        setIsConnected(true);
        console.log("SSE connected");
        toast({
          title: "Connected",
          description: "SSE real-time notifications enabled",
        });
      },
      onError: (err) => {
        setIsConnected(false);
        console.error("SSE connection error", err);
        toast({
          title: "Connection Error",
          description: "Failed to connect to SSE stream",
          variant: "destructive",
        });
      },
    });

    const handleNewAlert = (data, type) => {
      const newNotification = {
        id: data.id || Date.now() + Math.random(),
        message: data.description || "New alert received",
        timestamp: new Date(),
        type: type, // "broadcast" or "unicast"
      };
      setNotifications((prev) => [newNotification, ...prev]);

      toast({
        title: "New Notification",
        description: `${type === "unicast" ? "🔒" : "📡"} ${
          newNotification.message
        }`,
      });
    };

    sseService.on("new-alert", (data) => handleNewAlert(data, "broadcast"));
    sseService.on("user-alert", (data) => handleNewAlert(data, "unicast"));

    return () => {
      sseService.off("new-alert");
      sseService.off("user-alert");
      sseService.disconnectAll();
      setIsConnected(false);
    };
  }, [toast, user.name]);

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="font-semibold text-foreground">
                Name: {user.name}
              </h1>
              <p className="text-xl text-muted-foreground">
                User ID: {user.id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={isConnected ? "default" : "destructive"}
              className="text-xs"
            >
              {isConnected ? "SSE Connected" : "SSE Disconnected"}
            </Badge>
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 space-y-4">
        <Card>
          <CardHeader className="pb-3 items-center">
            <CardTitle className="flex items-center gap-2">
              <BellRing className="h-5 w-5 text-primary" />
              Notifications Dashboard
            </CardTitle>
          </CardHeader>
        </Card>

        <div className="space-y-3">
          {notifications.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium text-foreground mb-2">
                  No notifications yet
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isConnected
                    ? "You're connected and ready to receive notifications"
                    : "Waiting for SSE connection..."}
                </p>
              </CardContent>
            </Card>
          ) : (
            notifications.map((notification) => (
              <NotificationCard
                key={notification.id}
                notification={notification}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
