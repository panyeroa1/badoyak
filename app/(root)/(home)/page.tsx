'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { StreamCall, StreamTheme, useStreamVideoClient } from '@stream-io/video-react-sdk';
import { Loader } from 'lucide-react';

import MeetingSetup from '@/components/MeetingSetup';
import MeetingRoom from '@/components/MeetingRoom';

// Persistent meeting room ID - all users join this room
const PERSISTENT_MEETING_ID = 'eburon-main-room';

const Home = () => {
  const { isLoaded, user } = useUser();
  const client = useStreamVideoClient();
  const [call, setCall] = useState<any>(null);
  const [isCallLoading, setIsCallLoading] = useState(true);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  useEffect(() => {
    if (!client || !user) return;

    const loadOrCreateCall = async () => {
      setIsCallLoading(true);
      try {
        // Get or create the persistent meeting room
        const callInstance = client.call('default', PERSISTENT_MEETING_ID);
        
        // Create the call if it doesn't exist, or just get it
        await callInstance.getOrCreate({
          data: {
            starts_at: new Date().toISOString(),
            custom: {
              description: 'Eburon Persistent Meeting Room',
            },
          },
        });
        
        setCall(callInstance);
      } catch (error) {
        console.error('Error loading call:', error);
      } finally {
        setIsCallLoading(false);
      }
    };

    loadOrCreateCall();
  }, [client, user]);

  if (!isLoaded || isCallLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader className="h-10 w-10 animate-spin text-white" />
      </div>
    );
  }

  if (!call) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <p className="text-center text-xl font-medium text-white">
          Loading meeting room...
        </p>
      </div>
    );
  }

  return (
    <main className="h-screen w-full">
      <StreamCall call={call}>
        <StreamTheme>
          {!isSetupComplete ? (
            <MeetingSetup setIsSetupComplete={setIsSetupComplete} />
          ) : (
            <MeetingRoom />
          )}
        </StreamTheme>
      </StreamCall>
    </main>
  );
};

export default Home;
