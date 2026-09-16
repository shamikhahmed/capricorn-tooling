import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './Home.jsx';
export function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
    </Routes>
  );
}
function About() { return <div>About</div>; }
