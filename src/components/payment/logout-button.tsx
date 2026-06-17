"use client";

import { useState } from "react";
import { useClerk } from "@clerk/nextjs";
import { LogOut, Loader2 } from "lucide-react";

export function LogoutButton() {
  const { signOut } = useClerk();
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    await signOut({ redirectUrl: `${window.location.origin}/sign-in` });
  };

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoading}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <Loader2 className="size-3.5 animate-spin" />
      ) : (
        <LogOut className="size-3.5" />
      )}
      {isLoading ? "กำลังออก..." : "ออกจากระบบ"}
    </button>
  );
}
