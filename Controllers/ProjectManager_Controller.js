import UserModel from '../Models/UserModel.js'
import Farmer from '../Models/FarmerInfoModel.js'
import CultivationCost from '../Models/CultivationCostModel.js'

import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';

export const data = async (req, res) => {

    res.status(200).send({
        message: "Hello, you have accessed protected data!",
        user: req.user
    });
};

export const updateUser = async (req, res) => {
    try {
        const { id } = req.params; // Assuming user ID is passed as a URL parameter
        const { fullname, emailid, phonenumber, address, dob, qualification } = req.body;
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
            const isDuplicateEmail = await UserModel.findOne({ where: { emailid } });
            if (isDuplicateEmail) {
                return res.status(400).send({ errormessage: "Email already exists" });
            }
            user.emailid = emailid;
        }
        if (phonenumber) user.phonenumber = phonenumber;
        if (address) user.address = address;
        if (dob) user.dob = dob;
        if (qualification) user.qualification = qualification;
        if (profileimage) user.profileimage = profileimage;

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

const generateFarmerID = () => {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = String(now.getFullYear()).slice(2); // Last 2 digits of the year
    const time = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;

    return `frm_${day}${month}${year}_${time}`;
};

// export const addFarmerInfo = async (req, res) => {
//     try {
//         const {
//             name, mobileNumber, emailID, villageName, taluka, district,
//             cultivatedLand, typeOfLand, cropsSown, desiBreeds, irrigationSource,
//             soilConservationMeasures, microIrrigation
//         } = req.body;

//         // Generate a unique farmerID
//         const farmerID = await generateFarmerID();  // Implement this function

//         // Create the farmer record with the generated farmerID
//         const farmer = await Farmer.create({
//             farmerID,  // Don't include id, it's auto-generated
//             name,
//             mobileNumber,
//             emailID,
//             villageName,
//             taluka,
//             district,
//             cultivatedLand,
//             typeOfLand,
//             cropsSown,
//             desiBreeds,
//             irrigationSource,
//             soilConservationMeasures,
//             microIrrigation
//         });

//         return res.status(201).send({
//             message: 'Farmer information added successfully',
//             farmer
//         });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).send({ message: 'Error adding farmer information' });
//     }
// };




// Function to add cultivation cost details for each crop
// export const addCultivationCostDetails = async (req, res) => {
//     try {
//         const { farmerID, crops } = req.body;

//         // Validate farmerID and crops data
//         if (!farmerID || !Array.isArray(crops) || crops.length === 0) {
//             return res.status(400).send({ message: 'Farmer ID and crops data are required' });
//         }

//         // Check if the farmer exists
//         const farmer = await Farmer.findByPk(farmerID);
//         if (!farmer) {
//             return res.status(404).send({ message: 'Farmer not found' });
//         }

//         const cultivationCosts = [];
//         for (const crop of crops) {
//             const { cropName, seedCost = 0, landPreparationCost = 0, fertilizerCost = 0,
//                 pesticideCost = 0, harvestingCost = 0, laborCost = 0, miscCost = 0 } = crop;

//             // Calculate the total cost
//             const totalCost = seedCost + landPreparationCost + fertilizerCost + pesticideCost
//                 + harvestingCost + laborCost + miscCost;

//             // Create cultivation cost record for each crop
//             const cultivationCost = await CultivationCostModel.create({
//                 farmerID,
//                 cropName,
//                 seedCost,
//                 landPreparationCost,
//                 fertilizerCost,
//                 pesticideCost,
//                 harvestingCost,
//                 laborCost,
//                 miscCost,
//                 totalCost,
//             });

//             cultivationCosts.push(cultivationCost);
//         }

//         return res.status(201).send({
//             message: 'Cultivation cost details added successfully',
//             cultivationCosts,
//         });
//     } catch (error) {
//         console.error('Error details:', error);
//         return res.status(500).send({ message: 'Error adding cultivation cost details', error: error.message });
//     }
// };

// export const addFarmerInfo = async (req, res) => {
//     try {
//       const {
//         name, mobileNumber, emailID, villageName, taluka, district,
//         cultivatedLand, typeOfLand, cropsSown, desiBreeds, irrigationSource,
//         soilConservationMeasures, microIrrigation
//       } = req.body;

//       // Generate a unique farmerID
//       const farmerID = await generateFarmerID();

//       // Generate the Cluster Name by combining villageName and taluka
//       const clusterName = `${villageName}_${taluka}`;

//       // Create the farmer record with the generated farmerID and clusterName
//       const farmer = await Farmer.create({
//         farmerID,
//         name,
//         mobileNumber,
//         emailID,
//         villageName,
//         taluka,
//         clusterName,
//         district,
//         cultivatedLand,
//         typeOfLand,
//         cropsSown,
//         desiBreeds,
//         irrigationSource,
//         soilConservationMeasures,
//         microIrrigation,  
//       });

//       return res.status(201).send({
//         message: 'Farmer information added successfully',
//         farmer
//       });
//     } catch (error) {
//       console.error(error);
//       return res.status(500).send({ message: 'Error adding farmer information' });
//     }
//   };

export const addFarmerInfo = async (req, res) => {
    try {
        const {
            name, mobileNumber, emailID, villageName, taluka, district,
            cultivatedLand, typeOfLand, cropsSown, desiBreeds, irrigationSource,
            soilConservationMeasures, microIrrigation
        } = req.body;

        // Generate a unique farmerID
        const farmerID = await generateFarmerID();

        // Generate the Cluster Name by combining villageName and taluka
        const clusterName = `${villageName}_${taluka}`;

        // Create the farmer record with the generated farmerID and clusterName
        const farmer = await Farmer.create({
            farmerID,
            name,
            mobileNumber,
            emailID,  // This now matches the updated model field 'emailID'
            villageName,
            taluka,
            clusterName,  // Place clusterName under taluka
            district,
            cultivatedLand,
            typeOfLand,
            cropsSown,
            desiBreeds,
            irrigationSource,
            soilConservationMeasures,
            microIrrigation,
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

// Example API endpoint for getting all farmers
export const getFarmers = async (req, res) => {
    try {
        const farmers = await Farmer.findAll(); // Fetch all farmers from the Farmer table
        res.status(200).json({ success: true, farmers });
    } catch (error) {
        console.error("Error fetching farmers:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const addCultivationCostDetails1 = async (req, res) => {
    try {
        const farmer = await Farmer.findByPk(req.params.id);
        if (farmer) {
            const { farmerID, cropsSown } = farmer;
            res.status(200).json({
                farmerID,
                crops: cropsSown // I assume cropsSown is an object, so we'll extract it here
            });
        } else {
            res.status(404).json({ error: 'Farmer not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// export const addCultivationCostDetails = async (req, res) => {
//     try {
//         // Log the incoming request body to ensure we're receiving data
//         console.log('Request body:', req.body);

//         // Get the farmer using the ID from the request parameters
//         const farmer = await Farmer.findByPk(req.params.id);

//         // If farmer exists, proceed to insert data
//         if (farmer) {
//             const { farmerID, cropsSown } = farmer;

//             // Log farmer details
//             console.log('Farmer found:', farmer);

//             // Extracting the crops and their cost details from the request body
//             const { crops } = req.body; // Expecting crops to be in the request body

//             if (!crops || Object.keys(crops).length === 0) {
//                 return res.status(400).json({ error: 'No crops data provided' });
//             }

//             // Loop through each season and crop, calculating the cost
//             for (const season in crops) {
//                 for (const cropName in crops[season]) {
//                     const costs = crops[season][cropName];

//                     // Log the crop and costs for debugging
//                     console.log(`Processing crop: ${cropName} in season: ${season}`, costs);

//                     // Calculate total cost for the crop
//                     const totalCost = (
//                         (costs.seedCost || 0) +
//                         (costs.landCost || 0) +
//                         (costs.fertilizerCost || 0) +
//                         (costs.pesticideCost || 0) +
//                         (costs.harvestCost || 0) +
//                         (costs.laborCost || 0)
//                     );

//                     // Log total cost for debugging
//                     console.log(`Total cost for ${cropName}: ${totalCost}`);

//                     // Insert each crop and its costs into the CultivationCost table
//                     await CultivationCost.create({
//                         farmerID,  // the ID of the farmer
//                         cropName,  // the name of the crop
//                         season,    // the season for the crop (e.g., rabi, kharif)
//                         seedCost: costs.seedCost || 0,
//                         landPreparationCost: costs.landCost || 0,
//                         fertilizerCost: costs.fertilizerCost || 0,
//                         pesticideCost: costs.pesticideCost || 0,
//                         harvestingCost: costs.harvestCost || 0,
//                         laborCost: costs.laborCost || 0,
//                         miscCost: costs.miscCost || 0,
//                         totalCost,  // total calculated cost
//                     });
//                 }
//             }

//             // Respond with a success message after inserting the data
//             res.status(201).json({
//                 success: true,
//                 message: 'Cultivation costs added successfully',
//             });

//         } else {
//             // Farmer not found, return a 404 error
//             res.status(404).json({ error: 'Farmer not found' });
//         }
//     } catch (error) {
//         // Catch any errors that happen during the process and return a 500 error
//         console.error('Error inserting cultivation costs:', error);
//         res.status(500).json({ error: error.message });
//     }
// };

export const addCultivationCostDetails = async (req, res) => {
    try {
        // Log the incoming request body to ensure we're receiving data
        console.log('Request body:', req.body);

        // Get the farmer using the ID from the request parameters
        const farmer = await Farmer.findByPk(req.params.id);

        if (farmer) {
            const { farmerID } = farmer;

            // Extract the crops data from the request body
            const { crops } = req.body;

            if (!crops || Object.keys(crops).length === 0) {
                return res.status(400).json({ error: 'No crops data provided' });
            }

            // Loop through each season and crop, calculating the cost
            for (const season in crops) {
                for (const cropType in crops[season]) {
                    // Process each crop and its costs
                    const cropList = crops[season][cropType];

                    for (const crop of cropList) {
                        const { cropName, costs } = crop;

                        // Calculate total cost for the crop
                        const totalCost = (
                            (costs.seedCost || 0) +
                            (costs.landCost || 0) +
                            (costs.fertilizerCost || 0) +
                            (costs.pesticideCost || 0) +
                            (costs.harvestCost || 0) +
                            (costs.laborCost || 0)
                        );

                        // Log the crop and costs for debugging
                        console.log(`Processing crop: ${cropName} in season: ${season} with total cost: ${totalCost}`);

                        // Insert each crop and its costs into the CultivationCost table
                        await CultivationCost.create({
                            farmerID,              // the ID of the farmer
                            cropName,              // the name of the crop
                            season,                // the season for the crop (e.g., rabi, kharif)
                            crops: JSON.stringify(crop),  // Convert the crop data to JSON if necessary
                            seedCost: costs.seedCost || 0,
                            landPreparationCost: costs.landCost || 0,
                            fertilizerCost: costs.fertilizerCost || 0,
                            pesticideCost: costs.pesticideCost || 0,
                            harvestingCost: costs.harvestCost || 0,
                            laborCost: costs.laborCost || 0,
                            miscCost: costs.miscCost || 0,
                            totalCost,             // total calculated cost
                        });
                    }
                }
            }

            // Respond with a success message after inserting the data
            res.status(201).json({
                success: true,
                message: 'Cultivation costs added successfully',
            });

        } else {
            // Farmer not found, return a 404 error
            res.status(404).json({ error: 'Farmer not found' });
        }
    } catch (error) {
        // Catch any errors that happen during the process and return a 500 error
        console.error('Error inserting cultivation costs:', error);
        res.status(500).json({ error: error.message });
    }
};
