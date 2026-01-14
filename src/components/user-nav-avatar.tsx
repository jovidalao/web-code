"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOutIcon, SettingsIcon, UserIcon } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { createClient } from "@/lib/supabase/client";

function getInitials(nameOrEmail?: string | null) {
  if (!nameOrEmail) return "U";
  const s = nameOrEmail.trim();
  if (s.includes("@")) return s[0]?.toUpperCase() ?? "U";
  const parts = s.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "U";
}

export function UserNavAvatar() {
  const router = useRouter();
  const supabase = React.useMemo(() => createClient(), []);

  const [user, setUser] = React.useState<{
    email?: string | null;
    name?: string | null;
    avatarUrl?: string | null;
  } | null>(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setUser({
          email: data.session.user.email,
          name: data.session.user.user_metadata.full_name,
          avatarUrl: data.session.user.user_metadata.avatar_url,
        });
      }
    };
    fetchUser();
  }, [supabase]);

  async function onSignOut() {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/auth/login");
  }

  const displayName = user?.name || user?.email || "User";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="rounded-full outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Open user menu"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatarUrl ?? undefined} alt={displayName} />
            <AvatarFallback>
              {getInitials(user?.name || user?.email)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={user?.avatarUrl ?? undefined}
                alt={displayName}
              />
              <AvatarFallback>
                {getInitials(user?.name || user?.email)}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col justify-center space-y-0.5 overflow-hidden">
              <p className="text-sm font-medium leading-none truncate">
                {user?.name ?? "No name"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email ?? "No email"}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <Link href="/account" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            <span>Account</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={onSignOut}
          className="cursor-pointer flex items-center gap-2"
        >
          <LogOutIcon className="h-4 w-4" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
