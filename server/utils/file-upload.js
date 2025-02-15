const dayjs = require('dayjs');
const fs = require('fs');

exports.fileUpload = async function (files, directory) {
    return new Promise((resolve, reject) => {
        try {
            // Check if files is an array
            if (!Array.isArray(files)) {
                reject("Expected an array of files.");
                return;
            }

            // Create an array to hold the paths of uploaded files
            let uploadedFilePaths = [];

            // Process each file in the array
            for (let file of files) {
                let mime_type = file.split(';')[0].split(":")[1].split('/')[1];
                console.log("mime_type : ", mime_type);

                if (mime_type === "png" || mime_type === "jpeg" || mime_type === "jpg" || mime_type === "mp4" || mime_type === "pdf" || mime_type === "webp") {
                    console.log("Allowed file type...");

                    let file_name = dayjs().format("YYYYMMDDHHmmss") + String(Math.floor(Math.random() * 100)) + "." + mime_type;
                    console.log("file_name : ", file_name);

                    let upload_path = `uploads/${directory}`;
                    console.log("upload_path : ", upload_path);

                    let base64 = file.split(';base64,')[1];

                    fs.mkdir(upload_path, { recursive: true }, (err) => {
                        if (err) {
                            console.log("err : ", err);
                            reject(err.message ? err.message : err);
                        } else {
                            let filePath = `${upload_path}/${file_name}`;
                            console.log("filePath : ", filePath);

                            fs.writeFile(filePath, base64, { encoding: "base64" }, function (err) {
                                if (err) {
                                    console.log("err : ", err);
                                    reject(err.message ? err.message : err);
                                } else {
                                    uploadedFilePaths.push(filePath);
                                    if (uploadedFilePaths.length === files.length) {
                                        resolve(uploadedFilePaths);
                                    }
                                }
                            });
                        }
                    });

                } else {
                    console.log("Invalid file type");
                    reject("File size up to 100mb and Formats .png, .jpeg, .jpg, .mp4, .webp, .pdf are only allowed");
                    return;
                }
            }

        } catch (error) {
            console.log("error : ", error);
            reject(error.message ? error.message : error);
        }
    });
}
