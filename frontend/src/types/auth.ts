export interface AuthResponse {
  accessToken: string;
  userId: string;
  email: string;
  newUser: boolean;
}

export interface EmailOtpRequest {
  email: string;
}

export interface EmailOtpVerifyRequest {
  email: string;
  otp: string;
}

export interface GoogleAuthRequest {
  idToken: string;
}