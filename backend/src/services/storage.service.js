//colud strorage service
const ImageKit = require("imagekit");


const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
});

async function uploadFile(file, filename) {
    const result = await imagekit.upload({
        file: file,
        fileName: filename,
        // folder: "/zomato-food-videos"
    });

    return result;
}

async function deleteFile(fileId) {
    return imagekit.deleteFile(fileId);
}

module.exports = { uploadFile, deleteFile };