import { AgentType, NewUserInfoType, UserType } from "@models/AppModels";
import { ApiPaths } from "../constants";
import axiosInstance from "./AxiosInstance";
import { clearToken, saveToken } from "@utils/auth";

export const getActiveUser = async (): Promise<UserType> => {
  try {
    const response = await axiosInstance.get(`/${ApiPaths.USERS_PATH}/user`);
    if (response.data?.token) {
      saveToken(response.data.token);
      return response.data.user;
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const registerUser = async (
  userInfo: NewUserInfoType,
  experimentId: string
): Promise<UserType> => {
  try {
    const response = await axiosInstance.post(
      `/${ApiPaths.USERS_PATH}/create`,
      { userInfo, experimentId }
    );
    if (response.data?.token) {
      saveToken(response.data.token);
      return response.data.user;
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const login = async (
  username: string,
  userPassword: string,
  experimentId: string
): Promise<{ token: string; user: UserType }> => {
  try {
    const response = await axiosInstance.post(`/${ApiPaths.USERS_PATH}/login`, {
      username,
      userPassword,
      experimentId,
    });
    if (response.data?.token) {
      saveToken(response.data.token);
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await axiosInstance.post(`/${ApiPaths.USERS_PATH}/logout`);
    clearToken();
    return;
  } catch (error) {
    throw error;
  }
};

export const validateUserName = async (
  username: string,
  experimentId: string
): Promise<boolean> => {
  try {
    const response = await axiosInstance.get(
      `/${ApiPaths.USERS_PATH}/validate?username=${username}&experimentId=${experimentId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUsersAgent = async (agent: AgentType): Promise<void> => {
  try {
    const response = await axiosInstance.put(`/${ApiPaths.USERS_PATH}/agent`, {
      agent,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
