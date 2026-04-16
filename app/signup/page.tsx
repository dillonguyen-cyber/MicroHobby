"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Leaf, ArrowRight, Sparkles, Camera } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function SignupPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const initials = formData.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setIsLoading(true);
    try {
      await signUp(formData.name.trim(), formData.email.trim(), formData.password, photo);
      router.push("/account");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b border-border bg-background/95 backdrop-blur">
        <div className="container max-w-6xl mx-auto flex h-16 items-center px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-hobby-yellow">
              <Leaf className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold text-foreground">MicroHobby</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 mb-4">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Start your creative journey</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Create your account</h1>
            <p className="text-muted-foreground">Join thousands discovering new hobbies every day</p>
          </div>

          <Card className="border-border/50 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl">Sign up</CardTitle>
              <CardDescription>Enter your details to create your MicroHobby account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Photo upload */}
                <div className="flex flex-col items-center gap-2 pb-2">
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handlePhotoChange}
                  />
                  <div className="relative">
                    <Avatar className="h-20 w-20 border-4 border-background shadow-md">
                      <AvatarImage src={photo ?? undefined} />
                      <AvatarFallback className="text-xl bg-primary/10 text-primary">
                        {initials || "?"}
                      </AvatarFallback>
                    </Avatar>
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className="absolute bottom-0 right-0 h-7 w-7 rounded-full shadow"
                      onClick={() => fileRef.current?.click()}
                    >
                      <Camera className="h-3.5 w-3.5" />
                      <span className="sr-only">Upload photo</span>
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {photo ? "Photo added ✓" : "Add a profile photo (optional)"}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                  />
                  <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="flex items-start gap-2">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, agreeToTerms: checked as boolean }))
                    }
                    required
                  />
                  <Label htmlFor="terms" className="text-sm text-muted-foreground leading-tight">
                    I agree to the{" "}
                    <Link href="#" className="text-primary hover:underline">Terms of Service</Link>{" "}
                    and{" "}
                    <Link href="#" className="text-primary hover:underline">Privacy Policy</Link>
                  </Label>
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 dark:bg-red-950/20 rounded-lg px-3 py-2">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading || !formData.agreeToTerms}
                >
                  {isLoading ? (
                    "Creating account..."
                  ) : (
                    <>
                      Get Started <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="text-primary font-medium hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="text-2xl font-bold text-primary">500+</div>
              <div className="text-xs text-muted-foreground">Micro hobbies</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-hobby-coral">20 min</div>
              <div className="text-xs text-muted-foreground">Average time</div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-hobby-blue">Free</div>
              <div className="text-xs text-muted-foreground">Forever</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
