"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  IconEye,
  IconEyeOff,
  IconLoader,
  IconUserPlus,
  IconAlertCircle,
  IconMail,
  IconLock,
  IconUser,
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { OAuthButtons } from "./oauth-buttons";
import Link from "next/link";

interface RegisterFormProps {
  redirectTo?: string;
  showOAuth?: boolean;
  showLoginLink?: boolean;
  className?: string;
}

interface PasswordStrength {
  score: number;
  feedback: string[];
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSpecialChar: boolean;
}

export function RegisterForm({
  redirectTo = "/dashboard",
  showOAuth = true,
  showLoginLink = true,
  className,
}: RegisterFormProps) {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthContext();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    acceptTerms: false,
    acceptMarketing: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const getPasswordStrength = (password: string): PasswordStrength => {
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const conditions = [
      hasMinLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecialChar,
    ];
    const score = (conditions.filter(Boolean).length / conditions.length) * 100;

    const feedback: string[] = [];
    if (!hasMinLength) feedback.push("At least 8 characters");
    if (!hasUppercase) feedback.push("One uppercase letter");
    if (!hasLowercase) feedback.push("One lowercase letter");
    if (!hasNumber) feedback.push("One number");
    if (!hasSpecialChar) feedback.push("One special character");

    return {
      score,
      feedback,
      hasMinLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecialChar,
    };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const getPasswordStrengthColor = (score: number) => {
    if (score < 40) return "bg-red-500";
    if (score < 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getPasswordStrengthText = (score: number) => {
    if (score < 40) return "Weak";
    if (score < 70) return "Good";
    return "Strong";
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Name validation
    if (!formData.name.trim()) {
      errors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    // Email validation
    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    // Password validation
    if (!formData.password) {
      errors.password = "Password is required";
    } else if (passwordStrength.score < 40) {
      errors.password = "Please choose a stronger password";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    // Terms validation
    if (!formData.acceptTerms) {
      errors.acceptTerms = "You must accept the terms and conditions";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const success = await register({
        name: formData.name.trim(),
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (success) {
        toast.success("Account created!", {
          description: "Welcome to MovieStream! You're now signed in.",
        });
        router.push(redirectTo);
      }
    } catch (error) {
      toast.error("Registration failed", {
        description: "Please check your information and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const isFormLoading = isLoading || isSubmitting;

  return (
    <Card className={className}>
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
        <p className="text-muted-foreground">
          Sign up to start streaming movies and shows
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* OAuth Buttons */}
        {showOAuth && (
          <>
            <OAuthButtons
              onSuccess={() => router.push(redirectTo)}
              disabled={isFormLoading}
            />
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>
          </>
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <IconAlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <IconUser className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`pl-10 ${
                  validationErrors.name ? "border-destructive" : ""
                }`}
                disabled={isFormLoading}
                autoComplete="name"
              />
            </div>
            {validationErrors.name && (
              <p className="text-sm text-destructive">
                {validationErrors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <IconMail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`pl-10 ${
                  validationErrors.email ? "border-destructive" : ""
                }`}
                disabled={isFormLoading}
                autoComplete="email"
              />
            </div>
            {validationErrors.email && (
              <p className="text-sm text-destructive">
                {validationErrors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <IconLock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className={`pl-10 pr-10 ${
                  validationErrors.password ? "border-destructive" : ""
                }`}
                disabled={isFormLoading}
                autoComplete="new-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-7 w-7 p-0"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isFormLoading}
              >
                {showPassword ? (
                  <IconEyeOff className="h-3 w-3" />
                ) : (
                  <IconEye className="h-3 w-3" />
                )}
              </Button>
            </div>

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    Password strength:
                  </span>
                  <span
                    className={`font-medium ${
                      passwordStrength.score < 40
                        ? "text-red-600"
                        : passwordStrength.score < 70
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  >
                    {getPasswordStrengthText(passwordStrength.score)}
                  </span>
                </div>
                <Progress
                  value={passwordStrength.score}
                  className="h-2"
                  color={getPasswordStrengthColor(passwordStrength.score)}
                />
                {passwordStrength.feedback.length > 0 && (
                  <div className="grid grid-cols-1 gap-1 text-xs text-muted-foreground">
                    {passwordStrength.feedback.map((item, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <IconX className="h-3 w-3 text-red-500" />
                        {item}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {validationErrors.password && (
              <p className="text-sm text-destructive">
                {validationErrors.password}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <IconLock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                className={`pl-10 pr-10 ${
                  validationErrors.confirmPassword ? "border-destructive" : ""
                }`}
                disabled={isFormLoading}
                autoComplete="new-password"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1 h-7 w-7 p-0"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isFormLoading}
              >
                {showConfirmPassword ? (
                  <IconEyeOff className="h-3 w-3" />
                ) : (
                  <IconEye className="h-3 w-3" />
                )}
              </Button>
            </div>
            {formData.confirmPassword &&
              formData.password === formData.confirmPassword && (
                <div className="flex items-center gap-1 text-xs text-green-600">
                  <IconCheck className="h-3 w-3" />
                  Passwords match
                </div>
              )}
            {validationErrors.confirmPassword && (
              <p className="text-sm text-destructive">
                {validationErrors.confirmPassword}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={formData.acceptTerms}
                onCheckedChange={(checked: any) =>
                  handleInputChange("acceptTerms", checked)
                }
                disabled={isFormLoading}
                className={
                  validationErrors.acceptTerms ? "border-destructive" : ""
                }
              />
              <div className="grid gap-1.5 leading-none">
                <Label htmlFor="terms" className="text-sm cursor-pointer">
                  I agree to the{" "}
                  <Link
                    href="/terms"
                    className="text-primary hover:underline"
                    target="_blank"
                  >
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-primary hover:underline"
                    target="_blank"
                  >
                    Privacy Policy
                  </Link>
                </Label>
                {validationErrors.acceptTerms && (
                  <p className="text-xs text-destructive">
                    {validationErrors.acceptTerms}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="marketing"
                checked={formData.acceptMarketing}
                onCheckedChange={(checked: any) =>
                  handleInputChange("acceptMarketing", checked)
                }
                disabled={isFormLoading}
              />
              <Label htmlFor="marketing" className="text-sm cursor-pointer">
                I would like to receive marketing updates and special offers
              </Label>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isFormLoading}
            size="lg"
          >
            {isFormLoading ? (
              <>
                <IconLoader className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              <>
                <IconUserPlus className="mr-2 h-4 w-4" />
                Create Account
              </>
            )}
          </Button>
        </form>

        {/* Login Link */}
        {showLoginLink && (
          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              Already have an account?{" "}
            </span>
            <Link
              href="/auth/login"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
