import React, { useState } from "react";
import {
  X,
  ShieldCheck,
  Mail,
  LockKeyhole,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
  User,
  UserPlus,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

type Mode = "login" | "register";
type LoginMethod = "password" | "otp";
type Step = "form" | "otp" | "details";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({
  isOpen,
  onClose,
}: LoginModalProps) {
  const {
    user,
    login,
    requestOtp,
    verifyOtp,
    registerRequestOtp,
    registerVerifyOtp,
  } = useAuth();

  const [mode, setMode] =
    useState<Mode>("login");

  const [loginMethod, setLoginMethod] =
    useState<LoginMethod>("password");

  const [step, setStep] =
    useState<Step>("form");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [otp, setOtp] =
    useState("");

  const [fullName, setFullName] =
    useState("");

  const [designation, setDesignation] =
    useState("Citizen User");

  const [department, setDepartment] =
    useState("Public");

  const [stateName, setStateName] =
    useState("");

  const [district, setDistrict] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  if (!isOpen) return null;

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  const resetModal = () => {
    setMode("login");
    setLoginMethod("password");
    setStep("form");

    setEmail("");
    setPassword("");
    setOtp("");

    setFullName("");
    setDesignation("Citizen User");
    setDepartment("Public");
    setStateName("");
    setDistrict("");
    setPhone("");

    setLoading(false);
    setError(null);
    setSuccess(null);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  // ============================================================
  // EXISTING ACCOUNT - PASSWORD LOGIN
  // ============================================================

  const handlePasswordLogin = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    clearMessages();

    const identifier = email.trim();

    if (!identifier) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    if (!password) {
      setError(
        "Please enter your password."
      );
      return;
    }

    setLoading(true);

    try {
      await login(
        identifier,
        password
      );

      setSuccess(
        "Login successful. Redirecting..."
      );

      setTimeout(() => {
        handleClose();
      }, 500);
    } catch (err: any) {
      setError(
        err?.message ||
          "Invalid email or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // EXISTING ACCOUNT - REQUEST OTP
  // ============================================================

  const handleRequestLoginOtp = async () => {
    clearMessages();

    const identifier = email.trim();

    if (!identifier) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    setLoading(true);

    try {
      await requestOtp(identifier);

      setSuccess(
        "A login verification code has been sent to your registered email."
      );

      setStep("otp");
    } catch (err: any) {
      setError(
        err?.message ||
          "No active BhoomiSetu account found with this email."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // EXISTING ACCOUNT - VERIFY OTP
  // ============================================================

  const handleVerifyLoginOtp = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    clearMessages();

    const identifier = email.trim();
    const code = otp.trim();

    if (!/^\d{6}$/.test(code)) {
      setError(
        "Please enter the 6-digit verification code."
      );
      return;
    }

    setLoading(true);

    try {
      await verifyOtp(
        identifier,
        code
      );

      setSuccess(
        "Authentication successful. Redirecting..."
      );

      setTimeout(() => {
        handleClose();
      }, 500);
    } catch (err: any) {
      setError(
        err?.message ||
          "Invalid or expired verification code."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // NEW ACCOUNT - REQUEST REGISTRATION OTP
  // ============================================================

  const handleRegisterRequestOtp = async (
    e?: React.FormEvent
  ) => {
    e?.preventDefault();
    clearMessages();

    const identifier = email.trim();

    if (!identifier) {
      setError(
        "Please enter your email address."
      );
      return;
    }

    setLoading(true);

    try {
      await registerRequestOtp(
        identifier
      );

      setSuccess(
        "Registration OTP has been sent to your email."
      );

      /*
       * IMPORTANT:
       * We DO NOT verify the OTP here.
       *
       * Backend requires OTP + fullName + password
       * in the same registration verification request.
       */
      setStep("otp");
    } catch (err: any) {
      setError(
        err?.message ||
          "Unable to start registration. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // NEW ACCOUNT - VERIFY OTP + CREATE ACCOUNT
  // ============================================================

  const handleVerifyRegisterOtp = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();
    clearMessages();

    const identifier =
      email.trim();

    const code =
      otp.trim();

    const name =
      fullName.trim();

    const userPassword =
      password;

    if (!identifier) {
      setError(
        "Email address is required."
      );
      return;
    }

    if (!/^\d{6}$/.test(code)) {
      setError(
        "Please enter the 6-digit verification code."
      );
      return;
    }

    if (!name) {
      setError(
        "Please enter your full name."
      );
      return;
    }

    if (!userPassword) {
      setError(
        "Please create a password."
      );
      return;
    }

    if (userPassword.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    setLoading(true);

    try {
      /*
       * ONE single request:
       *
       * OTP + fullName + password + profile details
       *
       * This matches the backend registration API.
       */
      await registerVerifyOtp({
        email: identifier,
        otp: code,
        fullName: name,
        password: userPassword,
        designation:
          designation.trim() ||
          "Citizen User",
        department:
          department.trim() ||
          "Public",
        state:
          stateName.trim() ||
          undefined,
        district:
          district.trim() ||
          undefined,
        phone:
          phone.trim() ||
          undefined,
      });

      setSuccess(
        "Account created successfully. You are now logged in."
      );

      setTimeout(() => {
        handleClose();
      }, 700);
    } catch (err: any) {
      setError(
        err?.message ||
          "Unable to create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // SWITCH MODE
  // ============================================================

  const switchMode = (
    nextMode: Mode
  ) => {
    setMode(nextMode);
    setStep("form");
    setLoginMethod("password");

    setPassword("");
    setOtp("");

    setFullName("");
    setDesignation("Citizen User");
    setDepartment("Public");
    setStateName("");
    setDistrict("");
    setPhone("");

    clearMessages();
  };

  // ============================================================
  // SWITCH LOGIN METHOD
  // ============================================================

  const switchLoginMethod = (
    method: LoginMethod
  ) => {
    setLoginMethod(method);
    setStep("form");
    setOtp("");
    clearMessages();
  };

  // ============================================================
  // BACK
  // ============================================================

  const handleBack = () => {
    clearMessages();

    if (
      mode === "register" &&
      step === "otp"
    ) {
      setStep("form");
      setOtp("");
      return;
    }

    if (
      mode === "login" &&
      step === "otp"
    ) {
      setStep("form");
      setOtp("");
      return;
    }

    if (step === "details") {
      setStep("otp");
      return;
    }

    setStep("form");
    setOtp("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-registry-ink/60 backdrop-blur-xs p-4">
      <div className="bg-white border border-graticule-teal/40 shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto flex flex-col animate-in fade-in zoom-in-95 duration-200">

        {/* ================================================== */}
        {/* HEADER */}
        {/* ================================================== */}

        <div className="bg-survey-paper p-5 border-b border-graticule-teal/30 flex justify-between items-center sticky top-0 z-10">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-tilled-earth" />

            <div>
              <h3 className="font-serif font-semibold text-registry-ink text-lg">
                BhoomiSetu Official Portal
              </h3>

              <p className="text-xs text-registry-ink/60">
                Secure Authentication & Access Control
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1 text-graticule-teal hover:text-registry-ink rounded-sm hover:bg-graticule-teal/10 transition-colors"
            aria-label="Close login"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================================================== */}
        {/* BODY */}
        {/* ================================================== */}

        <div className="p-6 space-y-6">

          {/* Current User */}
          {user && (
            <div className="p-3 bg-cultivated-green/10 border border-cultivated-green/30 text-xs rounded-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cultivated-green shrink-0" />

              <div>
                <span className="font-semibold text-cultivated-green">
                  Currently Logged In:
                </span>{" "}
                <span className="text-registry-ink">
                  {user.fullName} ({user.role})
                </span>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 bg-alluvium-red/10 border border-alluvium-red/30 text-alluvium-red text-sm rounded-sm">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="p-3 bg-cultivated-green/10 border border-cultivated-green/30 text-cultivated-green text-sm rounded-sm">
              {success}
            </div>
          )}

          {/* ================================================== */}
          {/* MAIN TABS */}
          {/* ================================================== */}

          {step === "form" && (
            <div className="grid grid-cols-2 border border-graticule-teal/20">
              <button
                type="button"
                onClick={() =>
                  switchMode("login")
                }
                className={`py-3 text-sm font-semibold ${
                  mode === "login"
                    ? "bg-registry-ink text-white"
                    : "bg-white text-registry-ink/60 hover:bg-survey-paper"
                }`}
              >
                Sign In
              </button>

              <button
                type="button"
                onClick={() =>
                  switchMode("register")
                }
                className={`py-3 text-sm font-semibold ${
                  mode === "register"
                    ? "bg-registry-ink text-white"
                    : "bg-white text-registry-ink/60 hover:bg-survey-paper"
                }`}
              >
                Create Account
              </button>
            </div>
          )}

          {/* ================================================== */}
          {/* LOGIN FORM */}
          {/* ================================================== */}

          {mode === "login" &&
            step === "form" && (
              <div className="space-y-5">

                <div>
                  <h4 className="font-serif text-xl font-semibold text-registry-ink">
                    Sign in securely
                  </h4>

                  <p className="text-sm text-registry-ink/60 mt-1">
                    Existing BhoomiSetu users can sign in using
                    their password or a temporary OTP.
                  </p>
                </div>

                {/* Login method */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      switchLoginMethod(
                        "password"
                      )
                    }
                    className={`py-2.5 border text-xs font-semibold ${
                      loginMethod === "password"
                        ? "border-registry-ink bg-registry-ink text-white"
                        : "border-graticule-teal/30 text-registry-ink/70 hover:bg-survey-paper"
                    }`}
                  >
                    Email + Password
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      switchLoginMethod(
                        "otp"
                      )
                    }
                    className={`py-2.5 border text-xs font-semibold ${
                      loginMethod === "otp"
                        ? "border-registry-ink bg-registry-ink text-white"
                        : "border-graticule-teal/30 text-registry-ink/70 hover:bg-survey-paper"
                    }`}
                  >
                    Login with OTP
                  </button>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-registry-ink/70 mb-1">
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-graticule-teal" />

                    <input
                      type="email"
                      required
                      autoFocus
                      value={email}
                      onChange={(e) =>
                        setEmail(
                          e.target.value
                        )
                      }
                      placeholder="officer@nic.in / officer@gov.in"
                      className="w-full pl-9 pr-3 py-3 border border-graticule-teal/30 focus:border-tilled-earth focus:outline-none text-sm bg-survey-paper/30"
                    />
                  </div>
                </div>

                {/* Password */}
                {loginMethod ===
                  "password" && (
                  <form
                    onSubmit={
                      handlePasswordLogin
                    }
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-registry-ink/70 mb-1">
                        Password
                      </label>

                      <div className="relative">
                        <LockKeyhole className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-graticule-teal" />

                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) =>
                            setPassword(
                              e.target.value
                            )
                          }
                          placeholder="Enter your password"
                          className="w-full pl-9 pr-3 py-3 border border-graticule-teal/30 focus:border-tilled-earth focus:outline-none text-sm bg-survey-paper/30"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-registry-ink text-white font-medium text-sm hover:bg-registry-ink/90 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" />

                      {loading
                        ? "Signing in..."
                        : "Sign In"}
                    </button>
                  </form>
                )}

                {/* OTP */}
                {loginMethod ===
                  "otp" && (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={
                      handleRequestLoginOtp
                    }
                    className="w-full py-3 bg-registry-ink text-white font-medium text-sm hover:bg-registry-ink/90 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Mail className="w-4 h-4" />

                    {loading
                      ? "Sending OTP..."
                      : "Send Login OTP"}
                  </button>
                )}
              </div>
            )}

          {/* ================================================== */}
          {/* EXISTING ACCOUNT OTP */}
          {/* ================================================== */}

          {mode === "login" &&
            step === "otp" && (
              <form
                onSubmit={
                  handleVerifyLoginOtp
                }
                className="space-y-5"
              >
                <div>
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-1.5 text-xs text-graticule-teal hover:text-registry-ink mb-4"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back
                  </button>

                  <h4 className="font-serif text-xl font-semibold text-registry-ink">
                    Verify your identity
                  </h4>

                  <p className="text-sm text-registry-ink/60 mt-1">
                    Enter the 6-digit code sent to:
                  </p>

                  <p className="text-sm font-semibold text-registry-ink mt-1">
                    {email}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-registry-ink/70 mb-1">
                    Verification Code
                  </label>

                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-graticule-teal" />

                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      autoFocus
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) =>
                        setOtp(
                          e.target.value.replace(
                            /\D/g,
                            ""
                          )
                        )
                      }
                      placeholder="000000"
                      className="w-full pl-9 pr-3 py-3 border border-graticule-teal/30 focus:border-tilled-earth focus:outline-none text-sm tracking-[0.3em] font-mono bg-survey-paper/30"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-registry-ink text-white font-medium text-sm hover:bg-registry-ink/90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />

                  {loading
                    ? "Verifying..."
                    : "Verify & Sign In"}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={
                      handleRequestLoginOtp
                    }
                    className="text-xs text-graticule-teal hover:text-registry-ink underline"
                  >
                    Resend login OTP
                  </button>
                </div>
              </form>
            )}

          {/* ================================================== */}
          {/* CREATE ACCOUNT - EMAIL */}
          {/* ================================================== */}

          {mode === "register" &&
            step === "form" && (
              <form
                onSubmit={
                  handleRegisterRequestOtp
                }
                className="space-y-5"
              >
                <div>
                  <h4 className="font-serif text-xl font-semibold text-registry-ink">
                    Create your account
                  </h4>

                  <p className="text-sm text-registry-ink/60 mt-1">
                    Enter your email. We will verify it before
                    creating your BhoomiSetu account.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-registry-ink/70 mb-1">
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-graticule-teal" />

                    <input
                      type="email"
                      required
                      autoFocus
                      value={email}
                      onChange={(e) =>
                        setEmail(
                          e.target.value
                        )
                      }
                      placeholder="yourname@example.com"
                      className="w-full pl-9 pr-3 py-3 border border-graticule-teal/30 focus:border-tilled-earth focus:outline-none text-sm bg-survey-paper/30"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-registry-ink text-white font-medium text-sm hover:bg-registry-ink/90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />

                  {loading
                    ? "Sending OTP..."
                    : "Send Registration OTP"}
                </button>
              </form>
            )}

          {/* ================================================== */}
          {/* CREATE ACCOUNT - OTP + DETAILS */}
          {/* ================================================== */}

          {mode === "register" &&
            step === "otp" && (
              <form
                onSubmit={
                  handleVerifyRegisterOtp
                }
                className="space-y-5"
              >
                <div>
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-1.5 text-xs text-graticule-teal hover:text-registry-ink mb-4"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Change email
                  </button>

                  <h4 className="font-serif text-xl font-semibold text-registry-ink">
                    Create your account
                  </h4>

                  <p className="text-sm text-registry-ink/60 mt-1">
                    Enter the OTP and complete your account details.
                  </p>

                  <p className="text-sm font-semibold text-registry-ink mt-1">
                    {email}
                  </p>
                </div>

                {/* OTP */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-registry-ink/70 mb-1">
                    Registration OTP
                  </label>

                  <div className="relative">
                    <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-graticule-teal" />

                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      autoFocus
                      required
                      maxLength={6}
                      value={otp}
                      onChange={(e) =>
                        setOtp(
                          e.target.value.replace(
                            /\D/g,
                            ""
                          )
                        )
                      }
                      placeholder="000000"
                      className="w-full pl-9 pr-3 py-3 border border-graticule-teal/30 focus:border-tilled-earth focus:outline-none text-sm tracking-[0.3em] font-mono bg-survey-paper/30"
                    />
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-registry-ink/70 mb-1">
                    Full Name
                  </label>

                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-graticule-teal" />

                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) =>
                        setFullName(
                          e.target.value
                        )
                      }
                      placeholder="Your full name"
                      className="w-full pl-9 pr-3 py-3 border border-graticule-teal/30 focus:border-tilled-earth focus:outline-none text-sm bg-survey-paper/30"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-registry-ink/70 mb-1">
                    Password
                  </label>

                  <div className="relative">
                    <LockKeyhole className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-graticule-teal" />

                    <input
                      type="password"
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) =>
                        setPassword(
                          e.target.value
                        )
                      }
                      placeholder="Minimum 6 characters"
                      className="w-full pl-9 pr-3 py-3 border border-graticule-teal/30 focus:border-tilled-earth focus:outline-none text-sm bg-survey-paper/30"
                    />
                  </div>
                </div>

                {/* Designation + Department */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-registry-ink/70 mb-1">
                      Designation
                    </label>

                    <input
                      type="text"
                      value={designation}
                      onChange={(e) =>
                        setDesignation(
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2.5 border border-graticule-teal/30 focus:border-tilled-earth focus:outline-none text-sm bg-survey-paper/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-registry-ink/70 mb-1">
                      Department
                    </label>

                    <input
                      type="text"
                      value={department}
                      onChange={(e) =>
                        setDepartment(
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2.5 border border-graticule-teal/30 focus:border-tilled-earth focus:outline-none text-sm bg-survey-paper/30"
                    />
                  </div>
                </div>

                {/* State + District */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-registry-ink/70 mb-1">
                      State
                    </label>

                    <input
                      type="text"
                      value={stateName}
                      onChange={(e) =>
                        setStateName(
                          e.target.value
                        )
                      }
                      placeholder="Optional"
                      className="w-full px-3 py-2.5 border border-graticule-teal/30 focus:border-tilled-earth focus:outline-none text-sm bg-survey-paper/30"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-registry-ink/70 mb-1">
                      District
                    </label>

                    <input
                      type="text"
                      value={district}
                      onChange={(e) =>
                        setDistrict(
                          e.target.value
                        )
                      }
                      placeholder="Optional"
                      className="w-full px-3 py-2.5 border border-graticule-teal/30 focus:border-tilled-earth focus:outline-none text-sm bg-survey-paper/30"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-registry-ink/70 mb-1">
                    Phone
                  </label>

                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) =>
                      setPhone(
                        e.target.value
                      )
                    }
                    placeholder="Optional"
                    className="w-full px-3 py-2.5 border border-graticule-teal/30 focus:border-tilled-earth focus:outline-none text-sm bg-survey-paper/30"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-registry-ink text-white font-medium text-sm hover:bg-registry-ink/90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />

                  {loading
                    ? "Creating account..."
                    : "Verify OTP & Create Account"}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() =>
                      handleRegisterRequestOtp()
                    }
                    className="text-xs text-graticule-teal hover:text-registry-ink underline"
                  >
                    Resend registration OTP
                  </button>
                </div>
              </form>
            )}

          {/* ================================================== */}
          {/* SECURITY NOTE */}
          {/* ================================================== */}

          <div className="pt-3 border-t border-graticule-teal/20">
            <div className="flex gap-2 items-start">
              <ShieldCheck className="w-4 h-4 text-graticule-teal shrink-0 mt-0.5" />

              <p className="text-[11px] text-registry-ink/50 leading-relaxed">
                Authentication is protected using secure
                password authentication and temporary
                verification codes. Never share your password
                or OTP with anyone.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}