"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "flowbite-react";
import { signIn } from "next-auth/react";

export default function SignUpPage() {
  const [name, setName] = useState(""); // ✅ NEW
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  async function handleSignUp(e) {
    e.preventDefault();
    setErrorMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }), // ✅ Include name
    });

    const data = await res.json();

    if (!res.ok) {
      setErrorMessage(data.error || "Failed to sign up.");
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
  }

  return (
    <form onSubmit={handleSignUp} className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl mb-4">Sign Up</h2>
      {errorMessage && (
        <Alert color="failure" onDismiss={() => setErrorMessage("")}>
          {errorMessage}
        </Alert>
      )}
      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="block mb-4 w-full p-2 border"
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="block mb-4 w-full p-2 border"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="block mb-4 w-full p-2 border"
        required
      />
      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        className="block mb-4 w-full p-2 border"
        required
      />
      <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded">
        Sign Up
      </button>
    </form>
  );
}