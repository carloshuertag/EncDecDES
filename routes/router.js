import { Router } from "express";
import { encrypt, decrypt } from "../app/encryptDecrypt.js";
import multer from "multer"; // multer module
import { readFile } from "node:fs";
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
        const text = file.mimetype.startsWith('text/');
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
                console.log("Plain Text: ", plainText);
                const secretKey = request.body.secretKey.substring(0, 8);
                console.log("Secret Key: ", secretKey);
                let encrypted = encrypt(plainText, secretKey);
                console.log("Encrypted: ", encrypted);
                response.set({
                    "Content-Disposition": 'attachment; filename="encrypted.txt"',
                    "Content-Type": "text/plain"
                });
                response.status(200).send(encrypted).end();
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
                console.log("Encrypted: ", encrypted);
                const secretKey = request.body.secretKey.substring(0, 8);
                let plainText = decrypt(encrypted, secretKey);
                console.log("Plain text: ", plainText);
                response.set({
                    "Content-Disposition": 'attachment; filename="plainText.txt"',
                    "Content-Type": "text/plain"
                });
                response.status(200).send(plainText).end();
            });
        } else response.status(400).end();
    });
});
export { router };