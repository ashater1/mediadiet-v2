import { createContext, useContext } from "react";
import { getUserById } from "./auth.server";

type User = Awaited<ReturnType<typeof getUserById>>;

export const UserContext = createContext<User | null>(null);

export function useUserContext() {
  const context = useContext(UserContext);
  return context;
}

export function getAvatarUrl(avatar: string) {
  return `https://cgoipxithucvtnbvyypv.supabase.co/storage/v1/object/public/public/avatars/${avatar}`;
}

export function UserContextProvider({
  user,
  children,
}: {
  user: User | null;
  children: React.ReactNode;
}) {
  return (
    <UserContext.Provider value={user || null}>{children}</UserContext.Provider>
  );
}
