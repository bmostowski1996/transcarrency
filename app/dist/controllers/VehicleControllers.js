"use strict";
// // Controler for handling vehicle-related operations/ export to routes
// import {Request, Response} from 'express';
// import {Vehicle} from '../models/Vehicle';
// export const getAllVehicles = async (req: Request, res: Response) => {
//     try{
//         const vehicles = await Vehicle.find();
//         res.status(200).json(vehicles);
//     } catch (error) {
//         res.status(500).json({message: 'Error fetching vehicles', error});
//     }
// };
// export const getVehicleById = async (req: Request, res: Response) => {
//     const {id} = req.params;
//     try{
//         const vehicle = await Vehicle.findById(id);
//         if(!vehicle){
//             return res.status(404).json({message: 'Vehicle not found'});
//         }
//         res.status(200).json(vehicle);
//     } catch (error) {
//         res.status(500).json({message: 'Error fetching vehicle', error});
//     }
// };
// export const createVehicle = async (req: Request, res: Response) => {
//     const {vin, make, model, year, type} = req.body;
//     try{
//         const newVehicle = new Vehicle({vin, make, model, year, type});
//         await newVehicle.save();
//         res.status(201).json(newVehicle);
//     } catch (error) {
//         res.status(500).json({message: 'Error creating vehicle', error});
//     }
// }
// export const updateVehicle = async (req: Request, res: Response) => {
//     const {id} = req.params;
//     const {vin, make, model, year, type} = req.body;
//     try{
//         const updatedVehicle = await Vehicle.findByIdAndUpdate(id, {vin, make, model, year, type}, {new: true});
//         if(!updatedVehicle){
//             return res.status(404).json({message: 'Vehicle not found'});
//         }
//         res.status(200).json(updatedVehicle);
//     } catch (error) {
//         res.status(500).json({message: 'Error updating vehicle', error});
//     }
// };
// export const deleteVehicle = async (req: Request, res: Response) => {
//     const {id} = req.params;
//     try{
//         const deletedVehicle = await Vehicle.findByIdAndDelete(id);
//         if(!deletedVehicle){
//             return res.status(404).json({message: 'Vehicle not found'});
//         }
//         res.status(200).json({message: 'Vehicle deleted successfully'});
//     } catch (error) {
//         res.status(500).json({message: 'Error deleting vehicle', error});
//     }
// };
