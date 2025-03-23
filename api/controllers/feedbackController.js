import mongoose from 'mongoose'; 

import Feedback from '../models/feedbackModel.js';

const validateFields = (req, res, next) => {
    const requiredFields = [
        "username",
        "serviceid",
        "employee",
        "date_of_service",
        "message",
        "star_rating",
    ];

    // Check if all required fields are present
    for (const field of requiredFields) {
        if (!req.body[field]) {
            return res.status(400).send({ message: `Missing required field: ${field}` });
        }
    }

    // Validate email format
    if (!req.body.email.match(/^\S+@\S+\.\S+$/)) {
        return res.status(400).send({ message: "Please provide a valid email address" });
    }

    // Validate phone number format
    if (!req.body.phone_number.match(/^\d{10}$/)) {
        return res.status(400).send({ message: "Please provide a valid 10-digit phone number" });
    }

    // Convert date_of_service to a Date object
    const parseDate = req.body.date_of_service ? new Date(req.body.date_of_service) : undefined;
    if (!parseDate || isNaN(parseDate.getTime())) {
        return res.status(400).send({ message: "Please provide a valid date for date_of_service" });
    }

    // Make data available in request
    req.parseDate = parseDate;
    next();
};

// Create new feedback
export const createFeedback =async (req, res) => {
    
    try {

        const {
            Username,
            serviceID,
            employeeID,
            message,
            date_of_service,
            star_rating,
        } = req.body;



        const newFeedback = {
            Username,
            serviceID,
            employeeID,
            date_of_service,
            message,
            star_rating,
        };

        // Save new feedback to the database
        const feedback = await Feedback.create(newFeedback);
        if (!feedback) {
            return res.status(500).json({ message: "Failed to create feedback" });
        }
       return  res.status(201).json(feedback);

    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: error.message });
    }
};

// Get route for feedback based on search criteria
// router.get("/feedback", async (req, res) => {
//     try {
//         const { search = "" } = req.query;
//         const query = {
//             $or: [
//                 { UserName: { $regex: search, $options: "i" } },
//                 { name: { $regex: search, $options: "i" } },
//                 { email: { $regex: search, $options: "i" } },
//                 { phone_number: { $regex: search, $options: "i" } },
//                 { employee: { $regex: search, $options: "i" } },
//                 { date_of_service: { $regex: search, $options: "i" } },
//                 { message: { $regex: search, $options: "i" } },
//                 { star_rating: { $regex: search, $options: "i" } },
//             ],
//         };
//         const feedback = await Feedback.find(query);
//         res.status(200).json({ count: feedback.length, data: feedback });
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).json({ error: true, message: "Internal Server Error" });
//     }
// });


// Update feedback by ID

export const updateFeedback = async  (req, res) => {
    try {
        const { id } = req.params;
        const feedback = await Feedback.findById(id);

        if (!feedback) {
            return res.status(404).send({ message: "Feedback not found" });
        }

        await Feedback.findByIdAndUpdate(id, req.body, { new: true });

        res.status(200).send({ message: "Feedback updated successfully" });
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ message: error.message });
    }
};

// Get all feedback

export const getAllFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find();
        res.status(200).json(feedback);
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ message: error.message });
    }
};


// Delete feedback by ID

export const deleteFeedback = async (req, res) => {

    try {
        const { id } = req.params;
        const feedback = await Feedback.findById(id);

        if (!feedback) {
            return res.status(404).send({ message: "Feedback not found" });
        }

        await Feedback.findByIdAndDelete(id);
        res.status(200).send({ message: "Feedback deleted successfully" });
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ message: error.message });
    }
};

// get one feedback by ID

export const getOneFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        const feedback = await Feedback.findById(id);

        if (!feedback) {
            return res.status(404).send({ message: "Feedback not found" });
        }

        res.status(200).send(feedback);
    } catch (error) {
        console.error(error.message);
        res.status(500).send({ message: error.message });
    }
};

