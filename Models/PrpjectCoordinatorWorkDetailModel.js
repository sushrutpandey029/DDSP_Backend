import { DataTypes } from 'sequelize';
import sequelize from "../DB_Connection/MySql_Connect.js";

const CoordinatorWorkDetail = sequelize.define('CoordinatorWorkDetail', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    coordinatorID: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    trainingProgrammes: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {},
    },
    reviewMeetings: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
    },
    monitoringVisits: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
    },
    reports: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {},
    },
});

export default CoordinatorWorkDetail;
