import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { authApi } from "@/api/auth.api";
import { authHelper } from "@/utils/helpers/auth.helper";
import { useStore } from "@/store/useStore";
import { Mail, Lock, Building2, ArrowRight, ShieldCheck, Zap, Globe, Github } from "lucide-react";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const updateUser = useStore((s) => s.updateUser);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authApi.login({ email, password });

      if (response.success && response.data) {
        authHelper.setToken(response.data.token);
        updateUser({
          ...response.data.user,
          id: String(response.data.user.id),
          assigned_shops: response.data.user.assigned_shops || [],
          permissions: response.data.user.permissions || []
        } as any);
        toast({
          title: "Access Granted",
          description: "Welcome to Shopix's next-generation retail platform.",
        });
        navigate("/");
      } else {
        toast({
          title: "Authorization Failed",
          description: response.message || "Please check your network credentials.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Endpoint Unreachable",
        description: error instanceof Error ? error.message : "The authentication server is currently unavailable.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#020617] relative overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-rose-600/10 blur-[130px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-orange-600/10 blur-[130px] animate-pulse delay-700" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-pink-600/5 blur-[100px] animate-bounce duration-[10000ms]" />
      </div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.15]" />

      <div className="relative z-10 w-full max-w-[1200px] px-6 py-12 grid lg:grid-cols-2 gap-12 items-center">

        {/* Left Content: The Vision */}
        <div className="hidden lg:flex flex-col space-y-8 animate-in fade-in slide-in-from-left duration-1000">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white p-2 border border-white/20 rounded-2xl flex items-center justify-center shadow-2xl overflow-hidden">
               <img src="/shopix-logo.png" alt="Shopix Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tighter leading-none italic">SHOPIX</h1>
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.4em]">Intelligence</span>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-6xl font-black text-white leading-[1.05] tracking-tighter">
              Reimagining <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-orange-500 to-red-500">Retail Control.</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-lg leading-relaxed font-medium">
              A premium, data-driven ecosystem designed for high-performance cosmetics, stationery, and multi-sector retail groups.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-white/5">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Zap className="w-4 h-4 text-yellow-400" /> Real-time
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Instant synchronization across all locations.</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <ShieldCheck className="w-4 h-4 text-rose-400" /> Secure
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Enterprise-grade auditing and protocols.</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Globe className="w-4 h-4 text-emerald-400" /> Global
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Centralized control for regional scale.</p>
            </div>
          </div>
        </div>

        {/* Right Content: The Authentication */}
        <div className="flex justify-center lg:justify-end animate-in fade-in slide-in-from-right duration-1000">
          <Card className="w-full max-w-md bg-white/[0.03] backdrop-blur-3xl border border-white/10 shadow-[0_32px_128px_-32px_rgba(0,0,0,0.8)] rounded-[40px] overflow-hidden">
            <CardContent className="p-10 space-y-8">
              <div className="space-y-2 text-center">
                <div className="lg:hidden flex justify-center mb-6">
                  <div className="w-20 h-20 bg-white p-2 rounded-2xl flex items-center justify-center border border-white/20">
                    <img src="/shopix-logo.png" alt="Shopix Logo" className="w-full h-full object-contain" />
                  </div>
                </div>
                <h3 className="text-3xl font-black text-white tracking-tight">Welcome</h3>
                <p className="text-slate-400 font-medium text-sm">Authorized personnel only</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2 group">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] ml-1">Email Address</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-rose-500 transition-colors">
                        <Mail className="w-4 h-4" />
                      </div>
                      <Input
                        type="email"
                        placeholder="john@shopix.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-14 pl-12 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50 transition-all rounded-2xl font-medium"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2 group">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Password</label>
                      <button type="button" className="text-[10px] font-bold text-rose-500 hover:text-rose-400 transition-colors">FORGOT?</button>
                    </div>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-rose-500 transition-colors">
                        <Lock className="w-4 h-4" />
                      </div>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-14 pl-12 bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50 transition-all rounded-2xl font-medium"
                        required
                      />
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-14 bg-gradient-to-r from-rose-600 to-orange-600 text-white hover:opacity-90 font-black rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 group relative overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2 transition-transform duration-300 group-hover:scale-105">
                    {isLoading ? "AUTHENTICATING..." : "SIGN IN TO WORKSPACE"}
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </Button>
              </form>

              <div className="flex items-center gap-4 text-slate-600">
                <div className="h-px flex-1 bg-white/5" />
                <span className="text-[9px] font-black tracking-widest uppercase">SHOPIX ERP SECURE</span>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              <div className="flex justify-center items-center gap-6">
                <button className="text-slate-500 hover:text-white transition-colors"><Github className="w-5 h-5" /></button>
                <button className="text-slate-500 hover:text-white transition-colors"><Globe className="w-5 h-5" /></button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer Decoration */}
      <div className="absolute bottom-12 left-12 lg:flex hidden items-center gap-4 text-slate-600 animate-in fade-in duration-1000 delay-1000">
        <p className="text-[10px] font-bold tracking-widest uppercase">© 2026 Shopix Group Protocol</p>
        <div className="w-1 h-1 rounded-full bg-slate-800" />
        <p className="text-[10px] font-bold tracking-widest uppercase">Encryption: AES-256</p>
      </div>
    </div>
  );
};

export default LoginPage;
