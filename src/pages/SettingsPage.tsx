import { Link } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Settings, Users, Store, CreditCard, Bell, Palette } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useTheme } from "@/components/theme-provider";

export default function SettingsPage() {
  const { theme, setTheme, color, setColor } = useTheme();
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Settings saved successfully");
  };

  return (
    <AppLayout title="Settings" subtitle="System configuration and preferences">
      <div className="max-w-4xl">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-6 h-auto p-1 bg-secondary rounded-lg mb-6">
            <TabsTrigger value="general" className="py-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"><Settings className="w-4 h-4 mr-2 hidden sm:inline" /> General</TabsTrigger>
            <TabsTrigger value="users" className="py-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"><Users className="w-4 h-4 mr-2 hidden sm:inline" /> Users</TabsTrigger>
            <TabsTrigger value="shops" className="py-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"><Store className="w-4 h-4 mr-2 hidden sm:inline" /> Shops</TabsTrigger>
            <TabsTrigger value="currency" className="py-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"><CreditCard className="w-4 h-4 mr-2 hidden sm:inline" /> Billing</TabsTrigger>
            <TabsTrigger value="notifications" className="py-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"><Bell className="w-4 h-4 mr-2 hidden sm:inline" /> Alerts</TabsTrigger>
            <TabsTrigger value="appearance" className="py-2.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow"><Palette className="w-4 h-4 mr-2 hidden sm:inline" /> Theme</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6 mt-0 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-4">System Settings</h3>
              <form onSubmit={handleSave} className="space-y-4 max-w-lg">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input defaultValue="YUSCO Shops" />
                </div>
                <div className="space-y-2">
                  <Label>Contact Email</Label>
                  <Input type="email" defaultValue="admin@yusco.com" />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="space-y-0.5">
                    <Label className="text-base text-foreground">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">Temporarily disable access to the system.</p>
                  </div>
                  <Switch />
                </div>
                <div className="pt-4 border-t border-border flex justify-end">
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6 mt-0 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col items-center justify-center py-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-bold mb-1">User Management</h3>
              <p className="text-sm text-muted-foreground max-w-md">Manage sellers, administrators, and assign roles across your shops in the User Management module.</p>
              <Button variant="outline" className="mt-6" asChild><Link to="/users">Open User Directory</Link></Button>
            </div>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6 mt-0 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <h3 className="text-lg font-bold mb-4">Theme & Appearance</h3>
              <div className="space-y-6 max-w-lg">
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <Label className="text-base">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Toggle the application's dark mode visual theme.</p>
                  </div>
                  <Switch
                    checked={theme === "dark"}
                    onCheckedChange={(checked) => {
                      setTheme(checked ? "dark" : "light");
                      toast.success(`Theme changed to ${checked ? "Dark" : "Light"} Mode!`);
                    }}
                  />
                </div>
                <div className="space-y-2 border-t border-border pt-4">
                  <Label>Primary Color Accent</Label>
                  <Select
                    value={color}
                    onValueChange={(v: "blue" | "pink" | "emerald") => {
                      setColor(v);
                      toast.success(`Theme color changed to ${v.charAt(0).toUpperCase() + v.slice(1)}!`);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Theme Color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="blue">Blue (Default)</SelectItem>
                      <SelectItem value="pink">Pink</SelectItem>
                      <SelectItem value="emerald">Emerald</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="shops" className="space-y-6 mt-0 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <p className="text-muted-foreground">Shop settings and preferences configurations.</p>
            </div>
          </TabsContent>

          <TabsContent value="currency" className="space-y-6 mt-0 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <p className="text-muted-foreground">Modify tax rates, invoice formatting, and base currency.</p>
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 mt-0 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
              <p className="text-muted-foreground">Manage your email alerts and system notifications.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
