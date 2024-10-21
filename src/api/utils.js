import Config from "react-native-config";

// Function to get the image URL
export const getImageUrl = (path) => {
  if (!path) return null;

  // Fetch the base URL from the environment variables or use a default
  const baseUrl = Config.IMAGE_URL || "http://192.168.86.68:7000";

  // Replace backslashes with forward slashes and remove 'src/' from the path
  const formattedPath = path.replace(/\\/g, "/").replace(/^src\//, "");

  // Construct and return the complete image URL
  return `${baseUrl}/${formattedPath}`;
};
