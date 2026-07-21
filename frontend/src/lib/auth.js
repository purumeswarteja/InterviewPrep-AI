const TOKEN_KEY = "interview_prep_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (token) => {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
};
export const clearToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};
