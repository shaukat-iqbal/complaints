import imageCompression from "browser-image-compression";
import { getUser, convertToPicture } from "./userService";
import { toast } from "react-toastify";

export async function compressImage(imageFile) {
  var options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 720,
    useWebWorker: true
  };
  try {
    return await imageCompression(imageFile, options);
  } catch (error) {
    toast.warn("Some Error Occured");
  }
}

export async function setProfilePictureToken(id, role) {
  const { data: user } = await getUser(id, role);
  let profilePicture = "";
  if (user.profilePicture)
    profilePicture = convertToPicture(user.profilePicture.data);
  localStorage.setItem("profilePicture", profilePicture);
}
