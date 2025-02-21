"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User as SupabaseUser, supabase } from "@/lib/supabase/client";
import { toast } from "react-hot-toast";
import { User } from "@/lib/supabase/types";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  credits: number;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshCredits: () => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  refreshUser: () => Promise<void>;
  checkEmailVerified: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(0);

  // Function to fetch user credits
  const fetchUserCredits = async (userId: string) => {
    const { data, error } = await supabase
      .from("users")
      .select("credits")
      .eq("id", userId)
      .single();

    if (!error && data) {
      setCredits(data.credits);
    }
  };

  // Add refresh credits function
  const refreshCredits = async () => {
    if (user?.id) {
      await fetchUserCredits(user.id);
    }
  };

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUser(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUser(session.user.id);
      } else {
        setUser(null);
        setCredits(0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUser = async (userId: string) => {
    try {
      const { data: userData, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user:", error.message);
        return;
      }

      if (userData) {
        setUser(userData);
        setCredits(userData.credits);
      }
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error fetching user:", error.message);
      }
    }
  };

  const sendVerificationEmail = async () => {
    try {
      await fetch("/api/send-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user?.email,
          userId: user?.id,
        }),
      });
    } catch (error) {
      console.error("Failed to send verification email:", error);
    }
  };

  const refreshUser = async () => {
    if (user?.id) {
      await fetchUser(user.id);
    }
  };

  const checkEmailVerified = () => {
    if (!user?.email_verified) {
      throw new Error("Please verify your email to generate diagrams");
    }
    return true;
  };

  const value = {
    user,
    loading,
    credits,
    signIn: async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      // Check user status after sign in
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("status, email_verified")
        .eq("email", email)
        .single();

      if (userError) throw userError;

      if (userData.status === "banned") {
        await supabase.auth.signOut();
        throw new Error(
          "Your account has been banned. Please contact support."
        );
      }

      if (!userData.email_verified) {
        toast.error("Please verify your email to generate diagrams", {
          duration: 5000,
        });
        // Send verification email
        await fetch("/api/send-verification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email,
            userId: (await supabase.auth.getUser()).data.user?.id,
          }),
        });
      }
    },
    signUp: async (email: string, password: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;

      // Send verification email if signup was successful
      if (data.user) {
        await fetch("/api/send-verification", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: data.user.email,
            userId: data.user.id,
          }),
        });
        toast.success("Verification email sent! Please check your inbox.");
      }
    },
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    refreshCredits,
    sendVerificationEmail,
    refreshUser,
    checkEmailVerified,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
