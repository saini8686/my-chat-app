import React from "react";
import ChatList from "./ChatList";
import SignUpForm from "./SignUpForm";

const ChatRoom = () => {
  return (
    <div>
      <div className="flex">
        <ChatList />
        <div className=" flex grow w-full">
          <SignUpForm />
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
