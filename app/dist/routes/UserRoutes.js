<<<<<<< HEAD
// filepath: /Users/toonz/bootcamp/Project3/transcarrency/Server/src/routes/userRoutes.ts
import express from 'express';
import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/UserControllers';
const router = express.Router();
router.get('/', getAllUsers);
router.get('/:id', getUserById);
router.post('/', createUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);
export default router;
=======
"use strict";
// // filepath: /Users/toonz/bootcamp/Project3/transcarrency/Server/src/routes/userRoutes.ts
// import express from 'express';
// import { getAllUsers, getUserById, createUser, updateUser, deleteUser } from '../controllers/UserControllers';
// const router = express.Router();
// router.get('/', getAllUsers);
// router.get('/:id', getUserById);
// router.post('/', createUser);
// router.put('/:id', updateUser);
// router.delete('/:id', deleteUser);
// export default router;
>>>>>>> 1de7c13ffd7a164316ba7857ea756d5cbede448b
