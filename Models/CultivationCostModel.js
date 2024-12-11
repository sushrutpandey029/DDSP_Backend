import { DataTypes } from 'sequelize';
import sequelize from "../DB_Connection/MySql_Connect.js"; 

const CultivationCost = sequelize.define('CultivationCosts', {
    farmerID: {
        type: DataTypes.STRING, // Matching the farmerID type from FarmerInfo
        allowNull: false,
    },
    cropName: {
        type: DataTypes.JSON, // Use JSON for MySQL
        allowNull: false,
        defaultValue: {}, // Default to an empty object
    },
    totalCost: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.0,
    },
}, {
    tableName: 'CultivationCosts', // Table name for the model
    timestamps: true, // Automatically handle createdAt and updatedAt fields
});

export default CultivationCost;
