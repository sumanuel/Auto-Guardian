import * as FileSystem from "expo-file-system/legacy";

const VEHICLE_PHOTOS_DIR = `${FileSystem.documentDirectory}vehicle_photos/`;

const isOwnedVehiclePhoto = (uri) =>
  Boolean(uri) && uri.startsWith(VEHICLE_PHOTOS_DIR);

const guessExtension = (uri) => {
  const cleanUri = (uri || "").split("?")[0];
  const match = cleanUri.match(/\.([a-zA-Z0-9]+)$/);
  if (!match) return "jpg";
  const ext = match[1].toLowerCase();
  if (ext.length > 5) return "jpg";
  return ext;
};

export const persistVehiclePhotoAsync = async (sourceUri) => {
  if (!sourceUri) return null;

  try {
    await FileSystem.makeDirectoryAsync(VEHICLE_PHOTOS_DIR, {
      intermediates: true,
    });

    const ext = guessExtension(sourceUri);
    const fileName = `vehicle_${Date.now()}_${Math.floor(
      Math.random() * 1e9,
    )}.${ext}`;
    const destUri = `${VEHICLE_PHOTOS_DIR}${fileName}`;

    await FileSystem.copyAsync({ from: sourceUri, to: destUri });
    return destUri;
  } catch (error) {
    // Si no se puede copiar (algunos content:// en Android), dejamos el URI original.
    console.warn("No se pudo persistir la foto del vehículo:", error);
    return sourceUri;
  }
};

export const ensurePersistentVehiclePhotoAsync = async (sourceUri) => {
  if (!sourceUri) return null;
  if (isOwnedVehiclePhoto(sourceUri)) return sourceUri;

  try {
    const info = await FileSystem.getInfoAsync(sourceUri);
    if (!info.exists) {
      return null;
    }

    return await persistVehiclePhotoAsync(sourceUri);
  } catch (error) {
    console.warn("No se pudo normalizar la foto del vehículo:", error);
    return sourceUri;
  }
};

export const deleteVehiclePhotoIfOwnedAsync = async (uri) => {
  try {
    if (!uri) return;
    if (!isOwnedVehiclePhoto(uri)) return;

    const info = await FileSystem.getInfoAsync(uri);
    if (info.exists) {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    }
  } catch (error) {
    console.warn("No se pudo eliminar la foto del vehículo:", error);
  }
};
