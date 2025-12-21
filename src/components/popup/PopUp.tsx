/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'framer-motion';
import { scaleIn, transitions } from '@/lib/animations';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface PopUpProps {
  open: boolean;
  onClose: () => void;
}

const PopUp: React.FC<PopUpProps> = ({ open, onClose }) => {
  return (
    <Dialog
      open={open}
      onOpenChange={open => {
        if (!open) onClose();
      }}
    >
      <DialogContent
        className={cn(
          'max-w-[600px] w-[90%] p-[30px] rounded-2xl',
          'bg-[var(--Neutral-10)] text-[var(--text)]',
          'border border-[var(--border-stroke)]',
          'shadow-[0_4px_20px_rgba(0,0,0,0.2)]'
        )}
      >
        <motion.div
          variants={scaleIn}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={transitions.modalIn}
        >
          <DialogHeader className="mb-5">
            <DialogTitle className="text-2xl text-[var(--accent-blue-headers)] font-normal">
              Welcome to the Interactive Day Planner
            </DialogTitle>
          </DialogHeader>
          <DialogDescription asChild>
            <div className="popup-scrollable-content max-h-[60vh] overflow-y-auto md:max-h-none">
              <p className="mb-5 leading-relaxed text-[var(--text)]">
                This interactive demo highlights Gemini and Grounding with Google Maps&apos; ability
                to engage in real-time, voice-driven conversations. Plan a day trip using natural
                language and experience how Gemini leverages Google Maps to deliver accurate,
                up-to-the-minute information.
              </p>
              <p className="mb-5 text-[var(--text)]">To get started:</p>
              <ol className="pl-5 mb-8 space-y-4">
                <li className="flex items-start gap-4">
                  <span className="icon text-2xl text-[var(--accent-blue)]">play_circle</span>
                  <div>
                    Press the <strong>&nbsp; Play &nbsp;</strong> button to start the conversation.
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="icon text-2xl text-[var(--accent-blue)]">record_voice_over</span>
                  <div>
                    <strong>Speak naturally &nbsp;</strong>to plan your trip. Try saying,
                    &quot;Let&apos;s plan a trip to Chicago.&quot;
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="icon text-2xl text-[var(--accent-blue)]">map</span>
                  <div>
                    Watch as the map <strong>&nbsp; dynamically updates &nbsp;</strong> with
                    locations from your itinerary.
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="icon text-2xl text-[var(--accent-blue)]">keyboard</span>
                  <div>
                    Alternatively, <strong>&nbsp; type your requests &nbsp;</strong> into the
                    message box.
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <span className="icon text-2xl text-[var(--accent-blue)]">tune</span>
                  <div>
                    Click the <strong>&nbsp; Settings &nbsp;</strong> icon to customize the
                    AI&apos;s voice and behavior.
                  </div>
                </li>
              </ol>
            </div>
          </DialogDescription>
          <div className="flex justify-end mt-4">
            <Button
              onClick={onClose}
              className="bg-[var(--Blue-500)] text-[var(--Neutral-5)] hover:bg-[var(--Blue-400)] font-bold px-5 py-3 rounded-lg"
            >
              Got It, Let&apos;s Plan!
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default PopUp;
