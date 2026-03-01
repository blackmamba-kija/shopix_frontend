import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { authApi } from "@/api/auth.api";
import { authHelper } from "@/utils/helpers/auth.helper";
import { Mail, Lock, LogIn, ShieldCheck, Sparkles, Building2, ArrowRight } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authApi.login({ email, password });

      if (response.success && response.data) {
        authHelper.setToken(response.data.token);
        authHelper.setUser({
          ...response.data.user,
          id: String(response.data.user.id),
          assigned_shops: response.data.user.assigned_shops || [],
          permissions: response.data.user.permissions || []
        } as any);
        toast({
          title: "Welcome Back",
          description: "Access granted to YUSCO Management System",
        });
        navigate("/");
      } else {
        toast({
          title: "Login Failed",
          description: response.message || "Invalid credentials provided",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Failed to connect to the YUSCO server",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white font-sans overflow-hidden">
      {/* Left Section: Branding & Visuals */}
      <div className="hidden lg:flex lg:w-1/2 relative p-12 flex-col justify-between overflow-hidden">
        {/* Modern Mesh Gradient Background */}
        <div className="absolute inset-0 bg-slate-950">
          <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-blue-600/20 blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/20 blur-[120px] animate-pulse delay-700" />
        </div>

        {/* Brand Header */}
        <div className="relative z-10 animate-in fade-in slide-in-from-left duration-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight uppercase">YUSCO</h2>
              <p className="text-[10px] text-blue-400/80 font-bold tracking-[0.2em] uppercase">Enterprise</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 space-y-8 animate-in fade-in zoom-in duration-1000">
          <div className="space-y-4">
            <div className="w-80 h-80 rounded-[48px] overflow-hidden shadow-2xl border border-white/20 p-2 bg-white/5 backdrop-blur-md flex items-center justify-center">
              <img src="/yuster-logo.png" alt="Yusco" className="w-full h-full object-contain drop-shadow-2xl transition-transform duration-700 hover:scale-105 scale-110" />
            </div>
            <h1 className="text-5xl font-black text-white leading-tight">
              Streamline Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Retail Excellence</span>
            </h1>
            <p className="text-lg text-slate-300 max-w-md font-semibold">
              Integrated management solution for Cosmetics, Stationery, and Modern Retail.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex-1">
              <Sparkles className="w-5 h-5 text-blue-400 mb-2" />
              <p className="text-white font-bold text-sm">Smart Inventory</p>
              <p className="text-slate-500 text-[10px] mt-1">Real-time tracking & alerts</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex-1">
              <ShieldCheck className="w-5 h-5 text-indigo-400 mb-2" />
              <p className="text-white font-bold text-sm">Secure Auditing</p>
              <p className="text-slate-500 text-[10px] mt-1">Traceable activity logs</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex justify-between items-center text-slate-500 text-xs font-medium border-t border-white/5 pt-8 animate-in fade-in slide-in-from-bottom duration-700">
          <p>© 2026 YUSCO Group. Built for efficiency.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </div>

      {/* Right Section: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-slate-50 border-l border-slate-200">
        <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-right duration-700">
          <div className="text-center lg:text-left space-y-2">
            <div className="lg:hidden flex justify-center mb-6">
              <img src="/yuster-logo.png" alt="Yusco" className="w-40 h-40 object-contain scale-125" />
            </div>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">System Sign In</h3>
            <p className="text-slate-600 font-semibold text-sm italic">YUSCO Retail Control Center</p>
          </div>

          <Card className="border border-slate-200 shadow-xl bg-white rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider ml-1">Account Identifier</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-600 transition-colors">
                        <Mail className="w-4 h-4" />
                      </div>
                      <Input
                        type="email"
                        placeholder="admin@yusco.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 pl-12 bg-white border-slate-200 focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all rounded-xl text-slate-900 font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Security Key</label>
                      <a href="#" className="text-[11px] font-bold text-blue-600 hover:text-blue-800 transition-colors">Recovery?</a>
                    </div>
                    <div className="relative group">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-600 transition-colors">
                        <Lock className="w-4 h-4" />
                      </div>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 pl-12 bg-white border-slate-200 focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 transition-all rounded-xl text-slate-900 font-medium"
                        required
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 group overflow-hidden relative"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {isLoading ? "Authenticating..." : (
                      <>
                        Enter Workspace
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Button>
              </form>

              <div className="mt-8 pt-6 border-t border-slate-100 space-y-4">
                <div className="flex items-center gap-2 text-slate-400">
                  <LogIn className="w-3 h-3" />
                  <p className="text-[10px] font-black uppercase tracking-widest">Demo Credentials</p>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <button
                    type="button"
                    onClick={() => { setEmail("admin@yusco.com"); setPassword("password"); }}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-white hover:border-blue-600/50 hover:shadow-md transition-all text-left group"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black text-slate-900 uppercase">Administrator</span>
                      <Badge className="bg-blue-600 h-4 text-[8px] font-bold rounded-full">SYSTEM ROOT</Badge>
                    </div>
                    <p className="text-xs text-slate-700 font-bold group-hover:text-blue-700 transition-colors">admin@yusco.com</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setEmail("viewer@yusco.com"); setPassword("password"); }}
                    className="p-4 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-white hover:border-indigo-600/50 hover:shadow-md transition-all text-left group"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black text-slate-900 uppercase">Operational User</span>
                      <Badge className="bg-indigo-600 h-4 text-[8px] font-bold rounded-full border-none">RESTRICTED</Badge>
                    </div>
                    <p className="text-xs text-slate-700 font-bold group-hover:text-indigo-700 transition-colors">viewer@yusco.com</p>
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">
            State of the art Retail Intelligence
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
