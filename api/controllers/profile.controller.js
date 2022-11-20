const fs = require('fs-extra');
const path = require('path');



const uploadProfileImage = async (req, res) => {

    
    fs.ensureDirSync(path.join(process.cwd(), 'uploads', 'avatars'));
    const maxSize = 8 * 1024 * 1024;

    if (!req.files.file) {
        return res.status(400).send('No files were uploaded.');
    }


    if (req.files.file > maxSize) {
        return res.status(400).send('File too large');
    }


    const avatar = req.files.file.name.split('.')[0] + '-' + Date.now() +'.'+req.files.file.name.split('.').pop();
    const filename = path.join(process.cwd(), 'uploads', 'avatars', avatar);
    console.log(filename);
    const file = req.files.file;
    console.log("🚀 ~ file: auth.controller.js ~ line 319 ~ uploadProfileImage ~ file", file)

    file.mv(filename, async (err) => {
        if (err) {
            return res.status(500).send(err);
        }})



}


const downloadAvatar = async (req, res) => {
    
    
    const file = path.join(process.cwd(), 'uploads', 'avatars', req.query.avatar);
    console.log("🚀 ~ file: profile.controller.js ~ line 100 ~ downloadAvatar ~ file", file)
   
    const fileExists = await fs.existsSync(file);
    if (fileExists) {

        res.header('Content-Type', 'image/jpeg', 'image/png', 'image/jpg');
        res.sendFile(file);
        // var data = fs.readFileSync(file);
        // res.send(data);
    }
    else {
        res.status(404).json({
            message: "avatar not found"
        })
    }
}



module.exports = {
    uploadProfileImage,
    downloadAvatar
}

