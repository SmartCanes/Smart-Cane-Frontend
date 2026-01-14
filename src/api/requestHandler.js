const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const handleRequest = async (request) => {
  try {
    await sleep(2000);
    const { data } = await request();
    return data;
  } catch (err) {
    console.error("API Error:", err.response?.data?.message || err.message);
    throw err;
  }
};
