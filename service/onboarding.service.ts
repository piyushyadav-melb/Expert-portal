import { privateClient } from "@/http/http-client";

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export enum JobType {
  EMPLOYED = "EMPLOYED",
  SELF_EMPLOYED = "SELF_EMPLOYED",
  BUSINESS = "BUSINESS",
}

export interface OnboardingStep1Data {
  gender: Gender;
  dateOfBirth: string;
  whatsappNumber: string;
  addressLine1: string;
  addressLine2?: string;
  country: string;
  state: string;
  city: string;
  profilePicture?: File;
}

export interface OnboardingStep2Data {
  introVideoTitle: string;
  jobTitle: string;
  keywords: any;
  achievements: string;
  consultationLanguage: string;
  consultationCharge: string;
  jobType: any;
  introVideo?: File;
}

export interface OnboardingStep3Data {
  identityFront: File;
  identityBack: File;
  certificate: File;
  license: File;
}

export const submitStep1 = async (data: OnboardingStep1Data) => {
  try {
    const response = await privateClient.post(
      "/expert/onboarding/step1",
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to submit step 1");
  }
};

export const submitStep2 = async (data: any) => {
  try {
    const response = await privateClient.post(
      "/expert/onboarding/step2",
      data,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to submit step 2");
  }
};

export const submitStep3 = async (data: OnboardingStep3Data) => {
  try {
    const formData = new FormData();
    formData.append("identityFront", data.identityFront);
    formData.append("identityBack", data.identityBack);
    formData.append("certificate", data.certificate);
    formData.append("license", data.license);
    const response = await privateClient.post(
      "/expert/onboarding/step3",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to submit step 3");
  }
};

export const getExpertProfile = async () => {
  try {
    const response = await privateClient.get("/expert/profile");
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to fetch profile");
  }
};
