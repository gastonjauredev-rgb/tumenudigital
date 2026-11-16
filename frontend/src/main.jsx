import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Menu from './pages/Menu';
import './styles/global.css';
import './styles/mobile.css';
createRoot(document.getElementById('root')).render(<React.StrictMode><BrowserRouter><Routes><Route path="/" element={<Home/>}/>{['clasico', 'urbano', 'natural', 'fresco'].map(id => <Route key={id} path={`/demo/${id}`} element={<Menu key={id} id={id}/>}/>)}<Route path="*" element={<main className="not-found"><h1>Esta carta no está en el menú.</h1><Link className="button" to="/">Volver al inicio</Link></main>}/></Routes></BrowserRouter></React.StrictMode>);
