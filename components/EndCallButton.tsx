'use client';

import { useCall, useCallStateHooks } from '@stream-io/video-react-sdk';

import { Button } from './ui/button';
import { useRouter } from 'next/navigation';

const EndCallButton = () => {
  const call = useCall();
  const router = useRouter();

  if (!call)
    throw new Error(
      'useStreamCall must be used within a StreamCall component.',
    );

  // https://getstream.io/video/docs/react/guides/call-and-participant-state/#participant-state-3
  const { useLocalParticipant } = useCallStateHooks();
  const localParticipant = useLocalParticipant();
  if (!localParticipant) return null;

  const isMeetingOwner =
    call.state.createdBy &&
    localParticipant.userId === call.state.createdBy.id;

  const handleExit = async () => {
    if (isMeetingOwner) {
      await call.endCall();
    } else {
      await call.leave();
    }
    router.push('/');
  };

  return (
    <Button 
      onClick={handleExit} 
      className="rounded-[8px] bg-red-500 px-4 text-xs font-semibold uppercase tracking-wider shadow-[0_4px_12px_rgba(255,0,0,0.3)] transition-all hover:bg-red-600"
    >
      {isMeetingOwner ? 'End call for everyone' : 'Leave Meeting'}
    </Button>
  );
};

export default EndCallButton;
