// pages/Signup.tsx
import React, { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Signup Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signup Successful",
        description: "Please check your email to confirm your account.",
      });
      navigate("/admin/login");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <form onSubmit={handleSignup} className="space-y-4 w-full max-w-md p-6 border rounded-xl shadow">
        <h2 className="text-xl font-semibold text-center">Create an Account</h2>
        <input
          type="email"
          placeholder="Email"
          required
          className="input-field"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <input
          type="password"
          placeholder="Password"
          required
          className="input-field"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <button className="btn-primary w-full" disabled={loading}>
          {loading ? "Creating..." : "Sign Up"}
        </button>
      </form>
    </div>
  );
};

export default Signup;
