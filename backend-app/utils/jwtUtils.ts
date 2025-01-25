import jwt from "jsonwebtoken";

const ENCRYPTION_KEY = process.env.JWT_SECRET as string;

// Function to generate a JWT from an object
export const generateJWT = (data: object, expiresIn: number) => {
  const token = jwt.sign(data, ENCRYPTION_KEY, { expiresIn });
  return token;
};

// Function to decode a JWT to an object
export const verifyJWT = (token: string) => {
  const decoded = jwt.verify(token, ENCRYPTION_KEY);
  return decoded;
};

// Function to decode a JWT to an object (without verification, for frontend)
export const decodeJWTWithoutVerify = (token: string) => {
  const decoded = jwt.decode(token);
  return decoded;
};
