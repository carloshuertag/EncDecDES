import { randomBytes, createCipheriv, createDecipheriv } from 'node:crypto'; // crypto is a built-in module in node.js

const algorithm = "des"; // symmetric encryption algorithm 
const initializationVector = randomBytes(8);

export function encrypt(plainText, secretKey) {
    const cipher = createCipheriv(algorithm, secretKey, initializationVector); // cipher stream object
    let encrypted = cipher.update(plainText, "utf-8", "hex"); // encrypt message with the given input and output encoding
    encrypted += cipher.final("hex"); // finalize encryption, cipher stream is now closed
    return encrypted;
}

export function encryptBuffer(buffer, customAlgorithm, iV, secretKey) {
    const cipher = createCipheriv(customAlgorithm, secretKey, iV); // cipher stream object
    let encrypted = cipher.update(buffer); // encrypt message with the given input and output encoding
    encrypted = Buffer.concat([encrypted, cipher.final()]); // finalize encryption, cipher stream is now closed
    return encrypted;
}

export function decrypt(encrypted, secretKey) {
    const decipher = createDecipheriv(algorithm, secretKey, initializationVector); // decipher stream object
    let decrypted = decipher.update(encrypted, "hex", "utf-8"); // decrypt message with the given input and output encoding
    decrypted += decipher.final("utf-8"); // finalize decryption, decipher stream is now closed
    return decrypted;
}

export function decryptBuffer(buffer, customAlgorithm, iV, secretKey) {
    const decipher = createDecipheriv(customAlgorithm, secretKey, iV); // decipher stream object
    let decrypted = decipher.update(buffer); // decrypt message with the given input and output encoding
    decrypted = Buffer.concat([decrypted, decipher.final()]); // finalize decryption, decipher stream is now closed
    return decrypted;
}