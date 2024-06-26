import jwt from "jsonwebtoken";

type UserPayload = {
  id: string;
  email: string;
};

export function generateJWT(payload: UserPayload) {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: "180d",
  });

  return token;
}
