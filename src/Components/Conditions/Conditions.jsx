import './Conditions.css'
import check from '../../assets/check.png'
import question from '../../assets/question-mark.png'
import { useState } from 'react'
import { CirclePlus, CircleMinus } from 'lucide-react'

const conditionsData = [
  {
    title: "Attention-Deficit/Hyperactivity Disorder (ADHD)",
    info: "ADHD affects how a person focuses, stays organized, and controls impulses. People with ADHD may find it hard to pay attention, sit still, or finish tasks."
  },
  {
    title: "Depression",
    info: "Depression makes a person feel very sad, empty, or hopeless for a long time. It can affect sleep, appetite, energy, and interest in things once enjoyed."
  },
  {
    title: "Bipolar Disorder",
    info: "Bipolar disorder causes strong mood changes. A person may have periods of feeling very energetic and excited (mania) and times of deep sadness or tiredness (depression)."
  },
  {
    title: "Grief & Adjustment Disorders",
    info: "These happen when a person has trouble coping with a major life change or loss, such as losing a loved one, moving, or changing jobs. It can lead to sadness, worry, or feeling stuck."
  },
  {
    title: "Obsessive-Compulsive Disorder (OCD)",
    info: "OCD makes people have unwanted thoughts that cause worry (obsessions) and repeated actions or routines (compulsions) they feel forced to do to reduce anxiety."
  },
  {
    title: "Sleep Disorder",
    info: "This includes trouble falling asleep, staying asleep, or sleeping too much. Poor sleep can affect mood, focus, and overall health."
  },
  {
    title: "Generalized Anxiety Disorder (GAD)",
    info: "People with GAD often worry a lot, even about everyday things. They may feel tense, restless, tired, or have trouble concentrating and sleeping."
  },
  {
    title: "Panic Disorder and Recurrent Attacks",
    info: "This causes sudden, intense fear or panic that comes without warning. During an attack, a person may feel their heart racing, have trouble breathing, or feel like something bad will happen."
  },
  {
    title: "Post-Traumatic Stress Disorder",
    info: "PTSD can develop after a scary or painful event. It can cause flashbacks, nightmares, and strong emotions that make it hard to feel safe or relaxed."
  }
];

const Conditions = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleInfo = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className='conditions' id='conditions-section'>
      <div className="conditions-content">
        <h1 style={{ fontFamily: "Bricolage Grotesque", textAlign:"center" }}>Conditions we treat ?</h1>
        <p style={{textAlign:"center"}}>
          We treat a variety of mental health concerns, helping you handle stress, improve focus,
          manage emotions, and find stability through life’s changes.
        </p>

        <div className="condition-cards">
          <ul>
            {conditionsData.map((condition, index) => (
              <li key={index}>
                <div className="condition-header">
                  <div className="condition-title">
                    <img src={check} alt="check" />
                    <span style={{fontWeight:"600", marginLeft:"8px"}}>{condition.title}</span>
                  </div>

                  <button className="info-btn" onClick={() => toggleInfo(index)}>
                    {openIndex === index ? (
                      <CircleMinus size={22} />
                    ) : (
                      <CirclePlus size={22} />
                    )}
                  </button>
                </div>

                {openIndex === index && (
                  <div className="info-text">
                    <p>{condition.info}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
       <div className="consultation-footer">
            <img src={question} />
            <p style={{fontWeight:"bold", marginBottom: "0px"}}>Still have questions about the conditions we treat?</p>
            <p style={{color:"#475467", marginBottom: "0px"}}>Our care team is here to listen and help you find the support you need.</p>
            <button className='consultation-btn'>
                <a
                    href="https://care.headway.co/providers/oluwakemi-okunlola?utm_source=pem&utm_medium=direct_link&utm_campaign=168640"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Start Your Consultation
                </a>
            </button>
        </div>
    </div>
  );
};

export default Conditions;
