import * as jwt from 'jsonwebtoken';

// You can generate keys by https://travistidwell.com/jsencrypt/demo/
export const privateKey = `-----BEGIN RSA PRIVATE KEY-----
YOUR PRIVATE KEY
-----END RSA PRIVATE KEY-----`;

const publicKey = `-----BEGIN PUBLIC KEY-----
YOUR PUBLICK KEY
-----END PUBLIC KEY-----`;

export function signJwt(payload) {
  return jwt.sign(payload, privateKey, { algorithm: 'RS256', expiresIn: '1y' });
}

export function decode(token: string) {
  if (!token) return null;
  try {
    token = token.replace('Bearer ', '');
    const decoded = jwt.verify(token, publicKey);

    return decoded;
  } catch (error) {
    console.error(`error`, error);
    return null;
  }
}
