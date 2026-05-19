import { useState } from 'react'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import HomePage from './Pages/HomePage/HomePage.jsx'
import InfoPage from './Pages/InfoPage/InfoPage.jsx'
import ServicesPage from './Pages/ServicesPage/ServicesPage.jsx'
import ConditionsPage from './Pages/ConditionsPage/ConditionsPage.jsx'
import TestimonialPage from './Pages/TestimonialPage/TestimonialPage.jsx'
import ContactUs from './Pages/ContactUs/ContactUs.jsx'
import FooterPage from './Pages/FooterPage/FooterPage.jsx'
import CustomFloatingZocdocButton from './Components/Zodoc/zodoc.jsx'

function App() {

  return (
    <>
      <HomePage />
      <InfoPage />
      <ServicesPage />
      <ConditionsPage />
      <TestimonialPage />
      <ContactUs />
      <FooterPage />
      <CustomFloatingZocdocButton/>
    </>
  )
}

export default App
