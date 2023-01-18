import { Router } from "express";
import { encrypt, decrypt, encryptBuffer, decryptBuffer } from "../app/encryptDecrypt.js";
import multer from "multer"; // multer module
import { readFile, writeFile } from "node:fs";
const multerConfig = { // multipart/form-data enctypes
    storage: multer.diskStorage({
        destination: (request, file, next) => {
            next(null, './tmp');
        },
        filename: (request, file, next) => {
            const ext = file.originalname.substring(file.originalname.lastIndexOf('.') + 1);
            next(null, file.fieldname + '.' + ext);
        }
    }),
    fileFilter: (request, file, next) => {
        if (!file) next();
        const text = file.mimetype.startsWith('text/') || file.mimetype.startsWith('image/');
        if (text) {
            console.log('file supported');
            next(null, true);
        } else {
            console.log("file not supported");
            return next();
        }
    }
};
const router = Router();
router.post('/encrypt', (request, response) => {
    multer(multerConfig).single('plainText')(request, response, (err) => {
        if (err instanceof multer.MulterError) {
            console.log("A Multer error occurred when uploading.");
            response.status(500).end();
        } else if (err) {
            onsole.log("An unknown error occurred when uploading.");
            response.status(500).end();
        }
        if (request.body.secretKey) {
            readFile('./tmp/plainText.txt', (err, data) => {
                if (err) throw err;
                let plainText = data.toString();
                const secretKey = request.body.secretKey.substring(0, 8);
                let encrypted = encrypt(plainText, secretKey);
                console.log("Encrypted");
                response.set({
                    "Content-Disposition": 'attachment; filename="encrypted.txt"',
                    "Content-Type": "text/plain"
                });
                response.status(200).send(encrypted).end();
            });
        } else response.status(400).end();
    });
});
router.post('/encryptImage', (request, response) => {
    multer(multerConfig).single('image')(request, response, (err) => {
        if (err instanceof multer.MulterError) {
            console.log("A Multer error occurred when uploading.");
            response.status(500).end();
        } else if (err) {
            console.log("An unknown error occurred when uploading.");
            response.status(500).end();
        }
        const ext = request.file.originalname.substring(request.file.originalname.lastIndexOf('.') + 1);
        if (request.body.secretKey && request.body.iv && request.body.algorithm) {
            readFile('./tmp/image.' + ext, (err, data) => { // read bmp file
                if (err) throw err;
                const bmpHeader = data.subarray(0, 54);
                const plain = data.subarray(54);
                const algorithm = request.body.algorithm || 'des';
                const secretKey = request.body.secretKey.substring(0, 8);
                const ivString = request.body.iv.substring(0, 8);
                const initializationVector = Buffer.from(ivString, 'utf8');
                console.log("Algorithm: ", algorithm);
                let encrypted = encryptBuffer(plain, algorithm, initializationVector, secretKey);
                const encryptedImage = Buffer.concat([bmpHeader, encrypted]);
                writeFile('./tmp/encryptedImage.' + ext, encryptedImage, 'binary', (err) => {
                    if (err) throw err;
                    console.log("Encrypted image saved.");
                });
                response.set({
                    "Content-Disposition": 'attachment; filename="encrypted.' + ext + '"',
                    "Content-Type": "image/*"
                });
                response.status(200).send(encryptedImage).end();
            });
        } else response.status(400).end();
    });
});
router.post('/decrypt', (request, response) => {
    multer(multerConfig).single('encrypted')(request, response, (err) => {
        if (err instanceof multer.MulterError) {
            console.log("A Multer error occurred when uploading.");
            response.status(500).end();
        } else if (err) {
            onsole.log("An unknown error occurred when uploading.");
            response.status(500).end();
        }
        if (request.body.secretKey) {
            readFile('./tmp/encrypted.txt', (err, data) => {
                if (err) throw err;
                let encrypted = data.toString();
                const secretKey = request.body.secretKey.substring(0, 8);
                let plainText = decrypt(encrypted, secretKey);
                console.log("Decrypted")
                response.set({
                    "Content-Disposition": 'attachment; filename="plainText.txt"',
                    "Content-Type": "text/plain"
                });
                response.status(200).send(plainText).end();
            });
        } else response.status(400).end();
    });
});
router.post('/decryptImage', (request, response) => {
    multer(multerConfig).single('encryptedImage')(request, response, (err) => {
        if (err instanceof multer.MulterError) {
            console.log("A Multer error occurred when uploading.");
            response.status(500).end();
        } else if (err) {
            console.log("An unknown error occurred when uploading.");
            response.status(500).end();
        }
        if (request.body.secretKey && request.body.iv && request.body.algorithm) {
            readFile('./tmp/encryptedImage.bmp', (err, data) => {
                if (err) {
                    console.log("Error reading encrypted image.");
                    response.status(500).end();
                }
                const bmpHeader = data.subarray(0, 54);
                const encrypted = data.subarray(54);
                const algorithm = request.body.algorithm || 'des';
                const secretKey = request.body.secretKey.substring(0, 8);
                const ivString = request.body.iv.substring(0, 8);
                const initializationVector = Buffer.from(ivString, 'utf8');
                try {
                    let plain = decryptBuffer(encrypted, algorithm, initializationVector, secretKey);
                    const plainImage = Buffer.concat([bmpHeader, plain]);
                    console.log("Decrypted")
                    response.set({
                        "Content-Disposition": 'attachment; filename="plainImage.*"',
                        "Content-Type": "image/*"
                    });
                    response.status(200).send(plainImage).end();
                } catch (err) {
                    console.log("Error decrypting image.");
                    response.status(401).end();
                }
            });
        } else response.status(400).end();
    });
});
export { router };