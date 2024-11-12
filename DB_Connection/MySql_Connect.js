import { Sequelize } from "sequelize";

const sequelize  = new Sequelize('milleniancecp_ddsp','milleniancecp_ddsp','e2Sx#Gh#DKwI',{
    host:'localhost',
    dialect:'mysql'
});

const Db_connetion= async()=>{
    try{
        await sequelize.authenticate();
        console.log("db connect successfuly")

    }catch(err){
        console.error("Error while connecting to the database", err);

    }
};

Db_connetion();

export default sequelize;