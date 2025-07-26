// src/DAL/server-requests/personality.ts

import axiosInstance from "./AxiosInstance";

export interface PersonalityPayload {
  userId: string;
  experimentId: string;
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export const submitPersonalityScores = async (payload: PersonalityPayload) => {
  console.log("📤 Submitting personality scores:", payload);

  // Build exactly what /api/personality expects
  const body = {
    userId: payload.userId,
    experimentId: payload.experimentId,
    openness: payload.openness,
    conscientiousness: payload.conscientiousness,
    extraversion: payload.extraversion,
    agreeableness: payload.agreeableness,
    neuroticism: payload.neuroticism,
  };

  try {
    const response = await axiosInstance.post(
      "/personality",
      body,
      { withCredentials: true } // send your JWT cookie
    );
    console.log("✅ Personality scores submitted successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error("❌ Failed to submit personality scores:", error);
    throw error;
  }
};

export const fetchPersonalityScores = async (userId: string) => {
  try {
    const response = await axiosInstance.get(`/personality/user/${userId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("❌ Failed to fetch personality scores:", error);
    throw error;
  }
};
