// Converts strings like "1 day ago", "2 weeks ago" → numeric days (for sorting)
function convertPostDateToDays(postDate) {
  if (!postDate) return 999;

  postDate = postDate.toLowerCase();

  if (postDate.includes("day")) {
    const match = postDate.match(/(\d+)/);
    return match ? parseInt(match[1]) : 1;
  }

  if (postDate.includes("week")) {
    const match = postDate.match(/(\d+)/);
    return match ? parseInt(match[1]) * 7 : 14;
  }

  if (postDate.includes("month")) {
    return 30;
  }

  return 999;
}

module.exports = convertPostDateToDays;
