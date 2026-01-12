import avatarPlaceholder from "@/assets/images/default-profile.jpg";

export const resolveProfileImageSrc = (image) => {
  if (!image) return avatarPlaceholder;

  if (image.startsWith("blob:")) return image;

  if (image.startsWith("http")) return image;

  if (image.includes("default")) return image;

  return `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/uploads/${image}`;
};
