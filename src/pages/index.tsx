import React, { useState } from "react";

import Chat from "@/components/message/chat";
import { v4 as uuidv4 } from "uuid";

const Home = () => {
  const [username, setUsername] = useState<string>(uuidv4());

  return (
    <div className="p-4 mx-auto">
      <Chat username={username} />
    </div>
  );
};

export default Home;
