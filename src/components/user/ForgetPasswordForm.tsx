import { useState } from "react";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom"; 
import axios from "axios";
import api from "@/lib/axiosApi";



export default function ForgotPasswordComponent({ label = "Forgot password?" }) {
    const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
const navigate = useNavigate();
  const handleSendOtp = async () => {
    if (!email) {
      setError("Email is required");
      return;
    }
    setError("");
    setLoading(true);
     try {
      const res = await api.post("api/auth/customers/forgotpassword", { email });
      if (res.data.success) {
        setOpen(false);
        navigate("/reset-password", { state: { email } });
      } else {
        setError(res.data.message || "Failed to send OTP");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Network error");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className="text-sm text-primary hover:underline bg-transparent border-none p-0">
         {label}
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Forgot Password</DialogTitle>
          <DialogDescription>
            Enter your email to receive an OTP for password reset.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            type="email"
            placeholder="email@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        <DialogFooter>
          <Button onClick={handleSendOtp} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending OTP...
              </>
            ) : (
              "Send OTP"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
