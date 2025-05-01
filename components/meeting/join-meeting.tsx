"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  MeetingProvider,
  MeetingConsumer,
  useMeeting,
  useParticipant,
  useWhiteboard,
  usePubSub,
} from "@videosdk.live/react-sdk";

import ReactPlayer from "react-player";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import {
  Video,
  Mic,
  MicOff,
  VideoOff,
  Users,
  MessageSquare,
  Share2,
  X,
  MonitorUp,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import MeetingControls from "./meeting-controls";
import { useAppSelector } from "@/hooks";
import { fetchProfile } from "@/service/profile.service";
import { verifyMeeting, endMeeting } from "@/service/meetings.service";
import { initializeMeeting } from "@/http/videosdk-client";

function ParticipantView(props: any) {
  const micRef = useRef<any>(null);
  const {
    webcamStream,
    micStream,
    webcamOn,
    micOn,
    isLocal,
    displayName,
    screenShareStream,
    screenShareOn,
  } = useParticipant(props.participantId);

  const videoStream = useMemo(() => {
    if (screenShareOn && screenShareStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(screenShareStream.track);
      return mediaStream;
    }

    if (webcamOn && webcamStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      return mediaStream;
    }
  }, [webcamStream, webcamOn, screenShareStream, screenShareOn]);

  useEffect(() => {
    if (micRef.current) {
      if (micOn && micStream) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(micStream.track);

        micRef.current.srcObject = mediaStream;
        micRef.current
          .play()
          .catch((error: any) =>
            console.error("videoElem.current.play() failed", error)
          );
      } else {
        micRef.current.srcObject = null;
      }
    }
  }, [micStream, micOn]);

  return (
    <div className="relative rounded-lg overflow-hidden bg-gray-100 aspect-video">
      {webcamOn || screenShareOn ? (
        <ReactPlayer
          playsinline
          pip={false}
          light={false}
          controls={false}
          muted={true}
          playing={true}
          url={videoStream}
          width="100%"
          height="100%"
          className={screenShareOn ? "object-contain" : "object-cover"}
          onError={(err) => {
            console.log(err, "participant video error");
          }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-200">
          <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-2xl font-semibold text-gray-600">
              {displayName?.charAt(0)?.toUpperCase() || "?"}
            </span>
          </div>
        </div>
      )}

      {/* Participant Info Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-2 flex items-center justify-between">
        <span className="text-sm truncate">
          {displayName} {screenShareOn ? "(Screen Share)" : ""}
        </span>
        <div className="flex items-center gap-2">
          {!micOn && <MicOff className="h-4 w-4 text-red-500" />}
          {!webcamOn && !screenShareOn && (
            <VideoOff className="h-4 w-4 text-red-500" />
          )}
        </div>
      </div>

      <audio ref={micRef} autoPlay playsInline muted={isLocal} />
    </div>
  );
}

function ChatView() {
  const chatSubscription = useRef<any>(null);
  const chatContainerRef = useRef<any>(null);
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    const fetchProfileData = async () => {
      const res = await fetchProfile();
      setUser(res?.data);
    };

    fetchProfileData();
  }, []);
  const { publish, messages } = usePubSub("CHAT", {
    onMessageReceived: (message) => {
      scrollToBottom();
    },
    onOldMessagesReceived: (messages) => {
      scrollToBottom();
    },
  });

  const [message, setMessage] = useState("");

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    chatSubscription.current = {
      topic: "CHAT",
      unsubscribe: () => {
        console.log("Cleaning up chat subscription");
      },
    };

    return () => {
      if (chatSubscription.current) {
        chatSubscription.current.unsubscribe();
      }
    };
  }, []);

  const handleSendMessage = () => {
    if (message.trim()) {
      try {
        publish(message, { persist: true });
        setMessage("");
      } catch (error) {
        console.error("Error sending message:", error);
        toast.error("Failed to send message");
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b pb-3 mb-3">
        <h3 className="font-semibold">Chat</h3>
      </div>

      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto space-y-3 mb-3 pr-2"
      >
        {messages && messages.length > 0 ? (
          messages.map((msg, index) => {
            const isOwnMessage = msg.senderId === user?.id;
            return (
              <div
                key={index}
                className={`flex ${
                  isOwnMessage ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    isOwnMessage
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}
                >
                  {!isOwnMessage && (
                    <p className="text-xs font-semibold mb-1">
                      {msg.senderName}
                    </p>
                  )}
                  <p className="text-sm break-words">{msg.message}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwnMessage ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500 text-sm">No messages yet</p>
          </div>
        )}
      </div>

      <div className="border-t pt-3">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button onClick={handleSendMessage}>Send</Button>
        </div>
      </div>
    </div>
  );
}

function MeetingView({ meetingIdMain, onMeetingLeave, token }: any) {
  const [joined, setJoined] = useState<any>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isParticipantsOpen, setIsParticipantsOpen] = useState(false);
  const [meetingId, setMeetingId] = useState<any>(meetingIdMain);
  const {
    join,
    participants,
    presenterId,
    toggleMic,
    toggleWebcam,
    enableScreenShare,
    disableScreenShare,
  } = useMeeting({
    onMeetingJoined: () => {
      setJoined("JOINED");
    },
  });
  const { startWhiteboard } = useWhiteboard();

  // Get the screen share participant if any
  const screenShareParticipant = useMemo(() => {
    return [...participants.values()].find(
      (participant) => participant.id === presenterId
    );
  }, [participants, presenterId]);

  useEffect(() => {
    if (!joined) {
      setTimeout(() => {
        setJoined("JOINING");
        join();
      }, 500);
    }
  }, [join]);

  useEffect(() => {
    if (joined === "JOINED") {
      startWhiteboard();
    }
  }, [joined]);

  const { whiteboardUrl } = useWhiteboard();

  const participantsArray = useMemo(() => {
    return [...participants.values()];
  }, [participants]);

  return (
    <div className="container pt-16">
      {joined && joined === "JOINED" ? (
        <div>
          {/* Meeting Controls Header */}
          <div className="fixed top-0 left-0 right-0 bg-white border-b z-50">
            <div className="container mx-auto px-4 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleMic()}
                  >
                    <Mic className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleWebcam()}
                  >
                    <Video className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (presenterId) {
                        disableScreenShare();
                      } else {
                        enableScreenShare();
                      }
                    }}
                  >
                    <MonitorUp className="h-5 w-5" />
                  </Button>
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsParticipantsOpen(!isParticipantsOpen)}
                  >
                    <Users className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsChatOpen(!isChatOpen)}
                  >
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                  <Button variant="outline" onClick={onMeetingLeave}>
                    Leave
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Participants Sheet */}
          <Sheet open={isParticipantsOpen} onOpenChange={setIsParticipantsOpen}>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Participants</SheetTitle>
              </SheetHeader>
              <ParticipantsList participants={participants} />
            </SheetContent>
          </Sheet>

          <div
            className={`flex flex-col md:flex-row gap-4 mt-4 ${
              isChatOpen ? "mr-[336px]" : ""
            }`}
          >
            {/* Main content wrapper with min-height for vertical centering */}
            <div className="flex-1 min-h-[calc(100vh-6rem)] flex flex-col justify-center">
              {/* Screen Share View */}
              {screenShareParticipant && (
                <div className="mb-4 aspect-video">
                  <ParticipantView
                    participantId={screenShareParticipant.id}
                    key={`screen_${screenShareParticipant.id}`}
                  />
                </div>
              )}

              {/* Main Content Area */}
              {participantsArray.length <= 2 ? (
                // Layout for 1-2 participants
                <div className="flex flex-col md:flex-row items-center gap-4 h-full">
                  {/* Left Participant */}
                  <div
                    className={`${
                      whiteboardUrl && !screenShareParticipant
                        ? "w-full md:w-1/4"
                        : "flex-1"
                    } h-full flex items-center`}
                  >
                    {participantsArray[0] && (
                      <div className="w-full">
                        <ParticipantView
                          participantId={participantsArray[0].id}
                          key={participantsArray[0].id}
                        />
                      </div>
                    )}
                  </div>

                  {/* Whiteboard in Center */}
                  {whiteboardUrl && !screenShareParticipant && (
                    <div className="flex-1 h-full flex items-center">
                      <iframe
                        src={whiteboardUrl}
                        width="100%"
                        height="600"
                        className="border rounded-lg"
                      />
                    </div>
                  )}

                  {/* Right Participant */}
                  {participantsArray.length > 1 && (
                    <div
                      className={`${
                        whiteboardUrl && !screenShareParticipant
                          ? "w-full md:w-1/4"
                          : "flex-1"
                      } h-full flex items-center`}
                    >
                      <div className="w-full">
                        <ParticipantView
                          participantId={participantsArray[1].id}
                          key={participantsArray[1].id}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Layout for 3+ participants
                <div className="space-y-4 h-full flex flex-col justify-center">
                  {/* Whiteboard at Top */}
                  {whiteboardUrl && !screenShareParticipant && (
                    <div className="w-full">
                      <iframe
                        src={whiteboardUrl}
                        width="100%"
                        height="400"
                        className="border rounded-lg"
                      />
                    </div>
                  )}

                  {/* Participants Grid Below */}
                  <div
                    className={`grid gap-4 ${
                      isChatOpen
                        ? "grid-cols-1 md:grid-cols-2"
                        : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    }`}
                  >
                    {participantsArray.map((participant) => (
                      <ParticipantView
                        participantId={participant.id}
                        key={participant.id}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Chat Panel */}
            {isChatOpen && (
              <div className="fixed right-0 top-16 bottom-0 w-full md:w-80 bg-white border-l p-4">
                <ChatView />
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      )}
    </div>
  );
}

function ParticipantsList({ participants }: any) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        {participants.size} participant{participants.size !== 1 ? "s" : ""}
      </p>
      <div className="space-y-2">
        {[...participants.values()].map((participant) => (
          <div
            key={participant.id}
            className="flex items-center justify-between py-2"
          >
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-sm font-medium">
                  {participant.displayName?.charAt(0)?.toUpperCase() || "?"}
                </span>
              </div>
              <span className="text-sm font-medium">
                {participant.displayName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {!participant.micOn && (
                <MicOff className="h-4 w-4 text-red-500" />
              )}
              {!participant.webcamOn && (
                <VideoOff className="h-4 w-4 text-red-500" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function JoinMeeting({ roomId, deviceSettings, token }: any) {
  const meetingIdTemp = useParams().roomId;
  const [meetingId, setMeetingId] = useState<any>(meetingIdTemp);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [currentMeeting, setCurrentMeeting] = useState<any>(null);
  const [isMeetingValid, setIsMeetingValid] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      const res = await fetchProfile();
      setUser(res?.data);
    };

    fetchProfileData();
  }, []);

  useEffect(() => {
    const verifyMeetingAccess = async () => {
      try {
        setLoading(true);
        // First verify meeting access from our backend
        const response = await verifyMeeting(meetingId.toString());
        console.log("response verify meeting", response);

        if (!response.status) {
          throw new Error("Meeting verification failed");
        }

        setCurrentMeeting(response.data);

        // Initialize meeting only once after verification
        await initializeMeeting(meetingId, token);
        setIsMeetingValid(true);
      } catch (error) {
        console.error("Error verifying meeting:", error);
        toast.error("Failed to verify meeting access");
        router.push("/meetings"); // Redirect on failure
      } finally {
        setLoading(false);
      }
    };

    if (meetingId && !isMeetingValid) {
      // Add condition to prevent multiple calls
      verifyMeetingAccess();
    }
  }, [meetingId]); // Remove token and isMeetingValid from dependencies

  const onMeetingLeave = async () => {
    try {
      if (!user?.id) {
        throw new Error("User ID not found");
      }

      await endMeeting(meetingId.toString(), user.id);

      // Check if user is expert
      const isExpert = currentMeeting?.expert_id === user.id;

      if (isExpert) {
        router.push("/meetings");
      } else {
        router.push(`/meeting/${meetingId}/thank-you`);
      }
    } catch (error) {
      console.error("Error during meeting leave:", error);
      router.push(`/meeting/${meetingId}/thank-you`);
    }
  };

  if (loading || !isMeetingValid) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <MeetingProvider
      config={{
        meetingId,
        micEnabled: deviceSettings.micEnabled,
        webcamEnabled: deviceSettings.webcamEnabled,
        name: user?.user_metadata?.name ?? user?.email,
        mode: "SEND_AND_RECV",
        multiStream: true,
        debugMode: false,
        participantId: user?.id,
        ...(deviceSettings.selectedDevices && {
          audioInput: deviceSettings.selectedDevices.microphone,
          audioOutput: deviceSettings.selectedDevices.speaker,
          videoInput: deviceSettings.selectedDevices.camera,
        }),
      }}
      token={`${token}`}
    >
      <MeetingView
        meetingIdMain={meetingId}
        onMeetingLeave={onMeetingLeave}
        token={token}
      />
    </MeetingProvider>
  );
}
