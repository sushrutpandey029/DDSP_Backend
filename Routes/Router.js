import express from 'express';
import { AdminRegister, AdminLogin,AdminLogout, Adminlogin, AdminDashboard, UserRegister,userlist,farmerlist, UserLogin,adduser,DeleteUserById,updateuser } from '../Controllers/Admin_Controller.js';
import { data,updateUser,addFarmerInfo,getFarmers,addCultivationCostDetails,addCultivationCostDetails1,getProductionDetails,addProductionDetails,addCoordinatorWorkDetails} from '../Controllers/ProjectManager_Controller.js';
import { authenticateJWT } from '../Middlewares/JwtAuthAminLogin.js';
import { authorizeRole } from '../Middlewares/RoleBasedAuth.js'; // Import the new middleware
import upload from '../Middlewares/ProfileUploaupLoad.js';
import { isAuthenticated } from '../Middlewares/isAuthenticated.js'; // Adjust path if necessary


export const router = express.Router();

router.post('/api/admin/adminregister', AdminRegister);


router.get('/', Adminlogin);
router.post('/adminlogin', AdminLogin);
router.get('/dashboard', isAuthenticated, AdminDashboard);
router.get('/adminlogout', AdminLogout);
router.get('/userlist', userlist);
router.get('/farmerlist', farmerlist);    
router.get('/edituser/:id',updateuser);
router.put('/updateuser/:id',upload.single('profileimage'),updateUser);
router.get('/delete/:id', DeleteUserById);
router.get('/adduser', adduser);









router.post('/api/admin/userregister', upload.single('profileimage'), UserRegister);
router.put('/api/admin/userupdate/:id', upload.single('profileimage'), updateUser);
//Rest API Section
router.post('/api/user/userlogin', UserLogin);
// farerform
router.post('/api/user/addfarmerinfo',addFarmerInfo);
router.get('/api/user/getFarmers',getFarmers);
router.get('/api/user/addCultivationCostDetails1/:id',addCultivationCostDetails1);
router.post('/api/user/addCultivationCostDetails/:id',addCultivationCostDetails);


router.get('/api/user/getProductionDetails/:id',getProductionDetails);
router.post('/api/user/addProductionDetails/:id',addProductionDetails);
router.post('/api/user/addworkdetails/:id',addCoordinatorWorkDetails);



// Protected routes with role-based access
router.get('/api/user/data', authenticateJWT, authorizeRole(['Project Coordinator']), data); // Accessible only to 'Project Coordinator'
// router.get('/api/user/data1', authenticateJWT, authorizeRole(["Assistant Project Coordinator"]), data1); // Accessible only to 'Assistant Project Coordinator'
