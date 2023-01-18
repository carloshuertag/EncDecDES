window.addEventListener('load', () => {
    const encryptForm = document.getElementById('encrypt');
    const decryptForm = document.getElementById('decrypt');
    encryptForm.addEventListener('submit', (event) => {
        event.preventDefault();
        let formData = new FormData();
        const fileName = encryptForm.elements.encryptFile.files[0].name;
        const fileType = encryptForm.elements.encryptFile.files[0].type;
        const isImage = fileType.startsWith('image');
        if (isImage) {
            let algorithm = 'des';
            if (encryptForm.elements.eMode.value != 'ECB')
                algorithm += '-' + encryptForm.elements.eMode.value;
            formData.append('algorithm', algorithm);
            formData.append('iv', encryptForm.elements.eIV.value);
        }
        formData.append(isImage ? 'image' : 'plainText', encryptForm.elements.encryptFile.files[0]);
        formData.append('secretKey', encryptForm.elements.eSecretKey.value);
        fetch(isImage ? '/encrypt_decrypt/encryptImage' : '/encrypt_decrypt/encrypt', {
            method: 'POST',
            body: formData,
        }).then((response) => {
            if (response.ok) return response.blob();
            else throw new Error('Error in network response.');
        }).then((blob) => {
            const url = window.URL.createObjectURL(blob),
                anchor = document.createElement("a");
            anchor.href = url;
            let aux = fileName.lastIndexOf('.');
            /*const suffix = fileName.substring(aux - 2); //Replacing suffix
            let newFileName;
            if (suffix.startsWith('_D'))
                newFileName = fileName.substring(0, aux++ - 2) + '_C.';
            else newFileName = fileName.substring(0, aux++) + '_C.';*/
            let newFileName = fileName.substring(0, aux++);
            newFileName += '_e' + encryptForm.elements.eMode.value.toUpperCase() + '.';
            anchor.download = newFileName + fileName.substring(aux);
            anchor.click();
            window.URL.revokeObjectURL(url);
            document.removeChild(anchor);
        }).catch((error) => { throw new Error(error); });
    });
    decryptForm.addEventListener('submit', (event) => {
        event.preventDefault();
        let formData = new FormData();
        const fileName = decryptForm.elements.decryptFile.files[0].name;
        const fileType = decryptForm.elements.decryptFile.files[0].type;
        const isImage = fileType.startsWith('image');
        if (isImage) {
            let algorithm = 'des';
            if (decryptForm.elements.dMode.value != 'ECB')
                algorithm += '-' + decryptForm.elements.dMode.value;
            formData.append('algorithm', algorithm);
            formData.append('iv', decryptForm.elements.dIV.value);
        }
        formData.append(isImage ? 'encryptedImage' : 'encrypted', decryptForm.elements.decryptFile.files[0]);
        formData.append('secretKey', decryptForm.elements.dSecretKey.value);
        fetch(isImage ? '/encrypt_decrypt/decryptImage' : '/encrypt_decrypt/decrypt', {
            method: 'POST',
            body: formData,
        }).then((response) => {
            if (response.ok) return response.blob();
            else {
                if (response.status == 401) alert('Decryption failed. Wrong parameters.');
                throw new Error('Error in network response.');
            }
        }).then((blob) => {
            let url = window.URL.createObjectURL(blob),
                anchor = document.createElement("a");
            anchor.href = url;
            let aux = fileName.lastIndexOf('.');
            /*const suffix = fileName.substring(aux - 2); //Replacing suffix
            let newFileName;
            if (suffix.startsWith('_C'))
                newFileName = fileName.substring(0, aux++ - 2) + '_D.';
            else newFileName = fileName.substring(0, aux++) + '_D.';*/
            let newFileName = fileName.substring(0, aux++);
            newFileName += '_d' + decryptForm.elements.dMode.value.toUpperCase() + '.';
            anchor.download = newFileName + fileName.substring(aux);
            anchor.click();
            window.URL.revokeObjectURL(url);
            document.removeChild(anchor);
        }).catch((error) => { throw new Error(error); });
    });
});