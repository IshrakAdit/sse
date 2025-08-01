import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Send } from "lucide-react";
import { apiService } from "@/services/apiService";

const Dashboard = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    message: "",
  });
  const [isLoading, setIsLoading] = useState({
    broadcast: false,
    unicast: false,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBroadcast = async () => {
    if (!formData.message.trim()) {
      toast.error("Message is required for broadcast");
      return;
    }

    setIsLoading((prev) => ({ ...prev, broadcast: true }));

    try {
      console.log("Broadcasting message:", formData.message);
      await apiService.broadCastNotification({
        userName: formData.username,
        message: formData.message,
      });

      toast.success("Broadcast message sent!");
      setFormData({ username: "", message: "" });
    } catch (error) {
      console.error("Broadcast error:", error);
      toast.error("Failed to send broadcast");
    } finally {
      setIsLoading((prev) => ({ ...prev, broadcast: false }));
    }
  };

  const handleUnicast = async () => {
    if (!formData.username.trim() || !formData.message.trim()) {
      toast.error("Username and message are required for unicast");
      return;
    }

    setIsLoading((prev) => ({ ...prev, unicast: true }));

    try {
      console.log("Unicasting message:", formData);
      await apiService.uniCastNotification({
        userName: formData.username,
        message: formData.message,
      });

      toast.success("Unicast message sent!");
      setFormData({ username: "", message: "" });
    } catch (error) {
      console.error("Unicast error:", error);
      toast.error("Failed to send unicast");
    } finally {
      setIsLoading((prev) => ({ ...prev, unicast: false }));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="p-2 h-auto"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-medium text-foreground">Send Message</h1>
          <div className="w-8"></div>
        </div>

        {/* Form */}
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium">
              Username
            </Label>
            <Input
              id="username"
              name="username"
              type="text"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Enter username for unicast"
              className="h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-sm font-medium">
              Message
            </Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              placeholder="Enter your message"
              rows={4}
              className="resize-none"
              required
            />
          </div>

          <div className="flex flex-col gap-4 mt-4">
            <Button
              type="button"
              disabled={isLoading.unicast}
              onClick={handleUnicast}
              className="flex-1 h-11"
              variant="primary"
            >
              {isLoading.unicast ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Unicast
                </div>
              )}
            </Button>

            <Button
              type="button"
              disabled={isLoading.broadcast}
              onClick={handleBroadcast}
              className="flex-1 h-11"
              variant="outline"
            >
              {isLoading.broadcast ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Broadcast
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
