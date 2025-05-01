import Cookies from 'js-cookie';

//Function to set value in cookie
export const setCookie = (
  key: string,
  value: any,
  options: any = { expires: 1 }
) => {
  Cookies.set(key, value, options);
};

//Function to get value from cookie
export const getCookie = (key: string) => {
  return Cookies.get(key);
};

//Function to remove value from cookie
export const removeCookie = (key: string) => {
  return Cookies.remove(key);
};
