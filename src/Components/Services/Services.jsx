import React from 'react'
import './Services.css'
import img1 from '../../assets/Image_fx (6) 1.png'
import img2 from '../../assets/Image_fx (10) 1.png'
import img3 from '../../assets/Image_fx (12) 1.png'
import img4 from '../../assets/Image_fx (14) 1.png'

const Services = () => {
  return (
    <div className='services-main' id='services-section'>
      <p style={{fontFamily:"Caveat"}}>Our Services</p>
      <h1 style={{fontFamily:"Bricolage Grotesque"}}>Care That Meets You Where You Are.</h1>
      <p style={{fontFamily:"Manrope"}}>Compassionate mental health support designed for your unique journey.</p>
      <div className="service-cards">
        <div className="service-card-1">
            <div className="service-card-text">
                <h2>Telepsychiatry <br /> (Virtual Appointments)</h2>
                <p>Receive psychiatric care from home. Our secure platform offers flexible, confidential appointments.</p>
            </div>
            <img src={img4} />
        </div>
        <div className="service-card-2">
            <div className="service-card-text">
                <h2>Medication Management</h2>
                <p>Safe, effective medication is vital for mental wellness. We monitor and adjust medications to suit your needs with minimal side effects.</p>
            </div>
            <img src={img1} />
        </div>
        <div className="service-card-3">
            <div className="service-card-text">
                <h2>Support Across the Lifespan</h2>
                <p>From children to older adults, we provide age-appropriate, culturally sensitive care that empowers individuals at every stage of life.</p>
            </div>  
            <img src={img2} />
        </div>
        <div className="service-card-4">
            <div className="service-card-text">
                <h2>Personalized Mental Health Care Plans</h2>
                <p>Each client's journey is unique. We create tailored care plans with therapy and medication.</p>
            </div>     
            <img src={img3} /> 
        </div>
        <button><a href="https://care.headway.co/providers/oluwakemi-okunlola?utm_source=pem&utm_medium=direct_link&utm_campaign=168640" target="_blank" rel="noopener noreferrer">Start Your Consultation</a></button>
      </div>

    </div>
  )
}

export default Services