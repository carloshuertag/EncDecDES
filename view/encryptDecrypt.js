window.addEventListener('load', () => {
    const encryptForm = document.getElementById('encrypt');
    const decryptForm = document.getElementById('decrypt');
    encryptForm.addEventListener('submit', (event) => {
        event.preventDefault();
        let formData = new FormData();
        const fileName = encryptForm.elements.encryptFile.files[0].name;
        formData.append('plainText', encryptForm.elements.encryptFile.files[0]);
        formData.append('secretKey', encryptForm.elements.eSecretKey.value);
        fetch('/encrypt_decrypt/encrypt', {
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
            const newFileName = fileName.substring(0, aux++) + '_C.';
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
        formData.append('encrypted', decryptForm.elements.decryptFile.files[0]);
        formData.append('secretKey', decryptForm.elements.dSecretKey.value);
        fetch('/encrypt_decrypt/decrypt', {
            method: 'POST',
            body: formData,
        }).then((response) => {
            if (response.ok) return response.blob();
            else throw new Error('Error in network response.');
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
            const newFileName = fileName.substring(0, aux++) + '_D.';
            anchor.download = newFileName + fileName.substring(aux);
            anchor.click();
            window.URL.revokeObjectURL(url);
            document.removeChild(anchor);
        }).catch((error) => { throw new Error(error); });
    });
});