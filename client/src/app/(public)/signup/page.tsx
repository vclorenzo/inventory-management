"use client";

import { useSignUpMutation } from "@/state/internal/authApi";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();
  const [signUp, { isLoading }] = useSignUpMutation();

  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await signUp({ name, email, password, role }).unwrap();
      router.push("/");
    } catch (err: any) {
      setError(
        err?.data?.message ||
          err?.data?.error ||
          "Login failed. Please check your credentials.",
      );
    }
  };

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-md bg-white border border-gray-100 shadow-sm rounded-xl p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Sign up</h1>
          <p className="text-sm text-gray-500">Register your new account.</p>
        </div>

        <form className="flex flex-col gap-4" onSubmit={onSubmit}>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700" htmlFor="name">
              Name
            </label>
            <input
              id="name"
              type="name"
              //   autoComplete="current-password"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:border-blue-500"
              placeholder="John Doe"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              className="text-sm font-medium text-gray-700"
              htmlFor="email"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              //   autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:border-blue-500"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              className="text-sm font-medium text-gray-700"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              //   autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:border-blue-500"
              placeholder="••••••••"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              className="text-sm font-medium text-gray-700"
              htmlFor="confirmPassword"
            >
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="confirmPassword"
              //   autoComplete="current-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:border-blue-500"
              placeholder="••••••••"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700" htmlFor="role">
              Role
            </label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="px-4 py-2 border rounded-lg text-gray-700 focus:outline-none focus:border-blue-500"
              required
            >
              <option value="">--Please choose role--</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
              <option value="guest">Guest</option>
            </select>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-[50px] rounded bg-blue-500 text-white hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading ? "Signing up…" : "Sign up"}
          </button>

          <p className="text-xs text-gray-500">
            Already have an account?{" "}
            <Link className="text-blue-600 hover:underline" href="/login">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
