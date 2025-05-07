"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Alert } from "flowbite-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function AuthPage() {
  const [mode, setMode] = useState("login"); // "login" or "signup"
  // Login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Signup state
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  // Shared state
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/movies";

  // Show a user-friendly message for OAuthAccountNotLinked
  const errorParam = searchParams.get("error");
  const oauthAccountNotLinked = errorParam === "OAuthAccountNotLinked";
  const callbackError = errorParam === "Callback";

  async function handleLogin(e) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setErrorMessage(res.error);
      } else {
        router.push(callbackUrl);
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSignUp(e) {
    e.preventDefault();
    setErrorMessage("");
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || "Failed to sign up.");
        setIsLoading(false);
        return;
      }
      const loginRes = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });
      if (loginRes?.ok) {
        router.push("/movies");
      } else {
        setErrorMessage("Signup succeeded, but login failed.");
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleLogin() {
    setIsLoading(true);
    setErrorMessage("");
    try {
      await signIn("google", { callbackUrl });
    } catch (error) {
      setErrorMessage("Failed to login with Google");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="max-w-md w-full mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Welcome</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={mode} value={mode} onValueChange={setMode} className="w-full">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="login" className="flex-1">Login</TabsTrigger>
              <TabsTrigger value="signup" className="flex-1">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              {errorMessage && (
                <Alert color="failure" onDismiss={() => setErrorMessage("")}>{errorMessage}</Alert>
              )}
              {oauthAccountNotLinked && (
                <Alert color="failure" className="mb-4">
                  This email is already registered with a different sign-in method. Please use your original login method (e.g., Google or password) to sign in.
                </Alert>
              )}
              {callbackError && (
                <Alert color="failure" className="mb-4">
                  There was an error during authentication. Please try again or use a different sign-in method.
                </Alert>
              )}
              <form onSubmit={handleLogin} className="mb-4">
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mb-4"
                  required
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mb-4"
                  required
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded mb-4 hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </button>
              </form>
            </TabsContent>
            <TabsContent value="signup">
              {errorMessage && (
                <Alert color="failure" onDismiss={() => setErrorMessage("")}>{errorMessage}</Alert>
              )}
              <form onSubmit={handleSignUp} className="mb-4">
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mb-4"
                  required
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mb-4"
                  required
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mb-4"
                  required
                />
                <Input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mb-4"
                  required
                />
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded mb-4 hover:bg-blue-700 disabled:opacity-50"
                >
                  {isLoading ? "Signing up..." : "Sign Up"}
                </button>
              </form>
            </TabsContent>
          </Tabs>
          <div className="text-center mb-4 text-gray-500">OR</div>
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            type="button"
            className="w-full bg-white text-gray-700 py-2 px-4 rounded flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 disabled:opacity-50"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
        </CardContent>
      </Card>
    </div>
  );
}