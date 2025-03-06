import React, { createContext, useState, useContext, useEffect } from "react";
import { getUserVotedPolls, getCurrentUser } from "@/lib/appwrite";

interface Poll {
  id: string;
  title: string;
  description: string;
  image: string;
}

interface VotedPollsContextProps {
  votedPolls: Poll[];
  setVotedPolls: React.Dispatch<React.SetStateAction<Poll[]>>;
  refreshVotedPolls: () => void;
}

const VotedPollsContext = createContext<VotedPollsContextProps | undefined>(
  undefined
);

interface VotedPollsProviderProps {
  children: React.ReactNode;
}

export const VotedPollsProvider: React.FC<VotedPollsProviderProps> = ({
  children,
}) => {
  const [votedPolls, setVotedPolls] = useState<Poll[]>([]);
  const [user, setUser] = useState<any>(null);

  const refreshVotedPolls = async () => {
    try {
      const polls = await getUserVotedPolls();
      const formattedPolls = polls.map((poll: any) => ({
        id: poll.$id,
        title: poll.title,
        description: poll.briefDescription,
        image: poll.image,
      }));
      setVotedPolls(formattedPolls);
    } catch (error) {
      console.error("Error fetching voted polls:", error);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (user) {
      refreshVotedPolls();
    } else {
      setVotedPolls([]);
    }
  }, [user]);

  return (
    <VotedPollsContext.Provider
      value={{ votedPolls, setVotedPolls, refreshVotedPolls }}
    >
      {children}
    </VotedPollsContext.Provider>
  );
};

export const useVotedPolls = () => {
  const context = useContext(VotedPollsContext);
  if (!context) {
    throw new Error("useVotedPolls must be used within a VotedPollsProvider");
  }
  return context;
};
