import { createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { HTTPException } from "hono/http-exception";
import { type User, type UserEmailUpdateRequest, type UserLoginRequest, type UserLoginResponse, UserLoginResponseSchema, type UserPasswordUpdateRequest, type UserRegisterRequest, type UserRow, UserSchema } from "types/User.ts";
import database from "#api-database/database.ts";
import { z } from "zod";
import ENV from "#api/env.ts";
import UserRepository from "#api/user/UserRepository.ts";

const INVALID_CREDENTIALS_ERROR = "Invalid email or password";
const INVALID_TOKEN_ERROR = "Invalid authentication token";
const EMAIL_ALREADY_REGISTERED_ERROR = "Email is already registered";
const AUTHORIZATION_PREFIX = "Bearer ";
const scryptAsync = promisify(scrypt);
const passwordKeyLength = 64;

const tokenPayloadSchema = z
  .object({
    sub: z.string().min(1),
    iat: z.number().int().nonnegative(),
  })
  .strict();

const tokenHeaderSchema = z.object({ alg: z.literal("HS256"), typ: z.literal("JWT") }).strict();

const toUser = ({ password_hash: _passwordHash, ...user }: UserRow): User => user;

const createToken = ({ id }: User): string => {
  const encodedHeader = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const encodedPayload = Buffer.from(JSON.stringify({ sub: id, iat: Math.floor(Date.now() / 1000) })).toString("base64url");
  const signature = createHmac("sha256", ENV.JWT_SECRET).update(`${encodedHeader}.${encodedPayload}`).digest("base64url");
  return `${encodedHeader}.${encodedPayload}.${signature}`;
};

const getUserId = ({ authorization }: { authorization: string }): string => {
  if (!authorization.startsWith(AUTHORIZATION_PREFIX)) throw new HTTPException(401, { message: INVALID_TOKEN_ERROR });

  const token = authorization.slice(AUTHORIZATION_PREFIX.length);
  const tokenParts = token.split(".");
  if (tokenParts.length !== 3) throw new HTTPException(401, { message: INVALID_TOKEN_ERROR });
  const [encodedHeader, encodedPayload, signature] = tokenParts;
  if (!encodedHeader || !encodedPayload || !signature) throw new HTTPException(401, { message: INVALID_TOKEN_ERROR });

  const expectedSignature = createHmac("sha256", ENV.JWT_SECRET).update(`${encodedHeader}.${encodedPayload}`).digest("base64url");
  if (signature.length !== expectedSignature.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    throw new HTTPException(401, { message: INVALID_TOKEN_ERROR });
  }

  try {
    tokenHeaderSchema.parse(JSON.parse(Buffer.from(encodedHeader, "base64url").toString()));
    return tokenPayloadSchema.parse(JSON.parse(Buffer.from(encodedPayload, "base64url").toString())).sub;
  } catch {
    throw new HTTPException(401, { message: INVALID_TOKEN_ERROR });
  }
};

export default class AuthService {
  static async login({ email, password }: UserLoginRequest): Promise<UserLoginResponse> {
    const userRow = await UserRepository.findBy({ email });
    const isPasswordValid = userRow && (await AuthService.verifyPassword({ password, passwordHash: userRow.password_hash }));
    if (!isPasswordValid) {
      throw new HTTPException(401, { message: INVALID_CREDENTIALS_ERROR });
    }

    const user = toUser(userRow);
    const result = UserLoginResponseSchema.parse(createToken(user));
    return result;
  }

  static async register({ first_name, last_name, birth_date, gender, income, city, country, language, email, password }: UserRegisterRequest): Promise<UserLoginResponse> {
    const userExists = await UserRepository.exists({ email });
    if (userExists) throw new HTTPException(409, { message: EMAIL_ALREADY_REGISTERED_ERROR });

    const password_hash = await AuthService.hashPassword({ password });
    const userRow = await UserRepository.createRaw({
      first_name,
      last_name,
      birth_date: `${birth_date}T00:00:00.000Z`,
      gender,
      income,
      city,
      country,
      language,
      email,
      password_hash,
      name: `${first_name} ${last_name}`,
    });
    const result = UserLoginResponseSchema.parse(createToken(toUser(userRow)));
    return result;
  }

  static async me({ authorization }: { authorization: string }): Promise<User> {
    const id = getUserId({ authorization });
    const userRow = await UserRepository.findBy({ id });
    if (!userRow) throw new HTTPException(401, { message: INVALID_TOKEN_ERROR });
    const result = UserSchema.parse(toUser(userRow));
    return result;
  }

  static async changeEmail({ authorization, email }: UserEmailUpdateRequest): Promise<User> {
    const user = await AuthService.me({ authorization });
    const existing = await UserRepository.findBy({ email });
    if (existing && existing.id !== user.id) throw new HTTPException(409, { message: EMAIL_ALREADY_REGISTERED_ERROR });
    const [userRow] = await database("users").where({ id: user.id }).update({ email }).returning("*");
    const result = UserSchema.parse(toUser(userRow));
    return result;
  }

  static async changePassword({ authorization, current_password, password }: UserPasswordUpdateRequest): Promise<void> {
    const id = getUserId({ authorization });
    const user = await UserRepository.findBy({ id });
    if (!user || !(await AuthService.verifyPassword({ password: current_password, passwordHash: user.password_hash }))) throw new HTTPException(401, { message: INVALID_CREDENTIALS_ERROR });
    const password_hash = await AuthService.hashPassword({ password });
    await database("users").where({ id }).update({ password_hash });
  }

  static async hashPassword({ password }: { password: string }): Promise<string> {
    const salt = randomBytes(16).toString("hex");
    const hash = (await scryptAsync(password, salt, passwordKeyLength)) as Buffer;
    const result = `${salt}:${hash.toString("hex")}`;
    return result;
  }

  static async verifyPassword({ password, passwordHash }: { password: string; passwordHash: string }): Promise<boolean> {
    const [salt, storedHash] = passwordHash.split(":");
    if (!salt || !storedHash) return false;

    const hash = (await scryptAsync(password, salt, passwordKeyLength)) as Buffer;
    const storedHashBuffer = Buffer.from(storedHash, "hex");
    const result = storedHashBuffer.length === hash.length && timingSafeEqual(storedHashBuffer, hash);
    return result;
  }
}
