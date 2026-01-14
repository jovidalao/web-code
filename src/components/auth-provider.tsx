"use client";

import {
  createContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

type AuthState = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
};

type AuthContextValue = AuthState & {
  /** 手动刷新用户状态 */
  refresh: () => Promise<void>;
  /** 登出 */
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: ReactNode;
  /**
   * 服务端预取的用户信息，用于避免客户端首次加载闪烁
   * 从 Server Component 传入
   */
  initialUser?: User | null;
  initialSession?: Session | null;
};

/**
 * AuthProvider - 类似于 ClerkProvider 的认证上下文提供者
 *
 * 功能：
 * 1. 提供全局用户状态
 * 2. 监听认证状态变化（登录/登出/token 刷新）
 * 3. 支持服务端预取，避免 hydration 闪烁
 */
export function AuthProvider({
  children,
  initialUser = null,
  initialSession = null,
}: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [session, setSession] = useState<Session | null>(initialSession);
  const [isLoading, setIsLoading] = useState(!initialUser);

  const supabase = useMemo(() => createClient(), []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const {
        data: { user: currentUser, session: currentSession },
      } = await supabase.auth.getUser().then(async ({ data: { user } }) => {
        const { data } = await supabase.auth.getSession();
        return { data: { user, session: data.session } };
      });
      setUser(currentUser);
      setSession(currentSession);
    } catch (error) {
      console.error("Failed to refresh auth state:", error);
      setUser(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, [supabase]);

  useEffect(() => {
    // 如果没有初始用户，首次加载时获取
    if (!initialUser) {
      refresh();
    }

    // 监听认证状态变化
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      // 只在关键事件时更新状态，避免不必要的重渲染
      if (
        event === "SIGNED_IN" ||
        event === "SIGNED_OUT" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED"
      ) {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, initialUser, refresh]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      session,
      isLoading,
      isAuthenticated: !!user,
      refresh,
      signOut,
    }),
    [user, session, isLoading, refresh, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// /**
//  * useAuth - 获取认证状态的 hook
//  *
//  * @example
//  * ```tsx
//  * function MyComponent() {
//  *   const { user, isLoading, isAuthenticated, signOut } = useAuth()
//  *
//  *   if (isLoading) return <Spinner />
//  *   if (!isAuthenticated) return <LoginPrompt />
//  *
//  *   return <div>Hello, {user.email}</div>
//  * }
//  * ```
//  */
// export function useAuth() {
//   const context = useContext(AuthContext);

//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }

//   return context;
// }

// /**
//  * useUser - 简化版 hook，只获取用户信息
//  */
// export function useUser() {
//   const { user, isLoading } = useAuth();
//   return { user, isLoading };
// }

// /**
//  * useSession - 简化版 hook，只获取 session 信息
//  */
// export function useSession() {
//   const { session, isLoading } = useAuth();
//   return { session, isLoading };
// }

// /**
//  * Authenticated - 只在用户已登录时渲染子组件
//  * 类似 Convex 的 Authenticated 组件
//  *
//  * @example
//  * ```tsx
//  * <Authenticated>
//  *   <Dashboard />  // 只有登录用户能看到
//  * </Authenticated>
//  * ```
//  */
// export function Authenticated({ children }: { children: ReactNode }) {
//   const { isAuthenticated, isLoading } = useAuth();

//   if (isLoading || !isAuthenticated) {
//     return null;
//   }

//   return <>{children}</>;
// }

// /**
//  * Unauthenticated - 只在用户未登录时渲染子组件
//  *
//  * @example
//  * ```tsx
//  * <Unauthenticated>
//  *   <LoginPrompt />  // 只有未登录用户能看到
//  * </Unauthenticated>
//  * ```
//  */
// export function Unauthenticated({ children }: { children: ReactNode }) {
//   const { isAuthenticated, isLoading } = useAuth();

//   if (isLoading || isAuthenticated) {
//     return null;
//   }

//   return <>{children}</>;
// }

// /**
//  * AuthLoading - 在认证状态加载中时渲染子组件
//  *
//  * @example
//  * ```tsx
//  * <AuthLoading>
//  *   <Spinner />
//  * </AuthLoading>
//  * ```
//  */
// export function AuthLoading({ children }: { children: ReactNode }) {
//   const { isLoading } = useAuth();

//   if (!isLoading) {
//     return null;
//   }

//   return <>{children}</>;
// }
