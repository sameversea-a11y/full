import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { UserPlus, ArrowLeft, Mail, Shield, Clock, RefreshCw } from "lucide-react";

// API calls
import {
  sendEmailOtp,
  createAccount,
  verifyEmailOtp,
} from "@/api/api";

const EmailVerificationModal = ({ verificationId, email, onClose, onVerify }) => {
  const [otp, setOtp] = useState(Array(6).fill("")); 
  const [timer, setTimer] = useState(120); 
  const [canResend, setCanResend] = useState(false); 
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
    } else {
      const interval = setInterval(() => {
        setTimer((prevTime) => prevTime - 1); 
      }, 1000);

      return () => clearInterval(interval); 
    }
  }, [timer]);

  const handleVerifyOtp = async () => {
    const otpString = otp.join(""); 
    if (otpString.length !== 6) {
      Swal.fire("Error", "Please enter a valid 6-digit OTP", "error");
      return;
    }

    setIsVerifying(true);
    try {
      await verifyEmailOtp(verificationId, otpString);
      onVerify(); 
      Swal.fire("Success", "Email verified successfully!", "success");
      onClose(); 
    } catch (error) {
      Swal.fire("Error", error.message || "Invalid OTP", "error");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      await sendEmailOtp(email); 
      setTimer(120); 
      setCanResend(false); 
      Swal.fire("Success", "OTP has been resent to your email.", "success");
    } catch (error) {
      Swal.fire("Error", "Failed to resend OTP. Please try again.", "error");
    } finally {
      setIsResending(false);
    }
  };

  const handleInputChange = (e, index) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); 
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      if (value !== "" && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
        <div className="text-center pt-8 pb-6 px-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Verify Your Email
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            We've sent a 6-digit verification code to your email address. 
            Please enter it below to continue.
          </p>
        </div>

        <div className="px-8 pb-6">
          <div className="flex justify-center gap-3 mb-8">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                inputMode="numeric"
                maxLength="1"
                value={digit}
                onChange={(e) => handleInputChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className={`
                  w-12 h-12 text-center text-xl font-semibold
                  border-2 rounded-xl transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-blue-500
                  ${digit ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                  hover:border-blue-400
                `}
                style={{
                  caretColor: 'transparent' 
                }}
              />
            ))}
          </div>

          <button
            onClick={handleVerifyOtp}
            disabled={isVerifying || otp.some(digit => digit === '')}
            className={`
              w-full py-3 px-6 rounded-xl font-semibold text-white
              transition-all duration-200 transform
              ${isVerifying || otp.some(digit => digit === '')
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 hover:scale-105 active:scale-95'
              }
              ${isVerifying ? 'animate-pulse' : ''}
            `}
          >
            {isVerifying ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Verifying...
              </div>
            ) : (
              'Verify Email'
            )}
          </button>
        </div>

        <div className="px-8 pb-8 border-t border-gray-100 pt-6">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {timer > 0 ? (
                  <>Time remaining: <span className="font-mono font-semibold text-blue-600">{formatTime(timer)}</span></>
                ) : (
                  <span className="text-green-600 font-medium">You can now resend the code</span>
                )}
              </span>
            </div>
            
            {timer > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-1 mb-3">
                <div 
                  className="bg-blue-600 h-1 rounded-full transition-all duration-1000 ease-linear"
                  style={{ width: `${((120 - timer) / 120) * 100}%` }}
                ></div>
              </div>
            )}
          </div>

          <button
            onClick={handleResendOtp}
            disabled={!canResend || isResending}
            className={`
              w-full py-2.5 px-6 rounded-xl font-medium
              transition-all duration-200 transform
              ${canResend && !isResending
                ? 'bg-green-600 text-white hover:bg-green-700 hover:scale-105 active:scale-95'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }
              ${isResending ? 'animate-pulse' : ''}
            `}
          >
            {isResending ? (
              <div className="flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Sending...
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Resend Code
              </div>
            )}
          </button>
        </div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center
                     text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full
                     transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const buttonStyles = {
  padding: "12px 20px",
  margin: "10px",
  cursor: "pointer",
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  borderRadius: "8px",
  fontSize: "16px",
  transition: "background-color 0.3s ease, transform 0.2s ease",
};

export default function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "", // phone field remains but no verification
    address: "",
    state: "",
    pin: "",
    agreeToTerms: false,
  });

  const [emailOtp, setEmailOtp] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationId, setVerificationId] = useState(null);
  const [showModal, setShowModal] = useState(false); // Controls the visibility of the modal

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!emailVerified) {
      Swal.fire("Error", "Please verify your email address", "error");
      return;
    }

    if (!formData.agreeToTerms) {
      Swal.fire("Error", "Please agree to the terms and conditions", "error");
      return;
    }

    try {
      const accountData = await createAccount({
        name: formData.firstName + " " + formData.lastName, 
        email: formData.email,
        mobile: formData.phone, 
      });
      const { userId, tempPassword } = accountData;

      // Store user data
      localStorage.setItem("udin_user_data", JSON.stringify({ ...formData, userId, tempPassword }));

      Swal.fire(
        "Account Created!",
        `User ID: ${userId}, Temporary Password: ${tempPassword}`,
        "success"
      );

      // Redirect to payment screen
      navigate("/payment");
    } catch (error) {
      Swal.fire("Error", "Failed to create account. Please try again.", "error");
    }
  };

  const handleEmailOtp = async () => {
    try {
      const response = await sendEmailOtp(formData.email);
      setVerificationId(response.data.verificationId);
      setShowModal(true); 
      Swal.fire("OTP Sent", "OTP sent to your email address", "success");
    } catch (error) {
      Swal.fire("Error", "Failed to send email OTP. Please try again.", "error");
    }
  };

  const handleEmailVerified = () => {
    setEmailVerified(true); 
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <div className="w-full bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
            <div className="hidden sm:block w-px h-6 bg-gray-300" />
            <h1 className="hidden sm:block text-lg font-semibold text-gray-900">
              Create Account
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/login")}
              className="text-sm"
            >
              Sign In
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/admin-login")}
              className="text-sm"
            >
              Admin Login
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 rounded-full bg-primary/10">
                <UserPlus className="h-8 w-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">
                Create Your UDIN Account
              </CardTitle>
              <CardDescription>
                Complete your registration to process your documents and receive
                your unique UDIN User ID
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Main Registration Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="john@company.com"
                      className="flex-1"
                    />
                    <Button
                      type="button"
                      variant={emailVerified ? "secondary" : "outline"}
                      onClick={handleEmailOtp}
                      disabled={emailVerified}
                      className="shrink-0"
                    >
                      {emailVerified ? (
                        <Shield className="h-4 w-4 mr-1" />
                      ) : (
                        <Mail className="h-4 w-4 mr-1" />
                      )}
                      {emailVerified ? "Verified" : "Verify"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+91 9876543210"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address *</Label>
                  <Input
                    id="address"
                    name="address"
                    type="text"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Main Street, City"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Input
                      id="state"
                      name="state"
                      type="text"
                      required
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="Maharashtra"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pin">PIN Code *</Label>
                    <Input
                      id="pin"
                      name="pin"
                      type="text"
                      required
                      pattern="[0-9]{6}"
                      value={formData.pin}
                      onChange={handleInputChange}
                      placeholder="400001"
                    />
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800 text-sm">
                    <Shield className="h-4 w-4 inline mr-1" />
                    Please verify your email address to continue.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({
                        ...prev,
                        agreeToTerms: checked as boolean,
                      }))
                    }
                  />
                  <Label htmlFor="terms" className="text-sm">
                    I agree to the{" "}
                    <a href="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </a>
                  </Label>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={!emailVerified || !formData.agreeToTerms}
                >
                  Create UDIN Account & Proceed to Payment
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {showModal && (
        <EmailVerificationModal
          verificationId={verificationId}
          onClose={() => setShowModal(false)}
          onVerify={handleEmailVerified}
        />
      )}
    </div>
  );
}
