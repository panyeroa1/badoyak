'use client';
import { useState } from 'react';
import {
  CallParticipantsList,
  CallStatsButton,
  CallingState,
  PaginatedGridLayout,
  SpeakerLayout,
  useCallStateHooks,
  ToggleAudioPublishingButton,
  ToggleVideoPublishingButton,
  ScreenShareButton,
} from '@stream-io/video-react-sdk';
import { Users, LayoutList } from 'lucide-react';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import Loader from './Loader';
import EndCallButton from './EndCallButton';
import TranslatorButtons from './TranslatorButtons';
import { cn } from '@/lib/utils';

type CallLayoutType = 'grid' | 'speaker-left' | 'speaker-right';

  const MeetingRoom = () => {
  const [layout, setLayout] = useState<CallLayoutType>('speaker-left');
  const [showParticipants, setShowParticipants] = useState(false);
  const { useCallCallingState } = useCallStateHooks();

  // for more detail about types of CallingState see: https://getstream.io/video/docs/react/ui-cookbook/ringing-call/#incoming-call-panel
  const callingState = useCallCallingState();

  if (callingState !== CallingState.JOINED) return <Loader />;

  const CallLayout = () => {
    switch (layout) {
      case 'grid':
        return <PaginatedGridLayout />;
      case 'speaker-right':
        return <SpeakerLayout participantsBarPosition="left" />;
      default:
        return <SpeakerLayout participantsBarPosition="right" />;
    }
  };

  return (
    <section className="relative h-screen w-full overflow-hidden text-white">
      <div className="flex size-full">
        {/* Main Video Area */}
        <div className={cn("relative flex flex-1 items-center justify-center transition-all duration-300 ease-in-out", {
          "mr-[350px]": showParticipants
        })}>
          <div className="size-full">
            <CallLayout />
          </div>
        </div>

        {/* Participants Sidebar */}
        <div
          className={cn('fixed right-0 top-0 h-[calc(100vh-80px)] w-[350px] bg-dark-1 transition-transform duration-300 ease-in-out z-20 transform', {
            'translate-x-0': showParticipants,
            'translate-x-full': !showParticipants,
          })}
        >
          <div className="h-full p-4">
            <CallParticipantsList onClose={() => setShowParticipants(false)} />
          </div>
        </div>
      </div>

      {/* Premium Sticky Bottom Navbar */}
      <div className="fixed bottom-0 left-0 z-30 flex h-20 w-full items-center justify-between bg-[#1c1f2e]/80 px-6 backdrop-blur-md border-t border-slate-800 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
        
        {/* Left: Call Controls */}
        <div className="flex items-center gap-3">
          <ToggleAudioPublishingButton />
          <ToggleVideoPublishingButton />
          <ScreenShareButton />
        </div>

        {/* Center: Translator Buttons */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <TranslatorButtons userId="current-user" userName="Current User" />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <CallStatsButton />
          
          <DropdownMenu>
            <DropdownMenuTrigger className="cursor-pointer rounded-[8px] bg-[#19232d] px-4 py-2 shadow-[0_4px_12px_rgba(0,0,0,0.4)] transition-all hover:bg-[#4c535b]">
              <LayoutList size={20} className="text-white" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="border-dark-1 bg-dark-1 text-white">
              {['Grid', 'Speaker-Left', 'Speaker-Right'].map((item, index) => (
                <div key={index}>
                  <DropdownMenuItem
                    onClick={() => setLayout(item.toLowerCase() as CallLayoutType)}
                  >
                    {item}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="border-dark-1" />
                </div>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button 
            onClick={() => setShowParticipants((prev) => !prev)} 
            title="Participants"
            className={cn("cursor-pointer rounded-[8px] px-4 py-2 shadow-[0_4px_12px_rgba(0,0,0,0.4)] transition-all", {
              "bg-blue-600": showParticipants,
              "bg-[#19232d] hover:bg-[#4c535b]": !showParticipants
            })}
          >
            <Users size={20} className="text-white" />
          </button>
          
          <EndCallButton />
        </div>
      </div>
    </section>
  );
};

export default MeetingRoom;

