import React from "react";
import Header from "./components/Header";
import FormEditor from "./screens/components/FormEditor";
import Home from "./screens/Home";
import FAQ from "./screens/FAQPage/FAQ";
import Templates from "./screens/TemplatesPage/Templates";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Settings from "./screens/ProfileSettingsPage/Settings";
import Features from "./screens/FeaturesPage/Features";
import Contact from "./screens/ContactPage/Contact";
import Dashboard from "./screens/DashboardPage/Dashboard";
import Results from "./screens/ResultsPage/Results";

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/FAQ" element={<FAQ />} />
        <Route path="/editor" element={<FormEditor />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/features" element={<Features />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;