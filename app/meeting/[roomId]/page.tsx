"use client";
import { useState } from "react";
import JoinMeeting from "@/components/meeting/join-meeting";
import PreCallSetup from "@/components/meeting/pre-call-setup";

export default function MeetingPage({
  params,
}: {
  params: { roomId: string };
}) {
  const { roomId } = params;
  const [deviceSettings, setDeviceSettings] = useState<any>(null);
  const [token, setToken] = useState<any>(
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiJhNWYxYmMyNS05YTkyLTRiZmItOWMyNi1kNjU1NTZiNDRhMDMiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTc1NTkzNTg3OCwiZXhwIjoxOTEzNzIzODc4fQ.FEeINswwUBxUQYrFJ5hFjbWnAFaNwqntuP_KQmJNqEc"
  );

  const handleJoinMeeting = (settings: any) => {
    console.log("settings", settings);
    setDeviceSettings(settings);
  };

  if (!deviceSettings) {
    return <PreCallSetup onJoinMeeting={handleJoinMeeting} />;
  }

  return (
    <JoinMeeting
      roomId={roomId}
      deviceSettings={deviceSettings}
      token={token}
    />
  );
}
