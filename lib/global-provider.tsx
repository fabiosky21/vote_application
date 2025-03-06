import React, { createContext, useContext, ReactNode, useEffect } from "react";
import { getCurrentUser, logout } from "./appwrite";
import { useAppwrite } from "./useAppwrite";
import { useVotedPolls } from "../context/VotedPollsContext";

interface GlobalContextType {
  isLogged: boolean;
  user: User | null;
  loading: boolean;
  refetch: (newParams: Record<string, string | number>) => Promise<void>;
  handleLogout: () => Promise<void>;
}

interface User {
  $id: string;
  name: string;
  email: string;
  avatar: string;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

interface GlobalProviderProps {
  children: ReactNode;
}

export const GlobalProvider = ({ children }: GlobalProviderProps) => {
  const {
    data: user = null, // Default to null
    loading = false, 
    refetch = () => Promise.resolve(), 
  } = useAppwrite({
    fn: getCurrentUser,
  });
  const { setVotedPolls, refreshVotedPolls } = useVotedPolls();

  const isLogged = !!user;
  useEffect(() => {
    if (user) {
      refreshVotedPolls();
    } else {
      setVotedPolls([]);
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    setVotedPolls([]); // Clear voted polls on logout
    refetch({}); // Refetch user data to update the context
  };

  console.log("User Data:", user); 

  return (
    <GlobalContext.Provider
      value={{
        isLogged,
        user,
        loading,
        refetch,
        handleLogout,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = (): GlobalContextType => {
  const context = useContext(GlobalContext);
  if (!context)
    throw new Error("useGlobalContext must be used within a GlobalProvider");

  return context;
};
export default GlobalProvider;
