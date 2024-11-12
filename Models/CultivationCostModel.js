import { DataTypes } from 'sequelize';
import sequelize from "../DB_Connection/MySql_Connect.js";
import Farmer from "./FarmerInfoModel.js"; // Ensure this path is correct

const CultivationCost = sequelize.define('CultivationCost', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    farmerID: {
        type: DataTypes.STRING,  // Match the FarmerInfos table type for farmerID
        allowNull: false,
        references: {
            model: Farmer, // Reference to the Farmer model
            key: 'farmerID',
        },
    },
    cropName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    seedCost: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0,
    },
    landPreparationCost: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0,
    },
    fertilizerCost: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0,
    },
    pesticideCost: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0,
    },
    harvestingCost: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0,
    },
    laborCost: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0,
    },
    miscCost: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0,
    },
    totalCost: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0,
    },
}, {
    tableName: 'CultivationCosts', // Explicit table name
    timestamps: true,
});

// Association to Farmer model
CultivationCost.belongsTo(Farmer, { foreignKey: 'farmerID', targetKey: 'farmerID' });

export default CultivationCost;
