declare module "react-native-chat-ui" {
    import React from "react";
    
    export interface MessageType {
      id: string;
      type: "text" | "image";
      content: string;
      senderId: string;
      timestamp: number;
    }
  
    export interface ChatProps {
      messages: MessageType[];
      user: { id: string };
      onSend: (text: string) => void;
    }
  
    export default function Chat(props: ChatProps): JSX.Element;
  }
  