import bcrypt from "bcrypt";

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

export async function checkPassword(password: string, enc_password: string) {
  return await bcrypt.compare(password, enc_password);
}
