import UserModel from '../Models/UserModel.js'
import Farmer from '../Models/FarmerInfoModel.js'
import CultivationCost from '../Models/CultivationCostModel.js'
import ProductionDetails from '../Models/ProductionDetailsModel.js'
import workedetails from '../Models/PrpjectCoordinatorWorkDetailModel.js'
import FieldWorkerWorkDetail from '../Models/FOWorkDetailModel.js'

import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';

export const data = async (req, res) => {

    res.status(200).json({
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
            return res.status(404).json({ errormessage: "User not found" });
        }

        // Update fields only if new values are provided
        if (fullname) user.fullname = fullname;
        if (emailid) {
            // Validate email format
            const emailRegex = /^\w+([\.-]?\w+)@\w+([\. -]?\w+)(\.\w{2,3})+$/;
            if (!emailRegex.test(emailid)) {
                return res.status(400).json({ message: "Email is not valid" });
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

        return res.status(200).json({
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
        return res.status(500).json({ message: 'Error updating user', err: err.message });
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

        return res.status(201).json({
            message: 'Farmer information added successfully',
            farmer
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error adding farmer information' });
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

// for get data
export const getCultivationCostDetails = async (req, res) => {
    try {
        const farmers = await CultivationCost.findAll(); // Fetch all farmers from the Farmer table
        res.status(200).json({ success: true, farmers });
    } catch (error) {
        console.error("Error fetching farmers:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};


// for submit data
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
                            (costs.laborCost || 0) +
                            (costs.miscCost || 0)
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


// get data Details of production 
export const getProductionDetails = async (req, res) => {
    try {
        const farmer = await Farmer.findByPk(req.params.id);

        if (farmer) {
            const { farmerID, cropsSown } = farmer;

            // Prepare the data with the desired format
            const formattedCrops = [];

            // Iterate over the seasons (rabi, kharif)
            Object.keys(cropsSown).forEach((season) => {
                // Iterate over the irrigation types within each season
                Object.keys(cropsSown[season]).forEach((irrigationType) => {
                    if (cropsSown[season][irrigationType].length > 0) {
                        // Push the formatted crop data for each irrigation type
                        formattedCrops.push({
                            cropName: {
                                season: season,
                                irrigationType: irrigationType,
                                crops: cropsSown[season][irrigationType].map((crop) => ({
                                    name: crop,
                                }))
                            }
                        });
                    }
                });
            });

            // Store the formatted crops data in session
            req.session.cropsData = formattedCrops;

            // json response
            return res.status(200).json({
                farmerID,
                crops: formattedCrops, // json the modified crops data
            });
        } else {
            res.status(404).json({ error: 'Farmer not found' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// save Details of production 
export const addProductionDetails = async (req, res) => {
    try {
        const { cropName } = req.body;

        if (!Array.isArray(cropName)) {
            return res.status(400).json({
                message: 'cropName should be an array of objects, each containing season, irrigationType, and crops.',
            });
        }

        const farmer = await Farmer.findByPk(req.params.id);

        if (!farmer) {
            return res.status(404).json({ message: 'Farmer not found' });
        }

        const { farmerID } = farmer;

        const insertedRows = [];

        // Process each season entry
        for (const entry of cropName) {
            const { season, irrigationType, crops } = entry;

            if (!season || !irrigationType || !Array.isArray(crops)) {
                return res.status(400).json({
                    message: 'Each entry must include season, irrigationType, and an array of crops.',
                });
            }

            for (const crop of crops) {
                const { name, totalYield, totalSaleValue, surplus } = crop;

                if (!name || !totalYield || !totalSaleValue || !surplus) {
                    return res.status(400).json({
                        message: 'Each crop must include name, totalYield, totalSaleValue, and surplus.',
                    });
                }

                const saleValuePerQuintal = totalSaleValue / totalYield;

                // Combine crop details with metadata
                const cropData = {
                    name,
                    season,
                    irrigationType,
                    totalYield,
                    totalSaleValue,
                    surplus,
                    saleValuePerQuintal,
                };

                // Save the row directly as JSON
                const productionDetail = await ProductionDetails.create({
                    farmerID,
                    cropName: cropData, // No JSON.stringify here; save as plain JSON
                });

                insertedRows.push(productionDetail);
            }
        }

        return res.status(201).json({
            message: 'Production details added successfully',
            data: insertedRows,
        });
    } catch (err) {
        console.error('Error saving production details:', err);
        return res.status(500).json({ message: 'Error saving production details', error: err.message });
    }
};


// workdetail form add

export const addCoordinatorWorkDetails = async (req, res) => {
    try {
        const { trainingProgrammes, reviewMeetings, monitoringVisits, reports } = req.body;
        const { id } = req.params; // Assume userID is passed as a parameter

        // Validate request parameters
        if (!id) {
            return res.status(400).json({ message: 'User ID is required.' });
        }

        // Fetch the coordinator ID from the User model
        const user = await UserModel.findByPk(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const coordinatorID = user.id;

        if (!coordinatorID) {
            return res.status(400).json({ message: 'Coordinator ID is missing for the user.' });
        }

        // Create a new work detail entry
        const newWorkDetail = await workedetails.create({
            workDetailID: `wd_${Date.now()}`, // Generate a unique ID for work details
            coordinatorID, // Use the coordinatorID fetched from the User model
            trainingProgrammes: trainingProgrammes || [],
            reviewMeetings: reviewMeetings || [],
            monitoringVisits: monitoringVisits || [],
            reports: reports || [],
        });

        res.status(201).json({
            message: 'Coordinator work details added successfully',
            data: newWorkDetail,
        });
    } catch (err) {
        console.error('Error adding coordinator work details:', err);
        res.status(500).json({ message: 'Error adding coordinator work details', error: err.message });
    }
};


export const getFarmerById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ success: false, message: "Farmer ID is required" });
        }
        const farmer = await Farmer.findByPk(id);
        if (!farmer) {
            return res.status(404).json({ success: false, message: "Farmer not found" });
        }
        const responseData = {
            cultivatedLand: farmer.cultivatedLand,
            clusterName: farmer.clusterName,
        };


        res.status(200).json({ success: true, data: responseData });
    } catch (error) {
        console.error("Error fetching farmer:", error);
        res.status(500).json({ success: false, message: "Internal server error", error: error.message });
    }
};





export const UserLogout = (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).json({ success: false, message: 'Error logging out' });
            }
            res.clearCookie('session_cookie_name');
            return res.status(200).json({ success: true, message: 'User logged out successfully' });
        });
    } catch (error) {
        console.error('Unexpected error during logout:', error);
        res.status(500).json({ success: false, message: 'Internal server error', error: error.message });
    }
};


export const addFieldWorkerWorkDetail = async (req, res) => {
    try {
        const {
            userid, name, address, qualifications, mobileNumber, emailID, ownLandCultivatedUnderNaturalFarming, clusterID,
            workDate, villagesVisited, travelInKms, farmersContactedIndividually, groupMeetingsConducted, farmersContactedInGroupMeetings,
            clusterTrainingPlace, farmersAttendedTraining, inputSupplied, consultancyTelephone, consultancyWhatsApp
        } = req.body;

        // Validate required fields
        if (!userid || !name || !address || !mobileNumber || !emailID || !clusterID || !workDate) {
            return res.status(400).json({
                success: false,
                message: 'Please fill in all required fields.'
            });
        }

        // Calculate the total number of farmers contacted
        const totalConsultancy = (consultancyTelephone || 0) + (consultancyWhatsApp || 0);

        // Create the work detail entry
        const newWorkDetail = await FieldWorkerWorkDetail.create({
            userid,
            name,
            address,
            qualifications,
            mobileNumber,
            emailID,
            ownLandCultivatedUnderNaturalFarming,
            clusterID,
            workDate,
            villagesVisited,
            travelInKms,
            farmersContactedIndividually,
            groupMeetingsConducted,
            farmersContactedInGroupMeetings,
            clusterTrainingPlace,
            farmersAttendedTraining,
            inputSupplied,
            consultancyTelephone, 
            consultancyWhatsApp,  
            totalConsultancy  
        });

        return res.status(201).json({
            success: true,
            message: 'Work details added successfully!',
            data: newWorkDetail
        });
    } catch (error) {
        console.error("Error adding field worker work details:", error);
        return res.status(500).json({
            success: false,
            message: 'Error adding work details.',
            error: error.message
        });
    }
};

















