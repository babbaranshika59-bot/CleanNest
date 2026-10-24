import { request } from "./apiClient.js";

export const authService = {
  login: ({ email, password }) => request("POST", "/auth/login", { body: { email, password } }),
  signup: (data) => request("POST", "/auth/signup", { body: data }),
};
