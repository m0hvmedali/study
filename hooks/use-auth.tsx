"use client"

import { useState, useEffect, createContext, useContext, type ReactNode } from "react"
import { createClient } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    console.log("[v0] AuthProvider: Initializing auth state")

    const getSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        console.log("[v0] AuthProvider: Session data:", session)
        console.log("[v0] AuthProvider: Session error:", error)

        if (session?.user) {
          console.log("[v0] AuthProvider: User found, setting user state")
          setUser(session.user)
        } else {
          console.log("[v0] AuthProvider: No user found")
          setUser(null)
        }
      } catch (error) {
        console.error("[v0] AuthProvider: Error getting session:", error)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[v0] AuthProvider: Auth state changed:", event, session)

      if (session?.user) {
        console.log("[v0] AuthProvider: Setting user from auth state change")
        setUser(session.user)
      } else {
        console.log("[v0] AuthProvider: Clearing user from auth state change")
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signIn = async (email: string, password: string) => {
    console.log("[v0] AuthProvider: Attempting sign in for:", email)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    console.log("[v0] AuthProvider: Sign in result:", data, error)

    if (error) {
      if (error.message.includes("Email not confirmed")) {
        // Try to get the user anyway since we want to allow unconfirmed emails
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (session?.user) {
          console.log("[v0] AuthProvider: Using unconfirmed user")
          setUser(session.user)
          return
        }
      }
      throw error
    }
  }

  const signUp = async (email: string, password: string) => {
    console.log("[v0] AuthProvider: Attempting sign up for:", email)

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    console.log("[v0] AuthProvider: Sign up result:", data, error)

    if (error) {
      throw error
    }

    if (data.user && !error) {
      console.log("[v0] AuthProvider: Auto-signing in after signup")
      await signIn(email, password)
    }
  }

  const signOut = async () => {
    console.log("[v0] AuthProvider: Signing out")
    await supabase.auth.signOut()
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  }

  console.log("[v0] AuthProvider: Current auth state - User:", user?.email, "Loading:", loading)

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
