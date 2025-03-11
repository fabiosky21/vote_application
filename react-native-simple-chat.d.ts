declare module "react-native-simple-chat" {
    import React from "react";
  
    export interface Message {
      id: string;
      text: string;
      sender: "user" | "admin";
      timestamp: number;
    }
  
    export interface SimpleChatProps {
      messages: Message[];
      user: { id: string };
      onSend: (text: string) => void;
    }
  
    const SimpleChat: React.FC<SimpleChatProps>;
    export default SimpleChat;
  }
  