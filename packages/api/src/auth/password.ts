import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);
const keyLength = 64;

export const hashPassword = async ({ password }: { password: string }): Promise<string> => {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scryptAsync(password, salt, keyLength)) as Buffer;
  return `${salt}:${hash.toString("hex")}`;
};

export const verifyPassword = async ({ password, passwordHash }: { password: string; passwordHash: string }): Promise<boolean> => {
  const [salt, storedHash] = passwordHash.split(":");
  if (!salt || !storedHash) return false;

  const hash = (await scryptAsync(password, salt, keyLength)) as Buffer;
  const storedHashBuffer = Buffer.from(storedHash, "hex");
  return storedHashBuffer.length === hash.length && timingSafeEqual(storedHashBuffer, hash);
};
