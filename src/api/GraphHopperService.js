import axios from "axios";

export const getWalkingRoute = async (start, destination) => {
  try {
    const { data } = await axios.post(
      "http://localhost:8989/route",
      {
        points: [start, destination],
        profile: "foot",
        points_encoded: false
      },
      {
        headers: {
          "Content-Type": "application/json",
          withCredentials: false
        }
      }
    );

    if (!data.paths) throw new Error("No route found");

    return data.paths[0].points.coordinates; // [[lon, lat], ...]
  } catch (err) {
    console.error("GraphHopper routing error:", err.message || err);
    return [];
  }
};