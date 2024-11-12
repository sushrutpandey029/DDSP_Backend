import UserModel from '../Models/UserModel.js'
import Farmer from '../Models/FarmerInfoModel.js'
import CultivationCostModel from '../Models/CultivationCostModel.js'

import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';


// export const ProjectCoordinatorLogin = async (req, res) => {
//     try {
//         const { emailid, password } = req.body;

//         // Validate input
//         if (!emailid || !password) {
//             return res.status(400).send({
//                 errors: [{
//                     errormessage: "All fields are required",
//                     status: false
//                 }],
//                 emailid,
//                 password
//             });
//         }

//         // Find the user by email
//         const user = await UserModel.findOne({ where: { emailid } });
//         if (!user) {
//             return res.status(404).send({
//                 errors: [{
//                     errormessage: "User not found",
//                     status: false
//                 }],
//                 emailid
//             });
//         }

//         // Check if the password is valid
//         const isValid = await bcrypt.compare(password, user.password);
//         if (!isValid) {
//             return res.status(401).send({
//                 errors: [{
//                     errormessage: "Invalid password",
//                     status: false
//                 }],
//                 password
//             });
//         }

//         // Generate access and refresh tokens
//         const token = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
//         const refreshToken = jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '7d' });

//         // Save refresh token in the database
//         user.refreshToken = refreshToken;
//         await user.save();

//         // Store user data in the session
//         req.session.user = {
//             id: user.id,
//             profileimage: user.profileimage,
//             fullname: user.fullname,
//             emailid: user.emailid,
//             phonenumber: user.phonenumber,
//             address: user.address,
//             role: user.role,
//             dob: user.dob,
//             qualification: user.qualification,
//             refreshToken: user.refreshToken,
//             token
//         };

//         // Send success response
//         return res.status(200).send({
//             status: true,
//             message: "User logged in successfully",
//             refreshToken,
//             token,
//             user: {
//                 id: user.id,
//                 profileimage: user.profileimage,
//                 fullname: user.fullname,
//                 emailid: user.emailid,
//                 phonenumber: user.phonenumber,
//                 address: user.address,
//                 role: user.role,
//                 dob: user.dob,
//                 qualification: user.qualification
//             }
//         });

//     } catch (errors) {
//         console.error(errors);
//         return res.status(500).send({
//             errors: [{
//                 errormessage: "Error logging in",
//                 status: false,
//                 errors: errors.message
//             }],
//         });
//     }
// };


// Example Data Route (Protected)
export const data = async (req, res) => {

    res.status(200).send({
        message: "Hello, you have accessed protected data!",
        user: req.user 
    });
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params; // Assuming user ID is passed as a URL parameter
        const { fullname, emailid, password, phonenumber, address, role, dob, qualification } = req.body;
        const profileimage = req.file ? req.file.path : null;

        // Find the user by ID
        const user = await UserModel.findByPk(id);
        if (!user) {
            return res.status(404).send({ errormessage: "User not found" });
        }

        // Update fields only if new values are provided
        if (fullname) user.fullname = fullname;
        if (emailid) {
            // Validate email format
            const emailRegex = /^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/;
            if (!emailRegex.test(emailid)) {
                return res.status(400).send({ message: "Email is not valid" });
            }
            // Check for duplicate email
            const isDuplicateEmail = await UserModel.findOne({ where: { emailid, id: { [Op.ne]: id } } });
            if (isDuplicateEmail) {
                return res.status(400).send({ errormessage: "Email already exists" });
            }
            user.emailid = emailid;
        }
        if (phonenumber) user.phonenumber = phonenumber;
        if (address) user.address = address;
        if (role) user.role = role;
        if (dob) user.dob = dob;
        if (qualification) user.qualification = qualification;
        if (profileimage) user.profileimage = profileimage;

        // Hash and update the password if a new password is provided
        if (password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }

        // Save the updated user data
        await user.save();

        return res.status(200).send({
            status: true,
            message: "User updated successfully",
            user: {
                id: user.id,
                fullname: user.fullname,
                emailid: user.emailid,
                phonenumber: user.phonenumber,
                address: user.address,
                role: user.role,
                dob: user.dob,
                qualification: user.qualification,
                profileimage: user.profileimage
            }
        });
    } catch (err) {
        console.error(err);
        return res.status(500).send({ message: 'Error updating user', err: err.message });
    }
};

//  forms insert by users

// form 1 

// Function to generate a unique farmerID
const generateFarmerID = async () => {
    // Implement your logic here to generate a unique ID.
    // You could use UUID, increment the last ID in the database, etc.
    // For example, here we'll use a simple timestamp-based approach.
    return `FARMER-${Date.now()}`;
};

// API to add farmer information
export const addFarmerInfo = async (req, res) => {
    try {
        const {
            name, mobileNumber, emailID, villageName, taluka, district,
            cultivatedLand, typeOfLand, cropsSown, desiBreeds, irrigationSource,
            soilConservationMeasures, microIrrigation
        } = req.body;

        // Valid dropdown options for fields
        const talukaOptions = ['Taluka1', 'Taluka2', 'Taluka3'];
        const districtOptions = ['Yavatmal', 'Washim'];
        const typeOfLandOptions = ['clayey', 'sandy loam', 'sandy'];
        const irrigationSourceOptions = ['Well', 'Canal'];
        const microIrrigationOptions = ['Drip', 'Sprinklers'];

        // Validate dropdown fields
        if (!talukaOptions.includes(taluka) || !districtOptions.includes(district) || 
            !typeOfLandOptions.includes(typeOfLand) || !irrigationSourceOptions.includes(irrigationSource) || 
            !microIrrigationOptions.includes(microIrrigation)) {
            return res.status(400).send({ message: 'Invalid selection in dropdown options' });
        }

        // Generate a unique farmerID
        const farmerID = await generateFarmerID();

        // Create the farmer record with the generated farmerID
        const farmer = await Farmer.create({
            farmerID, // Add the generated farmerID
            name, mobileNumber, emailID, villageName, taluka, district,
            cultivatedLand, typeOfLand, cropsSown, desiBreeds, irrigationSource,
            soilConservationMeasures, microIrrigation
        });

        return res.status(201).send({
            message: 'Farmer information added successfully',
            farmer
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send({ message: 'Error adding farmer information' });
    }
};



// Function to add cultivation cost details for each crop
export const addCultivationCostDetails = async (req, res) => {
    try {
        const { farmerID, crops } = req.body;

        // Validate farmerID and crops data
        if (!farmerID || !Array.isArray(crops) || crops.length === 0) {
            return res.status(400).send({ message: 'Farmer ID and crops data are required' });
        }

        // Check if the farmer exists
        const farmer = await Farmer.findByPk(farmerID);
        if (!farmer) {
            return res.status(404).send({ message: 'Farmer not found' });
        }

        const cultivationCosts = [];
        for (const crop of crops) {
            const { cropName, seedCost = 0, landPreparationCost = 0, fertilizerCost = 0,
                pesticideCost = 0, harvestingCost = 0, laborCost = 0, miscCost = 0 } = crop;

            // Calculate the total cost
            const totalCost = seedCost + landPreparationCost + fertilizerCost + pesticideCost
                + harvestingCost + laborCost + miscCost;

            // Create cultivation cost record for each crop
            const cultivationCost = await CultivationCostModel.create({
                farmerID,
                cropName,
                seedCost,
                landPreparationCost,
                fertilizerCost,
                pesticideCost,
                harvestingCost,
                laborCost,
                miscCost,
                totalCost,
            });

            cultivationCosts.push(cultivationCost);
        }

        return res.status(201).send({
            message: 'Cultivation cost details added successfully',
            cultivationCosts,
        });
    } catch (error) {
        console.error('Error details:', error);
        return res.status(500).send({ message: 'Error adding cultivation cost details', error: error.message });
    }
};






