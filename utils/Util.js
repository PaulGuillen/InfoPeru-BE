const Util = {
  generateAddressRandomID(n) {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomID = "";

    for (let i = 0; i < n; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomID += characters.charAt(randomIndex);
    }

    return randomID;
  },

  generateRandomUUID(n) {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let randomID = "";

    for (let i = 0; i < n; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomID += characters.charAt(randomIndex);
    }

    return randomID;
  },

  formatPubDate(dateStr) {
    try {
      const originalFormat = new Date(dateStr);
      if (isNaN(originalFormat)) return dateStr;

      const pad = (n) => (n < 10 ? "0" + n : n);
      return `${pad(originalFormat.getDate())}-${pad(
        originalFormat.getMonth() + 1
      )}-${originalFormat.getFullYear()} ${pad(
        originalFormat.getHours()
      )}:${pad(originalFormat.getMinutes())}`;
    } catch (err) {
      console.error("Error formatting publication date:", err);
      return dateStr;
    }
  },

  formatSeenDate(seenDateStr) {
    try {
      if (!seenDateStr || seenDateStr.length < 15) return seenDateStr;

      const year = seenDateStr.slice(0, 4);
      const month = seenDateStr.slice(4, 6);
      const day = seenDateStr.slice(6, 8);
      const hour = seenDateStr.slice(9, 11);
      const minute = seenDateStr.slice(11, 13);

      return `${day}-${month}-${year} ${hour}:${minute}`;
    } catch (err) {
      console.error("Error formateando seenDate:", err);
      return seenDateStr;
    }
  },

  sortBySeenDateDesc(articles) {
    return articles.sort((a, b) => {
      const dateA = new Date(a.seenDate.replace("T", "").replace("Z", ""));
      const dateB = new Date(b.seenDate.replace("T", "").replace("Z", ""));
      return dateB - dateA;
    });
  },

  formatFromUnix(timestamp) {
    try {
      const date = new Date(timestamp * 1000);
      const pad = (n) => (n < 10 ? "0" + n : n);
      return `${pad(date.getDate())}-${pad(
        date.getMonth() + 1
      )}-${date.getFullYear()} ${pad(date.getHours())}:${pad(
        date.getMinutes()
      )}`;
    } catch (err) {
      console.error("Error formateando timestamp:", err);
      return "";
    }
  },

  cleanDescription(htmlString = "") {
    try {
      const decoded = htmlString
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, " ");

      const matches = [...decoded.matchAll(/>([^<>]+)</g)];
      if (matches && matches.length > 0) {
        return matches
          .map((m) => m[1].trim())
          .filter(Boolean)
          .join(" • ");
      }

      return decoded.trim();
    } catch (e) {
      console.error("Error cleaning description:", e);
      return htmlString;
    }
  },
};

module.exports = Util;
