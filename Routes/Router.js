import express from 'express';
import { AdminRegister, AdminLogin, Adminlogin, AdminDashboard, UserRegister, UserLogin } from '../Controllers/Admin_Controller.js';
import { data,updateUser,addFarmerInfo,getFarmers,addCultivationCostDetails,addCultivationCostDetails1} from '../Controllers/ProjectManager_Controller.js';
import { data1 } from '../Controllers/AsstProductManager_Controller.js';
import { authenticateJWT } from '../Middlewares/JwtAuthAminLogin.js';
import { authorizeRole } from '../Middlewares/RoleBasedAuth.js'; // Import the new middleware
import upload from '../Middlewares/ProfileUploaupLoad.js';

export const router = express.Router();

router.post('/api/admin/adminregister', AdminRegister);


router.get('/', Adminlogin);
router.post('/adminlogin', AdminLogin);
router.get('/dashboard', AdminDashboard);

router.post('/api/admin/userregister', upload.single('profileimage'), UserRegister);

router.put('/api/admin/userupdate/:id', upload.single('profileimage'), updateUser);





//Rest API Section

router.post('/api/user/userlogin', UserLogin);

// farerform
router.post('/api/user/addfarmerinfo',addFarmerInfo);
router.get('/api/user/getFarmers',getFarmers);
router.post('/api/user/addCultivationCostDetails/:id',addCultivationCostDetails);
router.get('/api/user/addCultivationCostDetails1/:id',addCultivationCostDetails1)


// Protected routes with role-based access
router.get('/api/user/data', authenticateJWT, authorizeRole(['Project Coordinator']), data); // Accessible only to 'Project Coordinator'
router.get('/api/user/data1', authenticateJWT, authorizeRole(["Assistant Project Coordinator"]), data1); // Accessible only to 'Assistant Project Coordinator'

