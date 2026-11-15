import { useState } from "react";
import React from "react";
import { Routes, Route } from "react-router-dom";
import SetEmailPage from "./pages/SetEmailPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";

const App = () => {
  return (
    <>
    <Routes>
      <Route path="/" element={<SetEmailPage/>} />
      <Route path="/ChatPage" element={<ChatPage/>} />
    </Routes>
    </>
  )
}

export default App;