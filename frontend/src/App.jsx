import { useState } from "react";
import React from "react";
import { Routes, Route } from "react-router-dom";
import ChatPage from "./pages/ChatPage.jsx";

const App = () => {
  return (
    <>
    <Routes>
      <Route path="/" element={<ChatPage/>} />
    </Routes>
    </>
  )
}

export default App;