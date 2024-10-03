import moment from "moment";

export const getTimeAgo = (dateString) => {
  const postDate = moment(dateString);
  const now = moment();

  // If the post is older than a week, display the exact date.
  if (now.diff(postDate, "weeks") >= 1) {
    return postDate.format("MMM D, YYYY"); // Example: Jan 10, 2022
  }

  // Otherwise, show the relative time.
  return postDate.fromNow(); // Example: "5 minutes ago", "3 days ago"
};
