import bcrypt from 'bcryptjs';

function comparePassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export { comparePassword, hashPassword };