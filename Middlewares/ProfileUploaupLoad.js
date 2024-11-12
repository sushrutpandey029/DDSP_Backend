import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'Views/src/ProfileImage/'); // Directory where the files will be saved
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname)); // Unique file name
    }
});

const ProfileUploaupLoad = multer({ storage: storage });

export default ProfileUploaupLoad;
