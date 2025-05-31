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
      return `${originalFormat.getFullYear()}-${pad(
        originalFormat.getMonth() + 1
      )}-${pad(originalFormat.getDate())} ${pad(
        originalFormat.getHours()
      )}:${pad(originalFormat.getMinutes())}`;
    } catch (err) {
      console.error("Error formatting publication date:", err);
      return dateStr;
    }
  },
};

module.exports = Util;