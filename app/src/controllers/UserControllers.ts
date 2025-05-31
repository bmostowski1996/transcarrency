// // Controller for handling user-related operations / export to routes
// import {Request, Response} from 'express';
// import {User} from '../models/User';

// export const getAllUsers = async (req: Request, res: Response) => {
//     try{
//         const users = await User.find();
//         res.status(200).json(users);
//     } catch (error) {
//         res.status(500).json({message: 'Error fetching users', error});
//     }
// };

// export const getUserById = async (req: Request, res: Response) => {
//     const {id} = req.params;
//     try{
//         const user = await User.findById(id);
//         if(!user){
//             return res.status(404).json({message: 'User not found'});
//         }
//         res.status(200).json(user);
//     } catch (error) {
//         res.status(500).json({message: 'Error fetching user', error});
//     }
// };

// export const createUser = async (req: Request, res: Response) => {
//     const {email, password, firstName, lastName} = req.body;
//     try{
//         const newUser = new User({email, password, firstName, lastName});
//         await newUser.save();
//         res.status(201).json(newUser);
//     } catch (error) {
//         res.status(500).json({message: 'Error creating user', error});
//     }
// }
// export const updateUser = async (req: Request, res: Response) => {
//     const {id} = req.params;
//     const {email, password, firstName, lastName} = req.body;
//     try{
//         const updatedUser = await User.findByIdAndUpdate(id, {email, password, firstName, lastName}, {new: true});
//         if(!updatedUser){
//             return res.status(404).json({message: 'User not found'});
//         }
//         res.status(200).json(updatedUser);
//     } catch (error) {
//         res.status(500).json({message: 'Error updating user', error});
//     }
// };

// export const deleteUser = async (req: Request, res: Response) => {
//     const {id} = req.params;
//     try{
//         const deletedUser = await User.findByIdAndDelete(id);
//         if(!deletedUser){
//             return res.status(404).json({message: 'User not found'});
//         }
//         res.status(200).json({message: 'User deleted successfully'});
//     } catch (error) {
//         res.status(500).json({message: 'Error deleting user', error});
//     }
// };

// export const loginUser = async (req: Request, res: Response) => {
//     const {email, password} = req.body;
//     try{
//         const user = await User.findOne({email});
//         if (!user || user.password !== password) {
//             return res.status(401).json({message: 'Invalid email or password'});
//         }
//         res.status(200).json({message: 'Login successful', user});
//     } catch (error) {
//         res.status(500).json({message: 'Error logging in', error});
//     }
// };

// export const logoutUser = async (req: Request, res: Response) => {
//     try{
//         // Invalidate the user's session or token here
//         res.status(200).json({message: 'Logout successful'});
//     } catch (error) {
//         res.status(500).json({message: 'Error logging out', error});
//     }
// };
//  // check and see if Profile data is needed

 