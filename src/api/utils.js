export const getImageUrl = (path) => {
  if (!path) return null;
  const url = "192.168.86.68";
  // Replace backslashes with forward slashes and remove 'src/' from the path
  const formattedPath = path.replace(/\\/g, "/").replace(/^src\//, "");

  return `http://192.168.86.68:7000/${formattedPath}`;
  // return `http://192.168.86.59:7000/${formattedPath}`;
};
