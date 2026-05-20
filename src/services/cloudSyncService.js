import { apiRequest } from "./apiClient";
import {
  cleanOrphanedRecords,
  exportDatabaseSnapshot,
  hasMeaningfulSnapshotData,
  importDatabaseSnapshot,
  initDatabase,
} from "./database";

export const pushSnapshot = (token, snapshot) =>
  apiRequest("/sync/push", {
    method: "POST",
    token,
    body: { snapshot },
  });

export const pullSnapshot = (token) =>
  apiRequest("/sync/pull", {
    token,
  });

export const syncCurrentSnapshot = async (token) => {
  if (!token) {
    return { mode: "skipped" };
  }

  initDatabase();
  const snapshot = exportDatabaseSnapshot();
  await pushSnapshot(token, snapshot);
  return { mode: "uploaded", exportedAt: snapshot.exportedAt };
};

export const reconcileLocalAndRemoteData = async (token) => {
  initDatabase();
  const localSnapshot = exportDatabaseSnapshot();
  const hasLocalData = hasMeaningfulSnapshotData(localSnapshot);

  if (hasLocalData) {
    await pushSnapshot(token, localSnapshot);
    return { mode: "uploaded" };
  }

  const remote = await pullSnapshot(token);
  if (remote?.snapshot?.tables) {
    importDatabaseSnapshot(remote.snapshot);
    cleanOrphanedRecords();
    return { mode: "downloaded", uploadedAt: remote.uploadedAt || null };
  }

  return { mode: "none" };
};
