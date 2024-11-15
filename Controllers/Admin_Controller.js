import Adminmodel from '../Models/AdminModel.js'
import UserModel from '../Models/UserModel.js'
import path from 'path'
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';


export const Adminlogin = async (req, res) => {
    res.render('index');

};

export const AdminRegister = async (req, res) => {
    try {
        const { fullname, email, password } = req.body;

        // Validate input
        if (!fullname || !email || !password) {
            return res.status(400).send({ errormessage: "All fields are required" });
        }

        // Validate email format
        const emailRegex = /^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).send({ message: "Email is not valid" });
        }

        // Check for duplicate email
        const isDuplicateEmail = await Adminmodel.findOne({ where: { email } });
        if (isDuplicateEmail) {
            return res.status(400).send({ errormessage: "Email already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new admin
        const newAdmin = await Adminmodel.create({ ...req.body, password: hashedPassword });
        console.log('New Admin:', newAdmin);

        return res.status(201).send({
            status: true,
            message: "Admin created successfully",
            admin: { id: newAdmin.id, fullname: newAdmin.fullname, email: newAdmin.email }
        });

    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error creating admin', err: err.message });
    }
};

export const AdminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            // Redirect to '/' with an error message if fields are missing
            req.flash('error', 'All fields are required');
            return res.status(400).redirect('/');
        }

        // Check if the user exists
        const user = await Adminmodel.findOne({ where: { email } });
        if (!user) {
            // Redirect to '/' with an error message if the user is not found
            req.flash('error', 'User not found');
            return res.status(401).redirect('/');
        }

        // Check if the password is correct
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            // Redirect to '/' with an error message if the password is invalid
            req.flash('error', 'Invalid password');
            return res.status(401).redirect('/');
        }

        // Generate access and refresh tokens
        const token = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' });

        // Save refresh token in the database
        user.refreshToken = refreshToken;
        await user.save();

        // Save user info in session
        req.session.user = {
            id: user.id,
            fullname: user.fullname,
            email: user.email,
            token,
            refreshToken: user.refreshToken
        };

        // Redirect to the dashboard on successful login
        return res.status(200).redirect('/dashboard');

    } catch (errors) {
        console.error(errors);
        // Redirect to '/' with a general error message
        req.flash('error', 'Error logging in');
        return res.status(500).redirect('/');
    }
};


// export const AdminLogin = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         // Validate input
//         if (!email || !password) {
//             return res.status(400).redirect('/', {
//                 errors: [{ errormessage: "All fields are required" }],
//                 email,
//                 password
//             });
//         }

//         const user = await Adminmodel.findOne({ where: { email } });
//         if (!user) {
//             return res.status(401).render('index', {
//                 errors: [{ errormessage: "User not found", status: false }],
//                 email
//             });
//         }

//         const isValid = await bcrypt.compare(password, user.password);
//         if (!isValid) {
//             return res.status(401).render('index', {
//                 errors: [{ errormessage: "Invalid password", status: false }],
//                 password
//             });
//         }

//         const token = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
//         const refreshToken = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' });

//         // Save refresh token in the database
//         user.refreshToken = refreshToken;
//         await user.save();

//         req.session.user = {
//             id: user.id,
//             fullname: user.fullname,
//             email: user.email,
//             token,
//             refreshToken: user.refreshToken
//         };

//         return res.status(200).redirect('/dashboard');

//     } catch (errors) {
//         console.error(errors);
//         return res.status(500).render('index', {
//             errors: [{ errormessage: "Error logging in", status: false, errors: errors.message }]
//         });
//     }
// };

export const AdminDashboard = async (req, res) => {
    const user = req.session.user;

    // Check if the user is authenticated by verifying the token in the session
    if (!user || !user.token) {
        // Set a flash message and redirect to the login page
        req.flash('error', 'Unauthorized access. Please log in again.');
        return res.status(401).redirect('/');
    }

    // Render the admin dashboard if the user is authenticated
    res.render('admindashboard', { user });
};




// user api


export const UserRegister = async (req, res) => {
    try {
        const { fullname, emailid, password, phonenumber, address, role, dob, qualification } = req.body;
        let profileimage = null;

        // Validate input
        if (!fullname || !emailid || !password || !phonenumber || !address || !role || !dob || !qualification) {
            return res.status(400).send({ errormessage: "All fields are required" });
        }

        // Validate email format
        const emailRegex = /^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/;
        if (!emailRegex.test(emailid)) {
            return res.status(400).send({ message: "Email is not valid" });
        }

        // Check for duplicate email
        const isDuplicateEmail = await UserModel.findOne({ where: { emailid } });
        if (isDuplicateEmail) {
            return res.status(400).send({ errormessage: "Email already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // If a profile image is uploaded, store only the file name
        if (req.file) {
            profileimage = path.basename(req.file.path);  // Save only the file name (e.g., 'image-xyz.jpg')
        }

        // Create new user
        const newUser = await UserModel.create({
            profileimage,
            fullname,
            emailid,
            password: hashedPassword,
            phonenumber,
            address,
            role,
            dob,
            qualification
        });

        return res.status(201).send({
            status: true,
            message: "User created successfully",
            user: {
                id: newUser.id,
                fullname: newUser.fullname,
                emailid: newUser.emailid,
                phonenumber: newUser.phonenumber,
                address: newUser.address,
                role: newUser.role,
                dob: newUser.dob,
                qualification: newUser.qualification,
                profileimage: newUser.profileimage  // This will only contain the file name
            }
        });

    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error creating user', err: err.message });
    }
};

export const UserLogin = async (req, res) => {
    try {
        const { emailid, password } = req.body;

        // Validate input
        if (!emailid || !password) {
            return res.status(400).send({
                errors: [{
                    errormessage: "All fields are required",
                    status: false
                }],
                emailid,
                password
            });
        }

        // Find the user by email
        const user = await UserModel.findOne({ where: { emailid } });
        if (!user) {
            return res.status(404).send({
                errors: [{
                    errormessage: "User not found",
                    status: false
                }],
                emailid
            });
        }

        // Check if the password is valid
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).send({
                errors: [{
                    errormessage: "Invalid password",
                    status: false
                }],
                password
            });
        }

        // Generate access and refresh tokens
        const token = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' });

        // Save refresh token in the database
        user.refreshToken = refreshToken;
        await user.save();

        // Store user data in the session
        req.session.user = {
            id: user.id,
            profileimage: user.profileimage,
            fullname: user.fullname,
            emailid: user.emailid,
            phonenumber: user.phonenumber,
            address: user.address,
            role: user.role,
            dob: user.dob,
            qualification: user.qualification,
            refreshToken: user.refreshToken,
            token
        };

        // Send success response
        return res.status(200).send({
            status: true,
            message: "User logged in successfully",
            refreshToken,
            token,
            user: {
                id: user.id,
                profileimage: user.profileimage,
                fullname: user.fullname,
                emailid: user.emailid,
                phonenumber: user.phonenumber,
                address: user.address,
                role: user.role,
                dob: user.dob,
                qualification: user.qualification
            }
        });

    } catch (errors) {
        console.error(errors);
        return res.status(500).send({
            errors: [{
                errormessage: "Error logging in",
                status: false,
                errors: errors.message
            }],
        });
    }
};





