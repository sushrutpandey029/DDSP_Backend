import { DataTypes } from 'sequelize';
import sequelize from "../DB_Connection/MySql_Connect.js"; // Update with your database configuration

const FarmerInfo = sequelize.define('FarmerInfo', {
    farmerID: {
      type: DataTypes.CHAR(36),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    mobileNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    // Define other fields similarly
    cropsSown: {
      type: DataTypes.JSON,  // Note: Using JSON instead of JSONB
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });
    
export default FarmerInfo;
