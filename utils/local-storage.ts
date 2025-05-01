//Function to check local storage is available or not
export const localStorageAvailable: () => boolean = () => {
  try {
    // Incognito mode might reject access to the localStorage for security reasons.
    // window isn't defined on Node.js
    // https://stackoverflow.com/questions/16427636/check-if-localstorage-is-available
    const ramdom_key = "check_storage";
    localStorage.setItem(ramdom_key, ramdom_key);
    localStorage.removeItem(ramdom_key);
    return true;
  } catch (err) {
    return false;
  }
};

//Function to get value from local storage
export const getLocalStorage = (key: string) => {
  try {
    let localStoragePayload = localStorage.getItem(key);
    if (!localStoragePayload) return undefined;
    return JSON.parse(localStoragePayload);
  } catch (e) {
    return undefined;
  }
};

//Function to set value in local storage
export const setLocalStorage = async (key: string, payload: any) => {
  if (typeof window !== "undefined") {
    // Perform localStorage action
    localStorage.setItem(key, JSON.stringify(payload));
  }
};

//Function to remove data from local storage
export const removeLocalStorage = (key: string) => {
  if (typeof window !== "undefined") {
    // Perform localStorage action
    localStorage.removeItem(key);
  }
};
