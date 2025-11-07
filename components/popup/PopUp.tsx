/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

// FIX: Added FC to the React import.
import React, { FC } from 'react';
import './PopUp.css';

interface PopUpProps {
  onClose: () => void;
}

const PopUp: React.FC<PopUpProps> = ({ onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Welcome to the Interactive Day Planner</h2>
        <div className="popup-scrollable-content">
          <p>
            This interactive demo highlights Gemini and Grounding with Google Maps' ability to engage in real-time, voice-driven conversations.
Plan a day trip using natural language and experience how Gemini leverages Google Maps to deliver accurate, up-to-the-minute information.
          </p>
          <p>To get started:</p>
          <ol>
            <li>
              <span className="icon">play_circle</span>
              <div>Press the <strong>&nbsp; Play &nbsp;</strong> button to start the conversation.</div>
            </li>
            <li>
              <span className="icon">record_voice_over</span>
              <div><strong>Speak naturally &nbsp;</strong>to plan your trip. Try saying,
              "Let's plan a trip to Chicago."</div>
            </li>
            <li>
              <span className="icon">map</span>
              <div>Watch as the map <strong>&nbsp; dynamically updates &nbsp;</strong> with
              locations from your itinerary.</div>
            </li>
            <li>
              <span className="icon">keyboard</span>
              <div>Alternatively, <strong>&nbsp; type your requests &nbsp;</strong> into the message
              box.</div>
            </li>
            <li>
              <span className="icon">tune</span>
              <div>Click the <strong>&nbsp; Settings &nbsp;</strong> icon to customize the AI's
              voice and behavior.</div>
            </li>
          </ol>
        </div>
        <button onClick={onClose}>Got It, Let's Plan!</button>
      </div>
    </div>
  );
};

export default PopUp;