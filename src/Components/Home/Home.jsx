import React, { useState } from 'react';
import './Home.css';
import Navbar from '../../Components/Navbar/Navbar';
import core from '../../assets/core.png';
import Maskgroup from '../../assets/Maskgroup.png';
import { ChevronsDown } from 'lucide-react';
import { Link as ScrollLink } from 'react-scroll';
import bg from '../../assets/bg.png'

const Home = () => {
  const [showButton, setShowButton] = useState(false);

  return (
    <div className='home-container' id='home-section'>
      <img src={bg} className='bg-image' alt="" />
      {/* Navbar at the top */}
      <Navbar />
      <div 
        className="home" 
        onMouseEnter={() => setShowButton(true)} 
        onMouseLeave={() => setShowButton(false)}
      >
        <div className="main-text">
          <p className='colored-text'>PhoenixPath Mental Health Services</p>
          <p className='big-txt'>Your Path to Mental Wellness <br /> Starts Here</p>
          <hr />
          <p>At Phoenix Path, we provide compassionate, evidence-based telepsychiatry and counseling for individuals ages 6 and above. We specialize in supporting those struggling with ADHD, depression, anxiety, and other mental health challenges. Our goal is to make care simple, supportive, and accessible by meeting you where you are and working with you toward lasting well-being.</p>
          <button><a href="https://care.headway.co/providers/oluwakemi-okunlola?utm_source=pem&utm_medium=direct_link&utm_campaign=168640" target="_blank" rel="noopener noreferrer">Schedule a Consultation</a></button>
        </div>

        <ScrollLink to="services-section" smooth={true} duration={500}>
          <div className={`hidden-button ${showButton ? "show" : ""}`}>
            <img src={core} alt="Core" className="core-image" />
            <div className="hidden-button-content">
              <div className="hidden-button-header">
                <h3>Core Services</h3>
                <img src={Maskgroup} alt="Maskgroup" />
              </div>
              <div className="hidden-button-text">
                <div className="hidden-btn-txt"><p>Telepsychiatry</p><span></span></div>
                <div className="hidden-btn-txt"><p>Medication Management</p><span></span></div>
              </div>
              <div className="view-more">
                <p style={{fontFamily:"Caveat", textAlign:"center", color:"#FFFFFF80", textDecoration:"none", display: "flex", alignItems: "center", gap: "4px", justifyContent:"center"}}>
                  View More <ChevronsDown size={16}/>
                </p>
              </div>
            </div>
          </div> 
        </ScrollLink>
      </div>
    </div>
  )
}

export default Home;
