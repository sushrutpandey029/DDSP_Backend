import UserModel from '../Models/UserModel.js'

import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';



// Example Data Route (Protected)
export const data1 = async (req, res) => {
    res.status(200).send({
        message: "Hello, you have accessed protected data! From Asst. Project coordinater login",
        user: req.user 
    });
};








