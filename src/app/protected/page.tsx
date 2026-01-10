import { redirect } from "next/navigation";

import { LogoutButton } from "@/components/logout-button";
import { createClient } from "@/lib/supabase/server";
import { CurrentUserAvatar } from "@/components/current-user-avatar";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    redirect("/auth/login");
  }

  return (
    <div className="flex h-svh w-full items-center justify-center gap-2">
      <CurrentUserAvatar />
      <p>
        Hello <span>{user.email}</span>
      </p>
      <LogoutButton />
    </div>
  );
}
