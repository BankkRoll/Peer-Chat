// src/pages/index.tsx
import React, { useState } from "react";

import Chat from "@/components/message/chat";

const Home = () => {

  return (
    <div className="p-4 mx-auto">
      <Chat />
    </div>
  );
};

export default Home;
