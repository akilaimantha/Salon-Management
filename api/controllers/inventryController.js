import Inventory from "../models/inventryModel.js";
import mongoose from "mongoose";



//create inventry
export const createInventry = async (request, response) => {
  try {
    if (
      
      !request.body.ItemName ||
      !request.body.Category ||
      !request.body.Quantity ||
      !request.body.Price ||
      !request.body.SupplierName ||
      !request.body.SupplierEmail

    ) {
      return response.status(400).send({
        message: 'Send all required fields:  ItemName, Category, Quantity, Price, SupplierName, SupplierEmail',
      });
    }
    const newInventory = {
      
      ItemName: request.body.ItemName,
      Category: request.body.Category,
      Quantity: request.body.Quantity,
      Price: request.body.Price,
      SupplierName: request.body.SupplierName,
      SupplierEmail: request.body.SupplierEmail,
    };

    const inventory = await Inventory.create(newInventory);

    return response.status(201).send(inventory);
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
}

  //  Get All Inventory from database

  export const getAllInventory = async (req, response) => {
    try {
      const inventories = await Inventory.find({});
      
      return response.status(200).json({
        count: inventories.length,
        data: inventories,
      });
    } catch (error) {
      console.log(error.message);
      response.status(500).send({ message: error.message });
    }
  }




  
// Get One Inventory from database by id

export const getOneInventory = async (request, response ) => {
  try {
    const { id } = request.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return response.status(400).json({ message: "Invalid ID format" });
  }
    const inventory = await Inventory.findById(id);

    if (!inventory) {
      return response.status(404).json({ message: 'Inventory not found' });
    }
    return response.status(200).json(inventory);
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
}

  
  // Update an Inventory
  export const updateInventory = async (request, response, ) => {
    try {
      if (
        
        !request.body.ItemName ||
        !request.body.Category ||
        !request.body.Quantity ||
        !request.body.Price ||
        !request.body.SupplierName ||
        !request.body.SupplierEmail 
  
      ) {
        return response.status(400).send({
          message: 'Send all required fields: ItemNo, ItemName, Category, Quantity, Price, SupplierName, SupplierEmail',
        });
      }
  
      const { id } = request.params;
  
      const result = await Inventory.findByIdAndUpdate(id, request.body);
  
      if (!result) {
        return response.status(404).json({ message: 'Inventory not found' });
      }
  
      return response.status(200).send({ message: 'Inventory updated successfully' });
    } catch (error) {
      console.log(error.message);
      response.status(500).send({ message: error.message });
    }
  }

  // Delete an Inventory
  export const deleteInventory = async (request, response ) => {
    try {
      const { id } = request.params;
  
      const result = await Inventory.findByIdAndDelete(id);
  
      if (!result) {
        return response.status(404).json({ message: 'Inventory not found' });
      }
  
      return response.status(200).send({ message: 'Inventory deleted successfully' });
    } catch (error) {
      console.log(error.message);
      response.status(500).send({ message: error.message });
    }
  }

