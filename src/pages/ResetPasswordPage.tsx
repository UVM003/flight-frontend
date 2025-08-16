import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";
import axios from "axios";
import ForgetPasswordForm from '@/components/user/ForgetPasswordForm';
import api from "@/lib/axiosApi";

export default function ResetPasswordPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState(location.state?.email || "");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
const [show, setShow] = useState(false);
  const handleResetPassword = async () => {
    if (!email || !otp || !newPassword) {
      setError("Please fill all fields");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await api.post("api/auth/customers/resetpassword", {
        email,
        otp,
        newPassword,
      });
      if (res.data.success) {
        setSuccess("Password reset successful!");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setError(res.data.message || "Failed to reset password");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-lg py-10 space-y-4">
      <h2 className="text-2xl font-bold">Reset Password</h2>

      <Input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

     
        <Input
          placeholder="OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
       
   
      
              <div className="relative">
      <Input
        type={show ? "text" : "password"}
        placeholder="New password"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        className="pr-8"
      />
      <span
        onClick={() => setShow(!show)}
        className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </span>
    </div>
  

      <div className="flex justify-end">
  <ForgetPasswordForm label="Resend OTP" />
</div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-500 text-sm">{success}</p>}

      <Button onClick={handleResetPassword} disabled={loading} className="w-full">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Resetting...
          </>
        ) : (
          "Reset Password"
        )}
      </Button>
    </div>
  );
}