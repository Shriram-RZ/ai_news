import { useState } from "react";
import { Bars3Icon, XMarkIcon, ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import Input from "./Input";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex">
      {/* Sidebar */}
      <div className={`bg-gray-900 text-white ${isOpen ? "w-64" : "w-16"} min-h-screen transition-all duration-300 flex flex-col`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4">
          <h1 className={`text-lg font-bold transition-all duration-300 ${!isOpen && "hidden"}`}>AI NEWS</h1>
          <button onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? (
              <XMarkIcon className="w-6 h-6" />
            ) : (
              <Bars3Icon className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Sidebar Items */}
        <nav className="flex-1 px-2 space-y-2">
          <button className="flex items-center p-2 rounded-md bg-gray-800 w-full hover:bg-gray-700">
            <ChatBubbleLeftIcon className="w-6 h-6" />
            <span className={`ml-3 transition-all ${!isOpen && "hidden"}`}>New Chat</span>
          </button>
          {/* Add more items here */}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-100 p-6">
        <h2 className="text-2xl font-semibold">Chat Interface</h2>
        <p className="mt-4">This is where the chat will be displayed.</p>
      </div>
      <Input></Input>
    </div>
  );
};

export default Sidebar;
