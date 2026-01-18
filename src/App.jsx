import React from 'react'
import Home from './pages/Home.jsx'
import Projects from './pages/Projects.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Services from './pages/Services.jsx'
import Personal from './pages/Personal.jsx'
import Preloader from './component/Preloader/Preloader.jsx' // Import Preloader

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/services" element={<Services />} />
        <Route path="/personal" element={<Personal />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
