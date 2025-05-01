import axios from "axios";

const videoSDKClient = axios.create({
  baseURL: "https://api.videosdk.live",
  timeout: 90000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

export const initializeMeeting = async (roomId: string, token: string) => {
  try {
    console.log("TOKEN", token);
    const response = await videoSDKClient.post(
      "/infra/v1/meetings/init-config",
      {
        roomId,
      },
      {
        headers: {
          Authorization: token,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to initialize meeting"
    );
  }
};

export { videoSDKClient };
