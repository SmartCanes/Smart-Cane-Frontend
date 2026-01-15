export const handleRequest = async (request) => {
  try {
    const { data } = await request();
    return data;
  } catch (err) {
    console.error("API Error:", err.response?.data?.message || err.message);
    throw err;
  }
};
