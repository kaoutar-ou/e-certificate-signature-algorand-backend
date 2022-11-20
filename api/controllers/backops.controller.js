const Jimp = require("jimp");
const path = require("path");
const fs = require("fs-extra");
const request = require("request");


const uploadProfileImage = async (req, res) => {

    fs.ensureDirSync(path.join(process.cwd(), 'process', 'canvas'));
    const maxSize = 8 * 1024 * 1024;

    if (!req.files.file) {
        return res.status(400).send({
            message: "Please upload a file!",
        });
    }


    if (req.files.file > maxSize) {
        return res.status(400).send(
            {
                message: "File size cannot be larger than 8MB!",
            }
        );
    }


    const logo = req.files.file.name;
    console.log(logo)
    const filename = path.join(process.cwd(), 'process', 'canvas', logo);
    console.log(filename);
    const file = req.files.file;

    if (!logo.includes('png')) {

        file.mv(filename, async (err) => {
            if (err) {
                return res.status(500).send({ message: err });
            }

            Jimp.read(filename, function (err, image) {

                if (err) {
                    return res.status(500).send({ message: "Unsupported MIME type: image/*" });
                }
                else {
                    image
                        .resize(400, 150)
                        .quality(95)
                        .write(path.join(process.cwd(), 'process', 'canvas', logo.split('.')[0] + '.png'))
                         request.post(
                            {
                                url: 'http://localhost:7003/api/backops/upload-profile-image',
                                formData: {
                                    file: fs.createReadStream
                                        (path.join(process.cwd(), 'process', 'canvas', logo.split('.')[0] + '.png'))
                                }
                            },
                            function (err, httpResponse, body) {
                                if (err) {
                                    return res.status(500).send({ message: err });
                                }
                                else {
                                    fs.unlinkSync
                                    (
                                        path.join(process.cwd(), 'process', 'canvas', logo)
                                    )
                                    return res.status(200).send({ message: "Image uploaded successfully!" });
                                }
                            }

                        )

                   

                  

                }
            })
        })

    }

    else {
        file.mv(filename, async (err) => {
            if (err) {
                return res.status(500).send({ message: err });
            }
            request.post(
                {
                    url: 'http://localhost:7003/api/backops/upload-profile-image',
                    formData: {
                        file: fs.createReadStream
                            (path.join(process.cwd(), 'process', 'canvas', logo.split('.')[0] + '.png'))
                    }
                },
                function (err, httpResponse, body) {
                    if (err) {
                        return res.status(500).send({ message: err });
                    }
                    else {
                        fs.unlinkSync
                        (
                            path.join(process.cwd(), 'process', 'canvas', logo)
                        )
                        return res.status(200).send({ message: "Image uploaded successfully!" });
                    }
                }

            )
          
        })
    }



}






const uploadFile = (req, res) => {

    fs.ensureDirSync(path.join(process.cwd(), 'uploads', 'certificates'));
    const maxSize = 12 * 1024 * 1024;

    if (!req.files.file) {
        return res.status(400).send({
            message: "Please upload a file!",
        });
    }


    if (req.files.file > maxSize) {
        return res.status(400).send(
            {
                message: "File size cannot be larger than 12MB!",
            }
        );
    }

    const logo = req.files.file.name;
    console.log(logo)
    const filename = path.join(process.cwd(), 'uploads', 'certificates', logo);
    console.log(filename);
    const file = req.files.file;

    file.mv(filename, async (err) => {
        if (err) {
            return res.status(500).send({ message: err });
        }

        request.post(
            {
                url: 'http://localhost:7003/api/backops/upload-file',
                formData: {
                    apogee : "L54d54fd",
                    file: fs.createReadStream
                        (path.join(process.cwd(), 'uploads', 'certificates', logo))
                }
            },
            function (err, httpResponse, body) {
                if (err) {
                    return res.status(500).send({ message: err });
                }
                else {
                    fs.unlinkSync
                    (
                        path.join(process.cwd(), 'uploads', 'certificates', logo)
                    )
                    return res.status(200).send({ message: "File uploaded successfully!" });
                }
            }

        )
      
    })

}





module.exports = {
    uploadProfileImage,
    uploadFile
}