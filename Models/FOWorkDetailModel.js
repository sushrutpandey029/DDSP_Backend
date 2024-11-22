import { DataTypes } from 'sequelize';
import sequelize from "../DB_Connection/MySql_Connect.js"; 

export const WorkDetail = sequelize.define('FOWorkDetail', {
    workDetailID: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    fieldWorkerID: {
        type: DataTypes.STRING,
        references: {
            model: 'FieldWorkers',
            key: 'fieldWorkerID',
        },
    },
    date: DataTypes.DATEONLY,
    villagesVisited: DataTypes.TEXT,
    travelInKms: DataTypes.INTEGER,
    newFarmersContacted: DataTypes.INTEGER,
    groupMeetingsConducted: DataTypes.INTEGER,
    newFarmersInGroupMeetings: DataTypes.INTEGER,
    trainingProgrammePlace: DataTypes.STRING,
    farmersInTrainingProgramme: DataTypes.INTEGER,
    inputsSupplied: DataTypes.JSON,
    telephoneConsultancyFarmers: DataTypes.INTEGER,
});
