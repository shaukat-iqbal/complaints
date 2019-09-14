import imageCompression from "browser-image-compression";
import { getUser, convertToPicture } from "./userService";
import { getCurrentUser } from "./authService";

export async function compressImage(imageFile) {
  var options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 720,
    useWebWorker: true
  };
  try {
    return await imageCompression(imageFile, options);
  } catch (error) {
    console.log(error);
  }
}

export async function setProfilePictureToken(id, role) {
  console.log("Start of function");

  const { data: user } = await getUser(id, role);
  console.log(user);
  let profilePicture = "";
  if (user.profilePicture)
    profilePicture = convertToPicture(user.profilePicture.data);

  localStorage.setItem("profilePicture", profilePicture);
  console.log("end of function");
}
