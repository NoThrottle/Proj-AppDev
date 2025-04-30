// app/login/page.js
"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "flowbite-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    setErrorMessage("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (res?.ok) {
      router.push('/movies');
    } else {
      setErrorMessage('Invalid email or password.');
    }
  }

  return (
    <form onSubmit={handleLogin} className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl mb-4">Login</h2>
      {errorMessage && (
        <Alert color="failure" onDismiss={() => setErrorMessage("")}>{errorMessage}</Alert>
      )}
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
      <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded">Sign In</button>
    </form>
  );
}