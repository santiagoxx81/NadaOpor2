import bcrypt from 'bcrypt';

export async function hashSenha(plain) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

export async function compararSenha(plain, hash) {
  return bcrypt.compare(plain, hash);
}
