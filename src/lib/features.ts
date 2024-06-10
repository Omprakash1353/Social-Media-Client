import moment from "moment";

/**
 * Determine the format of a file based on its URL.
 * @param {string} url The URL of the file.
 * @returns {string} The format of the file ("video", "audio", "image", or "file").
 */
const fileFormat = (url = "") => {
  const fileExt = url.split(".").pop();

  if (fileExt === "mp4" || fileExt === "webm" || fileExt === "ogg")
    return "video";

  if (fileExt === "mp3" || fileExt === "wav") return "audio";
  if (
    fileExt === "png" ||
    fileExt === "jpg" ||
    fileExt === "jpeg" ||
    fileExt === "gif"
  )
    return "image";

  return "file";
};

/**
 * Transform the URL of an image by adding resizing parameters.
 * @param {string} url The URL of the image.
 * @param {number} width The desired width of the image.
 * @returns {string} The transformed URL with resizing parameters.
 */
const transformImage = (url = "", width = 100) => {
  const newUrl = url.replace("upload/", `upload/dpr_auto/w_${width}/`);

  return newUrl;
};

/**
 * Get the names of the last 7 days.
 * @returns {string[]} An array containing the names of the last 7 days.
 */
const getLast7Days = () => {
  const currentDate = moment();
  const last7Days = [];

  for (let i = 0; i < 7; i++) {
    const dayDate = currentDate.clone().subtract(i, "days");
    const dayName = dayDate.format("dddd");

    last7Days.unshift(dayName);
  }

  return last7Days;
};

export { fileFormat, transformImage, getLast7Days };
