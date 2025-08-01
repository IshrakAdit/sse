import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Satellite, User } from "lucide-react";

const NotificationCard = ({ notification }) => {
  const formatTime = (timestamp) => {
    const now = new Date();
    const diff = now - new Date(timestamp);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <Card
      className={`transition-all ${
        notification.read ? "opacity-75" : "border-primary/20 bg-accent/30"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={`w-2 h-2 rounded-full mt-2 mr-2 ${
              notification.read ? "bg-muted-foreground" : "bg-primary"
            }`}
          />

          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm text-foreground leading-relaxed">
                {notification.message}
              </p>
              <Badge
                variant={
                  notification.type === "broadcast" ? "default" : "secondary"
                }
                className="text-xs whitespace-nowrap flex items-center gap-1"
              >
                {notification.type === "broadcast" ? (
                  <>
                    <Satellite className="h-3 w-3" />
                    Broadcast
                  </>
                ) : (
                  <>
                    <User className="h-3 w-3" />
                    Unicast
                  </>
                )}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {formatTime(notification.timestamp)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationCard;
