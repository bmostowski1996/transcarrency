<<<<<<< HEAD
import express from 'express';
import { getAllVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle } from '../controllers/VehicleControllers';
const router = express.Router();
router.get('/', getAllVehicles);
router.get('/:id', getVehicleById);
router.post('/', createVehicle);
router.put('/:id', updateVehicle);
router.delete('/:id', deleteVehicle);
export default router;
=======
"use strict";
// import express from 'express';
// import { getAllVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle } from '../controllers/VehicleControllers';
// const router = express.Router();
// router.get('/', getAllVehicles);
// router.get('/:id', getVehicleById);
// router.post('/', createVehicle);
// router.put('/:id', updateVehicle);
// router.delete('/:id', deleteVehicle);
// export default router;
>>>>>>> 1de7c13ffd7a164316ba7857ea756d5cbede448b
