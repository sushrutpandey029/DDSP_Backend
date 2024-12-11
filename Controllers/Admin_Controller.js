import Adminmodel from '../Models/AdminModel.js'
import UserModel from '../Models/UserModel.js'
import farmers from '../Models/FarmerInfoModel.js'
import CultivationCost from '../Models/CultivationCostModel.js'
import ProductionDetails from '../Models/ProductionDetailsModel.js'
import FieldWorkerWorkDetail from '../Models/FOWorkDetailModel.js'
import path from 'path'
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';
import Op from 'sequelize';
import sequelize from 'sequelize';
// import sequelize from '../DB_Connection/MySql_Connect.js'


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
            req.flash('error', 'All fields are required');
            return res.status(400).redirect('/');
        }

        // Check if the user exists
        const user = await Adminmodel.findOne({ where: { email } });
        if (!user) {
            req.flash('error', 'User not found');
            return res.status(401).redirect('/');
        }

        // Check if the password is correct
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            req.flash('error', 'Invalid password');
            return res.status(401).redirect('/');
        }

        // Generate access and refresh tokens (optional)
        const token = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
        const refreshToken = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' });

        // Save refresh token in the database
        user.refreshToken = refreshToken;
        await user.save();

        // Store user info in session
        req.session.user = {
            id: user.id,
            fullname: user.fullname,
            email: user.email,
            token,
            refreshToken: user.refreshToken
        };

        // Redirect to the dashboard
        return res.status(200).redirect('/dashboard');
    } catch (error) {
        console.error(error);
        req.flash('error', 'Error logging in');
        return res.status(500).redirect('/');
    }
};

// Logout API
export const AdminLogout = (req, res) => {
    // Set flash message before destroying the session
    req.flash('success', 'You have been logged out successfully');

    // Destroy the session
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).redirect('/dashboard'); // Redirect to dashboard if logout fails
        }
        // Clear cookies (optional)
        res.clearCookie('session_cookie_name');
        return res.redirect('/'); // Redirect to login page
    });
};

// export const AdminDashboard = async (req, res) => {
//     try {
//         if (req.session.user) {
//             const farmersList = await farmers.findAll();
//             const userList = await UserModel.findAll();

//             const fieldOfficerCount = await UserModel.count({ where: { Role: 'Field Officer' } });
//             const assistantCoordinatorCount = await UserModel.count({ where: { Role: 'Assistant Project Coordinator' } });
//             const projectCoordinatorCount = await UserModel.count({ where: { Role: 'Project Coordinator' } });

//             const farmerCount = farmersList.length;
//             const userCount = userList.length;

//             const { village = "Borjai" } = req.query;
//             let filteredFarmerCount = 0;

//             if (village) {
//                 filteredFarmerCount = await farmers.count({
//                     where: { villageName: village }
//                 });
//             }

//             // Get monthly farmer data
//             const monthlyFarmerData = await getMonthlyFarmerData(village);

//             const villageslist = [
//                 "Aajani",
//                 "Aajanti",
//                 "Aashti",
//                 "Aasola",
//                 "Adani",
//                 "Adani Pod",
//                 "Amala Gav",
//                 "Amala Tanda",
//                 "Amshet",
//                 "Anji",
//                 "Anuppod",
//                 "Arambhi",
//                 "Athmurdi",
//                 "Banayat",
//                 "Bandar",
//                 "Baradgaon",
//                 "Bechkheda",
//                 "Belora",
//                 "Bhamb Raja",
//                 "Bhurkipod",
//                 "Bodgavhan",
//                 "Borgaon",
//                 "Bori Chandra",
//                 "Bori Gosavi",
//                 "Bori Sinha",
//                 "Borjai",
//                 "Bramhanpur",
//                 "Bramhanwada",
//                 "Bramhanwada Purv",
//                 "Bramhanwada Tanda",
//                 "Bramhi",
//                 "Chandapur",
//                 "Chani",
//                 "Chauki",
//                 "Chauki Zuli",
//                 "Chikani",
//                 "Chikhali",
//                 "Chinchala",
//                 "Chinchamandal",
//                 "Chopan",
//                 "Churkuta",
//                 "Dabha",
//                 "Daheli",
//                 "Dahifal",
//                 "Deurwadi",
//                 "Devala",
//                 "Devdharui",
//                 "Dhaipod",
//                 "Dhanaj",
//                 "Dharanpod",
//                 "Domaga",
//                 "Dongargaon",
//                 "Dudhgav",
//                 "Echora",
//                 "Fulwadi",
//                 "Gadegao",
//                 "Gajipur",
//                 "Garpod",
//                 "Gaulpend",
//                 "Gaurala",
//                 "Gavpod",
//                 "Ghubadheti",
//                 "Gondegaon",
//                 "Gondgavhan",
//                 "Gunj",
//                 "Haru",
//                 "Hatgaon",
//                 "Hivara",
//                 "Indrathana",
//                 "Jambhora",
//                 "Jamwadi",
//                 "Jankai",
//                 "Kamathwada",
//                 "Kanada",
//                 "Kanala",
//                 "Kanzara",
//                 "Kapshi",
//                 "Karamala",
//                 "Khairgaon",
//                 "Khairgaon Pod",
//                 "Khairgaon Tanda",
//                 "Khandani",
//                 "Khatara",
//                 "Kinhi Walashi",
//                 "Krushnapur",
//                 "Kumbhari",
//                 "Kumbhipod",
//                 "Ladkhed",
//                 "Lakhmapur",
//                 "Lohatwadi",
//                 "Loni",
//                 "Majara",
//                 "Malkhed Bu.",
//                 "Malkinho",
//                 "Mangla Devi",
//                 "Mangrul",
//                 "Manikwada",
//                 "Manjarda",
//                 "Mardi",
//                 "Maregaon",
//                 "Masola",
//                 "Mendhala",
//                 "Mendhani",
//                 "Morath",
//                 "Morgavhan",
//                 "Mozar",
//                 "Mukindpur",
//                 "Munjhala",
//                 "Murli",
//                 "Nababpur",
//                 "Nagai",
//                 "Nageshvar",
//                 "Nait",
//                 "Naka Pardi",
//                 "Narkund",
//                 "Narsapur",
//                 "Ner",
//                 "Pahapal",
//                 "Palaskund",
//                 "Pandharkawada",
//                 "Pandhurbna",
//                 "Pandhurna Budruk",
//                 "Pandhurna Khurd",
//                 "Pangari",
//                 "Pangari Tanda",
//                 "Paradhi Beda",
//                 "Pardhi Tanda",
//                 "Pathari",
//                 "Pathrad Gole",
//                 "Pendhara",
//                 "Pimpalgaon",
//                 "Pimpari Ijara",
//                 "Pisgaon",
//                 "Prathrad Devi",
//                 "Ramnagar Tanda",
//                 "Rui",
//                 "Sajegaon",
//                 "Salaipod",
//                 "Salod",
//                 "Sarangpur",
//                 "Sarkinhi",
//                 "Satefal",
//                 "Savangi",
//                 "Sawala",
//                 "Sawana",
//                 "Sawanga",
//                 "Sawargaon",
//                 "Sawargaon Kale",
//                 "Saykheda",
//                 "Sevadas Nagar",
//                 "Shakalgaon",
//                 "Shankarpur",
//                 "Shelodi",
//                 "Shindi",
//                 "Shirpurwadi",
//                 "Shivani",
//                 "Shivpod",
//                 "Singaldip",
//                 "Sonegaon",
//                 "Sonupod",
//                 "Sonurli",
//                 "Surdevi",
//                 "Takali",
//                 "Tembhi",
//                 "Thalegaon",
//                 "Tiwasa",
//                 "Uchegaon",
//                 "Udapur",
//                 "Ujona",
//                 "Umari",
//                 "Umartha",
//                 "Vasantnagar",
//                 "Veni",
//                 "Virgavhan",
//                 "Vyahali",
//                 "Wadgaon",
//                 "Wadgaon Gadhave",
//                 "Wadgaon Poste",
//                 "Wai",
//                 "Wakodi",
//                 "Walki",
//                 "Waradh",
//                 "Warjai",
//                 "Warud",
//                 "Watfal",
//                 "Yelguda",
//                 "Zombhadi",
//             ];

//             return res.render('admindashboard', {
//                 user: req.session.user,
//                 farmerCount,
//                 userCount,
//                 fieldOfficerCount,
//                 assistantCoordinatorCount,
//                 projectCoordinatorCount,
//                 filteredFarmerCount,
//                 selectedVillage: village || '',
//                 villageslist,
//                 monthlyFarmerData: JSON.stringify(monthlyFarmerData) // Ensure it's passed as JSON string
//             });
//         } else {
//             req.flash('error', 'Please log in first');
//             return res.redirect('/');
//         }
//     } catch (error) {
//         console.error('Error in AdminDashboard:', error);
//         req.flash('error', 'Internal server error');
//         return res.redirect('/');
//     }
// };

// AdminDashboard Controller
export const AdminDashboard = async (req, res) => {
    try {
        if (req.session.user) {
            // Fetch all farmers and users
            const farmersList = await farmers.findAll();
            const userList = await UserModel.findAll();

            // Count different user roles
            const fieldOfficerCount = await UserModel.count({ where: { Role: 'Field Officer' } });
            const assistantCoordinatorCount = await UserModel.count({ where: { Role: 'Assistant Project Coordinator' } });
            const projectCoordinatorCount = await UserModel.count({ where: { Role: 'Project Coordinator' } });

            // Count total farmers and users
            const farmerCount = farmersList.length;
            const userCount = userList.length;

            // Extract filters from query parameters
            const village = req.query.village || "Borjai"; // Default to "Borjai"
            const year = req.query.year || new Date().getFullYear(); // Default to current year
            let error = null;

            // Filtered farmer count
            const filteredFarmerCount = await farmers.count({
                where: {
                    villageName: village,
                    [sequelize.Op.and]: sequelize.where(
                        sequelize.fn('YEAR', sequelize.col('createdAt')),
                        year
                    ),
                },
            });

            // Monthly farmer data
            const monthlyFarmerData = await getMonthlyFarmerData(village, year);

            // Set error message if no data is found
            if (filteredFarmerCount === 0) {
                error = `No data found for the selected filters: Village - ${village}, Year - ${year}.`;
            }

            // Adjust monthly farmer data to include the month numbers
            const adjustedMonthlyFarmerData = monthlyFarmerData.map((val, index) => ({
                month: index + 1,  // Month number added here
                count: val         // The count for that month
            }));

            // List of villages and years for dropdowns
            const villageslist = [
                "Aajani",
                "Aajanti",
                "Aashti",
                "Aasola",
                "Adani",
                "Adani Pod",
                "Amala Gav",
                "Amala Tanda",
                "Amshet",
                "Anji",
                "Anuppod",
                "Arambhi",
                "Athmurdi",
                "Banayat",
                "Bandar",
                "Baradgaon",
                "Bechkheda",
                "Belora",
                "Bhamb Raja",
                "Bhurkipod",
                "Bodgavhan",
                "Borgaon",
                "Bori Chandra",
                "Bori Gosavi",
                "Bori Sinha",
                "Borjai",
                "Bramhanpur",
                "Bramhanwada",
                "Bramhanwada Purv",
                "Bramhanwada Tanda",
                "Bramhi",
                "Chandapur",
                "Chani",
                "Chauki",
                "Chauki Zuli",
                "Chikani",
                "Chikhali",
                "Chinchala",
                "Chinchamandal",
                "Chopan",
                "Churkuta",
                "Dabha",
                "Daheli",
                "Dahifal",
                "Deurwadi",
                "Devala",
                "Devdharui",
                "Dhaipod",
                "Dhanaj",
                "Dharanpod",
                "Domaga",
                "Dongargaon",
                "Dudhgav",
                "Echora",
                "Fulwadi",
                "Gadegao",
                "Gajipur",
                "Garpod",
                "Gaulpend",
                "Gaurala",
                "Gavpod",
                "Ghubadheti",
                "Gondegaon",
                "Gondgavhan",
                "Gunj",
                "Haru",
                "Hatgaon",
                "Hivara",
                "Indrathana",
                "Jambhora",
                "Jamwadi",
                "Jankai",
                "Kamathwada",
                "Kanada",
                "Kanala",
                "Kanzara",
                "Kapshi",
                "Karamala",
                "Khairgaon",
                "Khairgaon Pod",
                "Khairgaon Tanda",
                "Khandani",
                "Khatara",
                "Kinhi Walashi",
                "Krushnapur",
                "Kumbhari",
                "Kumbhipod",
                "Ladkhed",
                "Lakhmapur",
                "Lohatwadi",
                "Loni",
                "Majara",
                "Malkhed Bu.",
                "Malkinho",
                "Mangla Devi",
                "Mangrul",
                "Manikwada",
                "Manjarda",
                "Mardi",
                "Maregaon",
                "Masola",
                "Mendhala",
                "Mendhani",
                "Morath",
                "Morgavhan",
                "Mozar",
                "Mukindpur",
                "Munjhala",
                "Murli",
                "Nababpur",
                "Nagai",
                "Nageshvar",
                "Nait",
                "Naka Pardi",
                "Narkund",
                "Narsapur",
                "Ner",
                "Pahapal",
                "Palaskund",
                "Pandharkawada",
                "Pandhurbna",
                "Pandhurna Budruk",
                "Pandhurna Khurd",
                "Pangari",
                "Pangari Tanda",
                "Paradhi Beda",
                "Pardhi Tanda",
                "Pathari",
                "Pathrad Gole",
                "Pendhara",
                "Pimpalgaon",
                "Pimpari Ijara",
                "Pisgaon",
                "Prathrad Devi",
                "Ramnagar Tanda",
                "Rui",
                "Sajegaon",
                "Salaipod",
                "Salod",
                "Sarangpur",
                "Sarkinhi",
                "Satefal",
                "Savangi",
                "Sawala",
                "Sawana",
                "Sawanga",
                "Sawargaon",
                "Sawargaon Kale",
                "Saykheda",
                "Sevadas Nagar",
                "Shakalgaon",
                "Shankarpur",
                "Shelodi",
                "Shindi",
                "Shirpurwadi",
                "Shivani",
                "Shivpod",
                "Singaldip",
                "Sonegaon",
                "Sonupod",
                "Sonurli",
                "Surdevi",
                "Takali",
                "Tembhi",
                "Thalegaon",
                "Tiwasa",
                "Uchegaon",
                "Udapur",
                "Ujona",
                "Umari",
                "Umartha",
                "Vasantnagar",
                "Veni",
                "Virgavhan",
                "Vyahali",
                "Wadgaon",
                "Wadgaon Gadhave",
                "Wadgaon Poste",
                "Wai",
                "Wakodi",
                "Walki",
                "Waradh",
                "Warjai",
                "Warud",
                "Watfal",
                "Yelguda",
                "Zombhadi",
            ];

            const yearsList = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i); // Last 10 years

            // Render admin dashboard
            return res.render('admindashboard', {
                user: req.session.user,
                farmerCount,
                userCount,
                fieldOfficerCount,
                assistantCoordinatorCount,
                projectCoordinatorCount,
                filteredFarmerCount,
                selectedVillage: village,
                selectedYear: year,
                villageslist,
                yearsList,
                monthlyFarmerData: JSON.stringify(adjustedMonthlyFarmerData),  // Pass the adjusted data
                roleDistributionData: JSON.stringify({
                    fieldOfficer: fieldOfficerCount,
                    assistantCoordinator: assistantCoordinatorCount,
                    projectCoordinator: projectCoordinatorCount
                }),
                farmersList,
                error,
            });
        } else {
            req.flash('error', 'Please log in first');
            return res.redirect('/');
        }
    } catch (error) {
        console.error('Error in AdminDashboard:', error);
        req.flash('error', 'Internal server error');
        return res.redirect('/');
    }
};

// Function to get monthly farmer data
const getMonthlyFarmerData = async (village, year) => {
    const data = await farmers.findAll({
        attributes: [
            [sequelize.fn('MONTH', sequelize.col('createdAt')), 'month'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        where: {
            villageName: village,
            [sequelize.Op.and]: sequelize.where(
                sequelize.fn('YEAR', sequelize.col('createdAt')),
                year
            ),
        },
        group: ['month'],
        order: ['month'],
    });

    // Initialize data for all months with 0
    const monthlyData = Array(12).fill(0);
    data.forEach((item) => {
        monthlyData[item.dataValues.month - 1] = item.dataValues.count; // Month is 1-indexed
    });

    return monthlyData;
};

export const changepassword = async (req, res) => {
    const { id } = req.params;
    res.render('changepassword');
};

export const UpdatePassword = async (req, res) => {
    try {
        const { id: userId } = req.params;
        const { oldpassword, newpassword, cpassword } = req.body;

        console.log('Request Body:', req.body);
        console.log('User ID:', userId);

        // Validate input
        if (!oldpassword || !newpassword || !cpassword) {
            req.flash('error', 'All fields are required.');
            return res.redirect(`/changepassword/${userId}`);
        }

        if (newpassword !== cpassword) {
            req.flash('error', 'New password and confirm password do not match.');
            return res.redirect(`/changepassword/${userId}`);
        }

        // Fetch user from database
        const user = await Adminmodel.findByPk(userId);
        if (!user) {
            req.flash('error', 'User not found.');
            return res.redirect(`/changepassword/${userId}`);
        }

        // Verify old password
        const isMatch = await bcrypt.compare(oldpassword, user.password);
        if (!isMatch) {
            req.flash('error', 'Old password is incorrect.');
            return res.redirect(`/changepassword/${userId}`);
        }
        const hashedPassword = await bcrypt.hash(newpassword, 10);
        user.password = hashedPassword;
        await user.save();

        req.flash('success', 'Password changed successfully.');
        res.redirect(`/changepassword/${userId}`);
    } catch (error) {
        console.error('Error changing password:', error);
        req.flash('error', 'An error occurred while changing the password.');
        res.redirect(`/changepassword/${userId}`);
    }
};
// user api
export const adduser = async (req, res) => {
    res.render('adduser');

};

export const UserRegister = async (req, res) => {
    try {
        const { fullname, emailid, password, phonenumber, address, role, dob, qualification } = req.body;
        let profileimage = null;

        // Validate input
        if (!fullname || !emailid || !password || !phonenumber || !address || !role || !dob || !qualification) {
            req.flash('error', 'All fields are required');
            return res.status(400).redirect('/adduser');
        }

        // Validate email format
        const emailRegex = /^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/;
        if (!emailRegex.test(emailid)) {
            req.flash('error', 'Email is not valid');
            return res.status(400).redirect('/adduser');
        }

        // Check for duplicate email
        const isDuplicateEmail = await UserModel.findOne({ where: { emailid } });
        if (isDuplicateEmail) {
            req.flash('error', 'Email already exists');
            return res.status(400).redirect('/adduser');
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

        req.flash('success', 'User created successfully');
        return res.redirect('/userlist');

    } catch (err) {
        console.error(err);
        req.flash('error', 'Error creating user');
        return res.status(500).redirect('/adduser');
    }
};

export const userlist = async (req, res) => {
    try {
        const user = await UserModel.findAll();

        if (user.length === 0) {

            return res.render('userlist', { message: 'User not found' });
        }


        res.render('userlist', { users: user });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const farmerlist = async (req, res) => {
    try {
        const farmer = await farmers.findAll();

        if (farmer.length === 0) {

            return res.render('farmerlist', { message: 'farmer not found' });
        }


        res.render('farmerlist', { farmers: farmer });
    } catch (error) {
        console.error("Error fetching farmers:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const DeleteFarmerById = async (req, res) => {
    try {
        const farmerID = req.params.id;


        const deletedUser = await farmers.destroy({
            where: { id: farmerID }
        });

        if (!deletedUser) {

            req.flash('error', 'Farmer not found');
            return res.redirect('/farmerlist');
        }
        req.flash('success', 'Farmer deleted successfully');
        return res.redirect('/farmerlist');
    } catch (error) {
        console.error("Error deleting Farmer:", error);
        req.flash('error', 'Internal server error');
        return res.status(500).redirect('/farmerlist');
    }
};

export const DeleteUserById = async (req, res) => {
    try {
        const userId = req.params.id;


        const deletedUser = await UserModel.destroy({
            where: { id: userId }
        });

        if (!deletedUser) {

            req.flash('error', 'User not found');
            return res.redirect('/userlist');
        }
        req.flash('success', 'User deleted successfully');
        return res.redirect('/userlist');
    } catch (error) {
        console.error("Error deleting user:", error);
        req.flash('error', 'Internal server error');
        return res.status(500).redirect('/userlist');
    }
};

export const DeleteFieldOfficerWorkDetailById = async (req, res) => {
    try {
        const userId = req.params.id;

        const deletedUser = await FieldWorkerWorkDetail.destroy({
            where: { id: userId }
        });

        if (!deletedUser) {

            req.flash('error', 'Work Detail not found');
            return res.redirect('/getAllFieldWorkerWorkDetails');
        }
        req.flash('success', 'Work Detail deleted successfully');
        return res.redirect('/getAllFieldWorkerWorkDetails');
    } catch (error) {
        console.error("Error deleting Work Detail:", error);
        req.flash('error', 'Internal server error');
        return res.status(500).redirect('/getAllFieldWorkerWorkDetails');
    }
};

export const getuserbyid = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await UserModel.findByPk(id);
        if (!user) {
            return res.render('edituser', { message: 'User not found', user: null });
        }
        res.render('edituser', { user });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const AdminupdateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullname, emailid, phonenumber, address, role, dob, qualification } = req.body;

        // Validate input
        if (!fullname || !emailid || !phonenumber || !address || !role || !dob || !qualification) {
            req.flash('error', 'All fields are required');
            return res.status(400).redirect(`/updateuser/${id}`);
        }

        // Validate email format
        const emailRegex = /^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/;
        if (!emailRegex.test(emailid)) {
            req.flash('error', 'Email is not valid');
            return res.status(400).redirect(`/updateuser/${id}`);
        }

        // Check if user exists
        const user = await UserModel.findByPk(id);
        if (!user) {
            req.flash('error', 'User not found');
            return res.status(404).redirect('/userlist');
        }

        // If a profile image is uploaded, replace the existing image
        let profileimage = user.profileimage; // Retain the current profile image
        if (req.file) {
            profileimage = path.basename(req.file.path); // Update with the new image file name
        }

        // Update user details
        user.fullname = fullname;
        user.emailid = emailid;
        user.phonenumber = phonenumber;
        user.address = address;
        user.role = role;
        user.dob = dob;
        user.qualification = qualification;
        user.profileimage = profileimage;

        await user.save();

        req.flash('success', 'User updated successfully');
        return res.redirect('/userlist');

    } catch (err) {
        console.error(err);
        req.flash('error', 'Error updating user');
        return res.status(500).redirect(`/updateuser/${id}`);
    }
};

export const UserLogin = async (req, res) => {
    try {
        const { emailid, password } = req.body;

        // Validate input
        if (!emailid || !password) {
            return res.status(400).json({
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
            return res.status(404).json({
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
            return res.status(401).json({
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
        return res.status(200).json({
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
        return res.status(500).json({
            errors: [{
                errormessage: "Error logging in",
                status: false,
                errors: errors.message
            }],
        });
    }
};

export const details = async (req, res) => {
    res.render('detailofproductionandcultivation')
}

// export const getProductionAndCultivationById = async (req, res) => {
//     try {
//         const { farmerID } = req.params;

//         // Fetch data from the database
//         const rawCultivationCosts = await CultivationCost.findAll({ where: { farmerID } });
//         const rawProductionDetails = await ProductionDetails.findAll({ where: { farmerID } });

//         // Parse nested JSON for cultivation costs
//         const cultivationCosts = rawCultivationCosts.map(cost => ({
//             ...cost.toJSON(),
//             crops: JSON.parse(cost.crops), // Parse crops field as JSON
//         }));

//         // Parse nested JSON for production details
//         const productionDetails = rawProductionDetails.map(detail => {
//             let parsedCropName;
//             try {
//                 parsedCropName = JSON.parse(detail.cropName); // Attempt to parse as JSON
//             } catch {
//                 parsedCropName = detail.cropName; // Fallback to raw string if JSON parse fails
//             }
//             return {
//                 ...detail.toJSON(),
//                 cropName: parsedCropName, // Parsed JSON or raw string
//             };
//         });

//         const responseData = {
//             cultivationCosts,
//             productionDetails,
//         };

//         res.status(200).json({
//             data:responseData
//         })

//         //console.log("Response Data:", JSON.stringify(responseData, null, 2)); // Debugging
//         // Render the Handlebars template with data
//        // res.render('detailofproductionandcultivation', { data: responseData });
//     } catch (error) {
//         console.error("Error fetching farmer details:", error);
//         res.status(500).json({ success: false, message: "Internal server error", error: error.message });
//     }
// };


export const getProductionAndCultivationById = async (req, res) => {
    try {
        const { farmerID } = req.params;

        const rawCultivationCosts = await CultivationCost.findAll({ where: { farmerID } });
        const rawProductionDetails = await ProductionDetails.findAll({ where: { farmerID } });

        const cultivationCosts = rawCultivationCosts.map(cost => ({
            ...cost.toJSON(),
            crops: JSON.parse(cost.crops),
        }));

        const productionDetails = rawProductionDetails.map(detail => {
            let parsedCropName;
            try {
                parsedCropName = JSON.parse(detail.cropName);
            } catch {
                parsedCropName = detail.cropName;
            }
            return {
                ...detail.toJSON(),
                cropName: parsedCropName,
            };
        });

        // Calculate profit/loss for each crop
        const profitLossData = [];

        cultivationCosts.forEach(cultivation => {
            const cropDetails = cultivation.crops;
            const matchingProduction = productionDetails.find(production =>
                production.cropName.name === cropDetails.crop &&
                production.cropName.season === cropDetails.season &&
                production.cropName.irrigationType === cropDetails.category
            );

            if (matchingProduction) {
                const { totalCost: cultivationCost } = cropDetails;
                const { totalCost: productionCost } = matchingProduction.cropName;

                const profitOrLoss = productionCost - cultivationCost;
                const profitOrLossPercentage = ((profitOrLoss / cultivationCost) * 100).toFixed(2);

                profitLossData.push({
                    season: cropDetails.season,
                    irrigationType: cropDetails.category,
                    crop: cropDetails.crop,
                    cultivationCost,
                    productionCost,
                    profitOrLoss,
                    profitOrLossPercentage: `${profitOrLossPercentage}%`,
                });
            }
        });

        const responseData = {
            cultivationCosts,
            productionDetails,
            profitLossData,
        };

        console.log("Response Data:", JSON.stringify(responseData, null, 2)); // Debugging
        // Render the Handlebars template with data
        res.render('detailofproductionandcultivation', { data: responseData });

    } catch (error) {
        console.error("Error fetching farmer details:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};

export const getAllFieldWorkerWorkDetails = async (req, res) => {
    try {
        // Fetch all work details
        const allWorkDetails = await FieldWorkerWorkDetail.findAll();

        if (allWorkDetails.length === 0) {
            return res.render('farmerworkdetails', {
                success: false,
                message: "No work details found.",
                data: []
            });
        }

        // res.status(200).json({
        //     data:allWorkDetails
        // })

        return res.render('farmerworkdetails', {
            success: true,
            message: "All field worker work details fetched successfully.",
            data: allWorkDetails
        });
    } catch (error) {
        console.error("Error fetching all work details:", error);
        return res.status(500).render('error', {
            success: false,
            message: "Error fetching work details.",
            error: error.message
        });
    }
};

export const editFieldWorkerWorkDetailsById = async (req, res) => {
    const { id } = req.params;

    try {
        const workDetails = await FieldWorkerWorkDetail.findOne({ where: { id } });

        if (!workDetails) {
            return res.render('editfiledworkerdtail', {
                success: false,
                message: `No work details found for ID: ${id}`,
                data: []
            });
        }

        // res.status(200).json({
        //     data:workDetails
        // });

        return res.render('editfiledworkerdtail', {
            success: true,
            message: `Work details for ID: ${id} fetched successfully.`,
            data: workDetails
        });
    } catch (error) {
        console.error(`Error fetching work details for ID: ${id}`, error);
        return res.status(500).render('error', {
            success: false,
            message: `Error fetching work details for ID: ${id}.`,
            error: error.message
        });
    }
};




export const getfarmerbyid = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ success: false, message: "Farmer ID is required" });
        }

        const farmer = await farmers.findByPk(id);

        if (!farmer) {
            return res.status(404).render('editfarmer', {
                success: false,
                message: "Farmer not found",
                farmer: null,
            });
        }

        // Parse `cropsSown` JSON field
        const parsedCropsSown = farmer.cropsSown ? JSON.parse(farmer.cropsSown) : {};

        // Dynamic list of districts
        const districts = ["yavatmal", "washim"];

        const taluka = ["Arni", "Darwha", "Digras", "Ghatanji", "Kalamb", "Kelapur", "Mahagaon", "Maregaon", "Ner", "Ralegaon", "Yavatmal"];
        const village = [
            "Aajani",
            "Aajanti",
            "Aashti",
            "Aasola",
            "Adani",
            "Adani Pod",
            "Amala Gav",
            "Amala Tanda",
            "Amshet",
            "Anji",
            "Anuppod",
            "Arambhi",
            "Athmurdi",
            "Banayat",
            "Bandar",
            "Baradgaon",
            "Bechkheda",
            "Belora",
            "Bhamb Raja",
            "Bhurkipod",
            "Bodgavhan",
            "Borgaon",
            "Bori Chandra",
            "Bori Gosavi",
            "Bori Sinha",
            "Borjai",
            "Bramhanpur",
            "Bramhanwada",
            "Bramhanwada Purv",
            "Bramhanwada Tanda",
            "Bramhi",
            "Chandapur",
            "Chani",
            "Chauki",
            "Chauki Zuli",
            "Chikani",
            "Chikhali",
            "Chinchala",
            "Chinchamandal",
            "Chopan",
            "Churkuta",
            "Dabha",
            "Daheli",
            "Dahifal",
            "Deurwadi",
            "Devala",
            "Devdharui",
            "Dhaipod",
            "Dhanaj",
            "Dharanpod",
            "Domaga",
            "Dongargaon",
            "Dudhgav",
            "Echora",
            "Fulwadi",
            "Gadegao",
            "Gajipur",
            "Garpod",
            "Gaulpend",
            "Gaurala",
            "Gavpod",
            "Ghubadheti",
            "Gondegaon",
            "Gondgavhan",
            "Gunj",
            "Haru",
            "Hatgaon",
            "Hivara",
            "Indrathana",
            "Jambhora",
            "Jamwadi",
            "Jankai",
            "Kamathwada",
            "Kanada",
            "Kanala",
            "Kanzara",
            "Kapshi",
            "Karamala",
            "Khairgaon",
            "Khairgaon Pod",
            "Khairgaon Tanda",
            "Khandani",
            "Khatara",
            "Kinhi Walashi",
            "Krushnapur",
            "Kumbhari",
            "Kumbhipod",
            "Ladkhed",
            "Lakhmapur",
            "Lohatwadi",
            "Loni",
            "Majara",
            "Malkhed Bu.",
            "Malkinho",
            "Mangla Devi",
            "Mangrul",
            "Manikwada",
            "Manjarda",
            "Mardi",
            "Maregaon",
            "Masola",
            "Mendhala",
            "Mendhani",
            "Morath",
            "Morgavhan",
            "Mozar",
            "Mukindpur",
            "Munjhala",
            "Murli",
            "Nababpur",
            "Nagai",
            "Nageshvar",
            "Nait",
            "Naka Pardi",
            "Narkund",
            "Narsapur",
            "Ner",
            "Pahapal",
            "Palaskund",
            "Pandharkawada",
            "Pandhurbna",
            "Pandhurna Budruk",
            "Pandhurna Khurd",
            "Pangari",
            "Pangari Tanda",
            "Paradhi Beda",
            "Pardhi Tanda",
            "Pathari",
            "Pathrad Gole",
            "Pendhara",
            "Pimpalgaon",
            "Pimpari Ijara",
            "Pisgaon",
            "Prathrad Devi",
            "Ramnagar Tanda",
            "Rui",
            "Sajegaon",
            "Salaipod",
            "Salod",
            "Sarangpur",
            "Sarkinhi",
            "Satefal",
            "Savangi",
            "Sawala",
            "Sawana",
            "Sawanga",
            "Sawargaon",
            "Sawargaon Kale",
            "Saykheda",
            "Sevadas Nagar",
            "Shakalgaon",
            "Shankarpur",
            "Shelodi",
            "Shindi",
            "Shirpurwadi",
            "Shivani",
            "Shivpod",
            "Singaldip",
            "Sonegaon",
            "Sonupod",
            "Sonurli",
            "Surdevi",
            "Takali",
            "Tembhi",
            "Thalegaon",
            "Tiwasa",
            "Uchegaon",
            "Udapur",
            "Ujona",
            "Umari",
            "Umartha",
            "Vasantnagar",
            "Veni",
            "Virgavhan",
            "Vyahali",
            "Wadgaon",
            "Wadgaon Gadhave",
            "Wadgaon Poste",
            "Wai",
            "Wakodi",
            "Walki",
            "Waradh",
            "Warjai",
            "Warud",
            "Watfal",
            "Yelguda",
            "Zombhadi",
        ];

        const clusterName = [
            "Masola",
            "Bori Chandra",
            "Bramhi",
            "Chaani (ka)",
            "Malkhed Bu.",
            "Pathrad Devi",
            "Arambhi",
            "Murali",
            "Umari",
            "Adani",
            "Veni",
            "Chinchala",
            "Khandani",
            "Mardi",
            "Ner",
            "Pathrad Gole",
            "Tembhi",
            "Palaskund",
            "Bori Sinha",
            "Rui",
        ];

        const typeOfLand = ["Clayey", "Sandy Loam", "Sandy"];

        const conservationMeasureItems = ["Trenching", "Farm Pond", "Bunding"];

        const microIrrigation = ["Drip", "Sprinklers"];

        const sourceIrrigationItems = ["Well", "Canal"];



        // Send parsed data and districts to frontend
        res.render('editfarmer', {
            success: true,
            farmer: { ...farmer.toJSON(), cropsSown: parsedCropsSown },
            districts,
            taluka,
            village,
            clusterName,
            typeOfLand,
            conservationMeasureItems,
            microIrrigation,
            sourceIrrigationItems,

        });
    } catch (error) {
        console.error("Error fetching farmer details:", error);
        res.status(500).render('editfarmer', {
            success: false,
            message: "Internal server error",
            farmer: null,
        });
    }
};

export const AdminUpdateFarmer = async (req, res) => {
    try {
        const id = req.params.id;

        const {
            farmerID,
            newname,
            mobileNumber,
            emailID,
            villagename,
            taluka,
            clusterName,
            district,
            cultivatedLand,
            desiBreeds,
            typeOfLand,
            sourceIrrigationItems,
            conservationMeasureItems,
            microIrrigation,
            ...flattenedCropsSown
        } = req.body;

        console.log("Request body data:", req.body);

        // Transform the flattened `cropsSown` fields into a nested object
        const cropsSown = {};
        Object.keys(flattenedCropsSown).forEach((key) => {
            if (key.startsWith("cropsSown.")) {
                const path = key.replace("cropsSown.", "").split(".");
                let current = cropsSown;

                path.forEach((segment, index) => {
                    if (index === path.length - 1) {
                        // Assign the value at the final segment
                        if (!current[segment]) current[segment] = [];
                        const [crop, cropLand] = flattenedCropsSown[key];
                        current[segment].push({ crop, cropLand });
                    } else {
                        // Ensure the object exists for intermediate segments
                        current[segment] = current[segment] || {};
                        current = current[segment];
                    }
                });
            }
        });

        console.log("Transformed cropsSown data:", cropsSown);

        // Find the farmer record by ID
        const farmer = await farmers.findByPk(id);
        if (!farmer) {
            req.flash('error', 'Farmer not found');
            return res.status(404).redirect('/farmerlist');
        }

        // Update fields
        farmer.farmerID = farmerID;
        farmer.name = newname;
        farmer.mobileNumber = mobileNumber;
        farmer.emailID = emailID;
        farmer.villageName = villagename;
        farmer.taluka = taluka;
        farmer.clusterName = clusterName;
        farmer.district = district;
        farmer.cultivatedLand = cultivatedLand;
        farmer.desiBreeds = desiBreeds;
        farmer.typeOfLand = typeOfLand;
        farmer.sourceIrrigationItems = sourceIrrigationItems;
        farmer.conservationMeasureItems = conservationMeasureItems;
        farmer.microIrrigation = microIrrigation;

        if (Object.keys(cropsSown).length > 0) {
            try {
                farmer.cropsSown = cropsSown;
            } catch (err) {
                console.error('Failed to stringify cropsSown:', err.message);
                req.flash('error', 'Invalid cropsSown format');
                return res.redirect(`/editfarmer/${id}`);
            }
        }

        console.log("Updated farmer data:", farmer);

        await farmer.save();

        req.flash('success', 'Farmer details updated successfully');
        return res.redirect('/farmerlist');
    } catch (error) {
        console.error('Error updating farmer:', error.message);
        req.flash('error', 'An error occurred while updating farmer details');
        return res.redirect(`/editfarmer/${req.params.id}`);
    }
};






// REPORT GENARATE FARMER BY CLUSTER WISE

// export const getFarmersByCluster = async (req, res) => {
//     try {
//         const { clusterName } = req.params;

//         if (!clusterName) {
//             return res.status(400).json({ success: false, message: "Cluster name is required." });
//         }

//         const farmer = await farmers.findAll({
//             where: { clusterName },
//         });

//         if (farmer.length === 0) {
//             return res.render('clusterbyfarmer', {
//                 success: false,
//                 message: `No farmers found in cluster '${clusterName}'.`,
//                 totalFarmers: 0,
//                 data: [],
//             });
//         }

//         const totalFarmers = farmer.length;

//         res.render('clusterbyfarmer', {
//             success: true,
//             message: `Farmers in cluster '${clusterName}' retrieved successfully.`,
//             totalFarmers,
//             data: farmer,
//         });
//     } catch (error) {
//         console.error("Error fetching farmers by cluster:", error);
//         res.status(500).render('error', { message: "Internal server error", error: error.message });
//     }
// };


export const getFarmersByCluster = async (req, res) => {
    try {
        const { clusterName } = req.query; // Retrieve clusterName from query parameters

        if (!clusterName) {
            return res.render('clusterbyfarmer', {
                success: false,
                message: "Please select a cluster name.",
                totalFarmers: 0,
                data: [],
            });
        }

        const farmersData = await farmers.findAll({
            where: { clusterName },
        });

        if (farmersData.length === 0) {
            return res.render('custerbyfarmer', {
                success: false,
                message: `No farmers found in cluster '${clusterName}'.`,
                totalFarmers: 0,
                data: [],
            });
        }

        const totalFarmers = farmersData.length;

        res.render('custerbyfarmer', {
            success: true,
            message: `Farmers in cluster '${clusterName}' retrieved successfully.`,
            totalFarmers,
            data: farmersData,
        });
    } catch (error) {
        console.error("Error fetching farmers by cluster:", error);
        res.status(500).render('error', { message: "Internal server error", error: error.message });
    }
};





















