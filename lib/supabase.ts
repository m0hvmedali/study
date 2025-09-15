import { createBrowserClient, createServerClient } from "@supabase/ssr"

const supabaseUrl = "https://urzxbbqelpnzitqvffhs.supabase.co"
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyenhiYnFlbHBueml0cXZmZmhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMwNDE3MjAsImV4cCI6MjA2ODYxNzcyMH0._PQVKc-3lwovmGczX-rT0K0oHQVFktg0-0koEp3AM64"

export { createBrowserClient, createServerClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

export function createServerSupabaseClient() {
  // Dynamic import to avoid build errors when used in client components
  const { cookies } = require("next/headers")
  const cookieStore = cookies()

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: any) {
        cookieStore.set({ name, value, ...options })
      },
      remove(name: string, options: any) {
        cookieStore.set({ name, value: "", ...options })
      },
    },
  })
}
