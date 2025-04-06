import { useState, useEffect } from "react";
import { vapi, startAssistant, stopAssistant } from "../ai";
import ActiveCallDetails from "../call/ActiveCallDetails";

function ChatBot() {
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);

  const [loading, setLoading] = useState(false);
  const [assistantIsSpeaking, setAssistantIsSpeaking] = useState(false);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [callId, setCallId] = useState("");
  const [callResult, setCallResult] = useState(null);
  const [loadingResult, setLoadingResult] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false); 
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    vapi
      .on("call-start", () => {
        setLoading(false);
        setStarted(true);
      })
      .on("call-end", () => {
        setStarted(false);
        setLoading(false);
      })
      .on("speech-start", () => {
        setAssistantIsSpeaking(true);
      })
      .on("speech-end", () => {
        setAssistantIsSpeaking(false);
      })
      .on("volume-level", (level) => {
        setVolumeLevel(level);
      });
  }, []);

  const handleInputChange = (setter) => (event) => {
    setter(event.target.value);
  };

  const handleStart = async () => {
    setLoading(true);
  
    try {
      // Start the assistant
      const data = await startAssistant(firstName, lastName, email, phoneNumber);
      setCallId(data.id);
      await fetch("http://localhost:5001/api/candidates", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phoneNumber,
          callId: data.id,
          timestamp: new Date().toISOString(),
        }),
      });
      // Send candidate info to backe
    } catch (error) {
      console.error("Error starting assistant or sending data:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  const handleStop = () => {
    stopAssistant();
    setFinished(true);
    setShowThankYou(true);
  };

  const showForm = !loading && !started && !loadingResult && !finished;
  const allFieldsFilled = firstName && lastName && email && phoneNumber;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4 py-8">
    {showForm && (
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-gray-800 text-center">Candidate Details</h1>
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={handleInputChange(setFirstName)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={handleInputChange(setLastName)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={handleInputChange(setEmail)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="tel"
          placeholder="Phone number"
          value={phoneNumber}
          onChange={handleInputChange(setPhoneNumber)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <button
          onClick={handleStart}
          disabled={!allFieldsFilled}
          className={`w-full py-2 rounded-md text-white font-semibold ${
            allFieldsFilled
              ? 'bg-blue-600 hover:bg-blue-700 transition'
              : 'bg-gray-400 cursor-not-allowed'
          }`}
        >
          Start Interview
        </button>
      </div>
    )}
  
  
    {showThankYou && (
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md mt-6 text-center">
        <h2 className="text-xl font-semibold text-blue-700 mb-2">Thank you for attending the interview!</h2>
        <p className="text-gray-700">We’ll get back to you shortly with the results.</p>
        <p className="text-gray-500 mt-1">You may now close this window.</p>
      </div>
    )}
  
    {loading && (
      <div className="text-blue-600 text-lg font-medium mt-4">Preparing your interview...</div>
    )}
  
    {started && (
      <div className="mt-6 w-full max-w-lg">
        <ActiveCallDetails
          assistantIsSpeaking={assistantIsSpeaking}
          volumeLevel={volumeLevel}
          endCallCallback={handleStop}
        />
      </div>
    )}
  </div>
  
  );
}

export default ChatBot;
