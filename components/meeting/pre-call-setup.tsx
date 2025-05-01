"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useMediaDevice,
  createCameraVideoTrack,
  createMicrophoneAudioTrack,
} from "@videosdk.live/react-sdk";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Settings,
  ChevronUp,
} from "lucide-react";
import ReactPlayer from "react-player";

const schema = z.object({
  camera: z.string().min(1, "Please select a camera"),
  microphone: z.string().min(1, "Please select a microphone"),
  speaker: z.string().min(1, "Please select a speaker"),
});

export default function PreCallSetup({
  onJoinMeeting,
}: {
  onJoinMeeting: any;
}) {
  const [loading, setLoading] = useState(true);
  const [cameraStream, setCameraStream] = useState<any>(null);
  const [networkQuality, setNetworkQuality] = useState<any>(null);
  const { getDevices } = useMediaDevice();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
  });

  // Watch for changes in device selections
  const selectedCamera = watch("camera");
  const selectedMicrophone = watch("microphone");
  const selectedSpeaker = watch("speaker");

  const [devices, setDevices] = useState({
    cameras: [],
    microphones: [],
    speakers: [],
  });

  const [micEnabled, setMicEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  // Function to update camera stream
  const updateCameraStream = async (deviceId: string) => {
    try {
      if (cameraStream) {
        // Stop all tracks of the existing stream
        cameraStream.getTracks().forEach((track: any) => track.stop());
      }

      const videoTrack: any = await createCameraVideoTrack({
        cameraId: deviceId,
        optimizationMode: "motion",
        multiStream: false,
      });

      setCameraStream(videoTrack);

      // Set the enabled state based on videoEnabled
      if (videoTrack) {
        videoTrack.enabled = videoEnabled;
      }
    } catch (error) {
      console.error("Error updating camera stream:", error);
    }
  };

  // Watch for camera changes
  useEffect(() => {
    if (selectedCamera) {
      updateCameraStream(selectedCamera);
    }
  }, [selectedCamera]);

  useEffect(() => {
    initialize();
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track: any) => track.stop());
      }
    };
  }, []);

  const initialize = async () => {
    try {
      setLoading(true);
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const allDevices = await getDevices();

      const devicesByType: any = {
        cameras: allDevices.filter((device) => device.kind === "videoinput"),
        microphones: allDevices.filter(
          (device) => device.kind === "audioinput"
        ),
        speakers: allDevices.filter((device) => device.kind === "audiooutput"),
      };

      setDevices(devicesByType);

      // Set initial values
      if (devicesByType.cameras.length) {
        const defaultCameraId = devicesByType.cameras[0].deviceId;
        setValue("camera", defaultCameraId);
        await updateCameraStream(defaultCameraId);
      }
      if (devicesByType.microphones.length)
        setValue("microphone", devicesByType.microphones[0].deviceId);
      if (devicesByType.speakers.length)
        setValue("speaker", devicesByType.speakers[0].deviceId);
    } catch (error) {
      console.error("Error initializing devices:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleMic = () => {
    setMicEnabled((prev) => !prev);
  };

  const toggleVideo = () => {
    setVideoEnabled((prev) => !prev);
    if (cameraStream) {
      cameraStream.enabled = !videoEnabled;
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      onJoinMeeting({
        selectedDevices: data,
        micEnabled: micEnabled,
        webcamEnabled: videoEnabled,
      });
    } catch (error) {
      console.error("Error joining meeting:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      {/* Full-screen video preview */}
      <div className="absolute inset-0">
        {videoEnabled && cameraStream ? (
          <ReactPlayer
            playsinline
            pip={false}
            light={false}
            controls={false}
            muted={true}
            playing={true}
            url={cameraStream}
            width="100%"
            height="100%"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-100">
            <VideoOff className="h-16 w-16 sm:h-24 sm:w-24 text-gray-400" />
          </div>
        )}
      </div>

      {/* Overlay controls at bottom */}
      <div className="absolute bottom-0 left-0 right-0 px-4 py-3 sm:px-6 sm:py-4">
        <div className="max-w-7xl mx-auto">
          {/* Media controls */}
          <div className="flex justify-center items-center space-x-4 sm:space-x-6 mb-3">
            <button
              type="button"
              onClick={toggleMic}
              className={`flex flex-col items-center space-y-1`}
            >
              <div
                className={`p-2.5 sm:p-3.5 rounded-full backdrop-blur-md ${
                  micEnabled
                    ? "bg-white/90 hover:bg-white/95"
                    : "bg-red-500/90 hover:bg-red-500/95"
                }`}
              >
                {micEnabled ? (
                  <Mic className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
                ) : (
                  <MicOff className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                )}
              </div>
              <span className="text-xs sm:text-sm text-white drop-shadow-md">
                {micEnabled ? "Mute" : "Unmute"}
              </span>
            </button>

            <button
              type="button"
              onClick={toggleVideo}
              className="flex flex-col items-center space-y-1"
            >
              <div
                className={`p-2.5 sm:p-3.5 rounded-full backdrop-blur-md ${
                  videoEnabled
                    ? "bg-white/90 hover:bg-white/95"
                    : "bg-red-500/90 hover:bg-red-500/95"
                }`}
              >
                {videoEnabled ? (
                  <Video className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
                ) : (
                  <VideoOff className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                )}
              </div>
              <span className="text-xs sm:text-sm text-white drop-shadow-md">
                {videoEnabled ? "Stop Video" : "Start Video"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setShowSettings(!showSettings)}
              className="flex flex-col items-center space-y-1"
            >
              <div className="p-2.5 sm:p-3.5 rounded-full backdrop-blur-md bg-white/90 hover:bg-white/95">
                <Settings className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" />
              </div>
              <span className="text-xs sm:text-sm text-white drop-shadow-md">
                Settings
              </span>
            </button>
          </div>

          {/* Join button */}
          <div className="flex justify-center mb-4">
            <Button
              onClick={handleSubmit(onSubmit)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 text-sm sm:text-base rounded-full"
            >
              Join Meeting
            </Button>
          </div>
        </div>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div className="absolute right-2 sm:right-4 bottom-24 sm:bottom-32 bg-white rounded-lg shadow-lg p-4 sm:p-6 w-[calc(100%-1rem)] sm:w-96 border border-gray-200">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Camera
              </Label>
              <Select {...register("camera")}>
                <SelectTrigger className="w-full mt-1 bg-white border-gray-200">
                  <SelectValue placeholder="Select camera" />
                </SelectTrigger>
                <SelectContent className=" border-gray-200">
                  {devices.cameras.map((device: any) => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.camera && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.camera.message as string}
                </p>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Microphone
              </Label>
              <Select {...register("microphone")}>
                <SelectTrigger className="w-full mt-1 bg-white border-gray-200 ">
                  <SelectValue placeholder="Select microphone" />
                </SelectTrigger>
                <SelectContent className=" border-gray-200">
                  {devices.microphones.map((device: any) => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.microphone && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.microphone.message as string}
                </p>
              )}
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Speaker
              </Label>
              <Select {...register("speaker")}>
                <SelectTrigger className="w-full mt-1 bg-white border-gray-200">
                  <SelectValue placeholder="Select speaker" />
                </SelectTrigger>
                <SelectContent className=" border-gray-200">
                  {devices.speakers.map((device: any) => (
                    <SelectItem key={device.deviceId} value={device.deviceId}>
                      {device.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.speaker && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.speaker.message as string}
                </p>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
