import CryptoJS from 'crypto-js';

export const encryptPassword = (inputPassword: string) => {
  const iv = CryptoJS.lib.WordArray.random(128 / 8);
  const encrypted = CryptoJS.AES.encrypt(inputPassword, process.env.SECRET, { iv });
  const ivAndEncrypted = `${iv.toString(CryptoJS.enc.Hex)}:${encrypted.toString()}`;
  return ivAndEncrypted;
};

export const verifyPassword = (inputPassword: string, storedEncryptedPassword: string) => {
  const [storedIv, storedEncrypted] = storedEncryptedPassword.split(':');
  const iv = CryptoJS.enc.Hex.parse(storedIv);
  const decrypted = CryptoJS.AES.decrypt(storedEncrypted, process.env.SECRET, { iv });
  const originalPassword = decrypted.toString(CryptoJS.enc.Utf8);
  return inputPassword === originalPassword;
};
