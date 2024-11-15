import { DataTypes } from 'sequelize';
import sequelize from "../DB_Connection/MySql_Connect.js"; // Update with your database configuration

const FarmerInfo = sequelize.define('FarmerInformations', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  farmerID: {
    type: DataTypes.CHAR(36),
    unique: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  mobileNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  emailID: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true, // Ensures unique email addresses
    validate: {
      isEmail: true, // Ensures valid email format
      notEmpty: true // Ensures the field is not empty
    },
  },
  villageName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  taluka: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  clusterName: {  // Moved under taluka
    type: DataTypes.STRING,  // Optional: Add the new "clusterName" field if you need to store it
  },
  district: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cultivatedLand: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  typeOfLand: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  cropsSown: {
    type: DataTypes.JSON, // Ensure this is correct for your data
  },
  desiBreeds: {
    type: DataTypes.INTEGER,  // Ensure this matches your input type
  },
  irrigationSource: {
    type: DataTypes.STRING,
  },
  soilConservationMeasures: {
    type: DataTypes.STRING,
  },
  microIrrigation: {
    type: DataTypes.STRING,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW, // Automatically set the timestamp
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW, // Automatically set the timestamp
  },
});

export default FarmerInfo;
