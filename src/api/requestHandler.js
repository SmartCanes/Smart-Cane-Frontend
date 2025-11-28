export const handleRequest = async (request) => {
  try {
    const { data } = await request();
    return data;
  } catch (err) {
    console.error(err);
    if (err.response) {
      throw new Error(err.response.data.message || "Server Error");
    } else if (err.request) {
      throw new Error("No response from server");
    } else {
      throw new Error(err.message);
    }
  }
};
