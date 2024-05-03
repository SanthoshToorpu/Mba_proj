import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import yo from '../assets/yo.json';
import Papa from 'papaparse';
import { motion } from 'framer-motion';

const SpeechComponent = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [claimTemplates, setClaimTemplates] = useState([]);
  const [claimsData, setClaimsData] = useState([]);
  const [isClaimReady, setIsClaimReady] = useState(false);
  const [showLottie, setShowLottie] = useState(false);
  const [showParagraph, setShowParagraph] = useState(false);

  useEffect(() => {
    const initializeVoices = () => {
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        setVoicesLoaded(true);
      }
    };

    // Check if voices are already loaded
    initializeVoices();

    // Event listener for when voices are loaded
    window.speechSynthesis.addEventListener('voiceschanged', initializeVoices);

    // Cleanup event listener on unmount
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', initializeVoices);
      stopSpeaking(); // Stop speaking when unmounting
    };
  }, []);

  useEffect(() => {
    setClaimTemplates([
      `Hello [insurance_holder_name], I wanted to let you know that we've received your claim, and it's currently being processed. Your claim number is [claim_number], and it's regarding [claim_description]. As of now, the status of your claim is [claim_status].`,
      `The incident happened on [date_of_incident], and we're working hard to resolve everything for you. If you have any questions or need further assistance, feel free to reach out to us.`,
      `Thank you for your understanding and patience. For any further details, reach out to xyz insurance company`
    ]);
  }, []);

  // Function to speak the provided text
  const speakText = (text) => {
    if (!voicesLoaded) return; // Wait for voices to be loaded

    const speech = new SpeechSynthesisUtterance();
    const voices = speechSynthesis.getVoices();
    speech.voice = voices[2]; // Set voice to index 2
    speech.text = text;
    speech.volume = 1;
    speech.rate = 1;
    speech.pitch = 1;

    // Start playing the animation when speech starts
    speech.onstart = () => {
      setIsSpeaking(true);
      setSpokenText(text);
    };

    // Stop animation when speech ends
    speech.onend = () => {
      setIsSpeaking(false);
    };

    // Speak the text
    window.speechSynthesis.speak(speech);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel(); // Stop speech synthesis
  };

  const handleFileSelect = (event) => {
    Papa.parse(event.target.files[0], {
      header: true,
      complete: function (results) {
        setClaimsData(results.data);
      }
    });
  };

  const handleClaimSubmit = () => {
    // Replace placeholders in claim templates with actual values from claimsData
    const updatedClaimTemplates = claimTemplates.map((template, index) => {
      const claim = claimsData[index];
      if (!claim) return template; // Skip if claim data is not available

      let updatedTemplate = template;
      updatedTemplate = updatedTemplate
        .replace('[insurance_holder_name]', claim.insurance_holder_name)
        .replace('[claim_number]', claim.claim_number)
        .replace('[claim_description]', claim.claim_description)
        .replace('[claim_status]', claim.claim_status)
        .replace('[date_of_incident]', claim.date_of_incident);
      return updatedTemplate;
    });
    setClaimTemplates(updatedClaimTemplates);
    setIsClaimReady(true);
  };

  const handleSpeakClaim = () => {
    setShowLottie(true);
    setShowParagraph(true);
    claimTemplates.forEach(template => {
      speakText(template);
    });
  };

  return (
    <div className="bg-[url('../assets/background.jpg')] bg-cover bg-center h-screen relative">
      <div className='absolute top-10 left-10 grid gap-2 grid-cols-2 max-w-[500px]'>
        <input type="file" onChange={handleFileSelect} className="" />
        <button onClick={handleClaimSubmit} className="w-[180px] px-4 py-2 bg-blue-500 text-white rounded-md">Submit Claim</button>
      </div>
      <button onClick={handleSpeakClaim} disabled={!isClaimReady} className={`z-10 absolute bottom-10 right-10 px-4 py-2 rounded-md ${isClaimReady ? 'bg-green-500 text-white' : 'bg-gray-500 text-gray-300 cursor-not-allowed'}`}>Speak Claim</button>
      {showParagraph && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-white p-4 rounded-md absolute bottom-1/2 left-10 right-10 overflow-y-auto max-w-[800px] max-h-[200px]">
          {spokenText}
        </motion.p>
      )}
      {showLottie && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className='absolute bottom-0 right-20 w-30 h-[600px]'>
          <Lottie
            animationData={yo}
            loop={isSpeaking} // Pause animation when speaking
            autoplay={isSpeaking} // Play animation when speaking
          />
        </motion.div>
      )}
    </div>
  );
};

export default SpeechComponent;
