function getUserMedia(constraints) {
  // if Promise-based API is available, use it
  if (navigator.mediaDevices) {
    return navigator.mediaDevices.getUserMedia(constraints);
  }

  // otherwise try falling back to old, possibly prefixed API...
  const legacyApi =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia ||
    navigator.msGetUserMedia;

  if (legacyApi) {
    // ...and promisify it
    return new Promise(function (resolve, reject) {
      legacyApi.bind(navigator)(constraints, resolve, reject);
    });
  }
}

/**
 * 스트림 가져오기
 * @param {'video'|'audio'} type
 * @returns {Promise<MediaStream>} stream
 */
export async function getStream(type) {
  if (
    !navigator.mediaDevices &&
    !navigator.getUserMedia &&
    !navigator.webkitGetUserMedia &&
    !navigator.mozGetUserMedia &&
    !navigator.msGetUserMedia
  ) {
    alert("User Media API not supported.");
    throw new Error("User Media API not supported.");
  }

  let constraints;
  
  if (type === "video") {
    constraints = {
      video: {
        facingMode: { exact: "environment" }, // 후면 카메라
      },
    };
  }

  if (type === "audio") {
    constraints = {
      audio: true,
    };
  }

  return await getUserMedia(constraints);
}