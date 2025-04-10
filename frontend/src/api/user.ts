import axios from 'axios';

export type SuccessMessage = {
  message: string;
  success: true;
};

export type Profile = {
  email: string;
  success: true;
};

export type ApiError = {
  message: string;
  success: false;
};

export const getProfile = () => {
  return axios.get<Profile>('/api/user/profile');
};

export const signIn = (email: string, password: string) => {
  return axios.post<SuccessMessage>('/api/user/sign-in', {
    email,
    password,
  });
};

export const signUp = (email: string, password: string) => {
  return axios.post<SuccessMessage>('/api/user/sign-up', {
    email,
    password,
  });
};

export const signOut = () => {
  return axios.get<Profile>('/api/user/sign-out');
};
