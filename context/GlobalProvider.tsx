import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { getCurrentUser, logout } from "../lib/appwrite";
import { useRouter } from "expo-router";
import { useVotedPolls } from "@/context/VotedPollsContext";

interface User {
  name: string;
  email: string;
  $id: string;
}

interface GlobalContextProps {
  isLogged: boolean;
  setIsLogged: (isLogged: boolean) => void;
  user: any;
  setUser: (user: any) => void;
  loading: boolean;
  handleLogout: () => Promise<void>;
}

const GlobalContext = createContext<GlobalContextProps>({
  isLogged: false,
  setIsLogged: () => {},
  user: null,
  setUser: () => {},
  loading: true,
  handleLogout: async () => {},
});

export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }: { children: ReactNode }) => {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { setVotedPolls } = useVotedPolls();
  const router = useRouter();

  useEffect(() => {
    getCurrentUser()
      .then((res) => {
        if (res) {
          setIsLogged(true);
          setUser(res);
        } else {
          setIsLogged(false);
          setUser(null);
        }
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleLogout = async () => {
    await logout();
    setVotedPolls([]); // Clear voted polls on logout
    setIsLogged(false);
    setUser(null);
    router.push("/sign-in"); // Redirect to login page
  };

  return (
    <GlobalContext.Provider
      value={{
        isLogged,
        setIsLogged,
        user,
        setUser,
        loading,
        handleLogout,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;
