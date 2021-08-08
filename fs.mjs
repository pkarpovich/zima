import { readdir, access } from "fs/promises";

export const GetDirFiles = (path) => readdir(path);

export const IsFileExists = async (path) => {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
};
