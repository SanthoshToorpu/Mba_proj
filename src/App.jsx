import React, { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import yo from '../assets/yo.json';

const SpeechComponent = () => {
  const [text, setText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voicesLoaded, setVoicesLoaded] = useState(false);

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
    };

    // Stop animation when speech ends
    speech.onend = () => {
      setIsSpeaking(false);
    };

    // Speak the text
    window.speechSynthesis.speak(speech);
  };

  const handleChange = (event) => {
    setText(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    speakText(text);
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel(); // Stop speech synthesis
  };

  return (
    <div className="bg-[url('../assets/background.jpg')] bg-cover bg-center h-screen">
      <form onSubmit={handleSubmit}>
        <textarea value={text} onChange={handleChange} />
        <button type="submit">Speak</button>
      </form>
      <Lottie
        animationData={yo}
        loop={isSpeaking} // Pause animation when speaking
        autoplay={isSpeaking} // Play animation when speaking
        className='absolute bottom-0 right-20 w-30 h-[600px]'
      />
    </div>
  );
};

export default SpeechComponent;
