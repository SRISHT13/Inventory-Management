import API from "./api";

export const getSettings = async () => {
  try {
    const res = await API.get("/settings");
    return res.data;
  } catch (error) {
    console.error("Get Settings Error:", error);
    return null;
  }
};

export const updateSettings = async (settingsData) => {
  try {
    const res = await API.put("/settings", settingsData);
    return res.data;
  } catch (error) {
    console.error("Update Settings Error:", error);
    throw error;
  }
};
