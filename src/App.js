import React from "react";
import Header from "./components/Header";
import FormEditor from "./screens/components/FormEditor";
import Home from "./screens/Home";
import FAQ from "./screens/FAQ/FAQ";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/FAQ" element={<FAQ />} />
        <Route path="/editor" element={<FormEditor />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
