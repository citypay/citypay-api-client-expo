declare var require: any;
const { createHash, randomBytes } = require('crypto');

export enum CryptoDigestAlgorithm {
    SHA1 = 'SHA-1',
    SHA256 = 'SHA-256',
    SHA384 = 'SHA-384',
    SHA512 = 'SHA-512',
}

export enum CryptoEncoding {
    HEX = 'hex',
    BASE64 = 'base64',
}

export async function digestStringAsync(
    algorithm: CryptoDigestAlgorithm,
    data: string,
    options?: { encoding?: CryptoEncoding }
): Promise<string> {
    const encoding = options?.encoding ?? CryptoEncoding.HEX;
    const algo = algorithm.replace('-', '').toLowerCase();
    const hash = createHash(algo);
    hash.update(data);
    return hash.digest(encoding as any);
}

export function getRandomBytes(length: number): Uint8Array {
    return new Uint8Array(randomBytes(length));
}
