"use client";
import { Button } from "@/components/ui/button";
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  PhoneOff,
  MonitorUp,
  MonitorOff,
} from "lucide-react";
import { useState } from "react";

export default function MeetingControls({
  meeting,
  micOn,
  videoOn,
  setMicOn,
  setVideoOn,
  onEnd,
}: any) {
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const toggleScreenShare = async () => {
    if (!isScreenSharing) {
      await meeting?.enableScreenShare();
    } else {
      await meeting?.disableScreenShare();
    }
    setIsScreenSharing(!isScreenSharing);
  };

  return (
    <div className="p-4 bg-gray-900 flex justify-center items-center space-x-4">
      <Button
        variant="outline"
        size="icon"
        onClick={() => {
          setMicOn(!micOn);
          micOn ? meeting?.muteMic() : meeting?.unmuteMic();
        }}
        className={`${!micOn && "bg-red-500 hover:bg-red-600"}`}
      >
        {micOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={() => {
          setVideoOn(!videoOn);
          videoOn ? meeting?.disableWebcam() : meeting?.enableWebcam();
        }}
        className={`${!videoOn && "bg-red-500 hover:bg-red-600"}`}
      >
        {videoOn ? (
          <Video className="h-5 w-5" />
        ) : (
          <VideoOff className="h-5 w-5" />
        )}
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={toggleScreenShare}
        className={`${isScreenSharing && "bg-blue-500 hover:bg-blue-600"}`}
      >
        {isScreenSharing ? (
          <MonitorOff className="h-5 w-5" />
        ) : (
          <MonitorUp className="h-5 w-5" />
        )}
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={() => {
          meeting?.end();
          onEnd?.();
        }}
      >
        <PhoneOff className="h-5 w-5" />
      </Button>
    </div>
  );
}
