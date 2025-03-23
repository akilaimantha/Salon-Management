import mongoose from "mongoose";

const feedbackSchema = mongoose.Schema(
    {
    Username: {
        type: String,
    },
    serviceID: { 
        type: mongoose.Types.ObjectId,
        
    },
    employeeID:{
        type: mongoose.Schema.Types.ObjectId,
        required: true,
    },
  
    message:{
        type: String,
        required: true,
    },
    star_rating:{
        type:Number,
        required: true,
    },
},
{ timestamps: true }
    
);
const   Feedback = mongoose.model('Feedback' ,feedbackSchema);
export default Feedback;