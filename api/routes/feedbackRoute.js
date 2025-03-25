import express from 'express';
import Feedback from '../models/feedbackModel.js';
import { createFeedback, getAllFeedback, getOneFeedback, updateFeedback, deleteFeedback } from '../controllers/feedbackController.js';

const router = express.Router();

router.post('/', createFeedback);
router.get('/', getAllFeedback);

// Route to get feedback by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const feedback = await Feedback.find({ user_id: userId });
    res.status(200).json(feedback);
  } catch (error) {
    console.error(error.message);
    res.status(500).send({ message: error.message });
  }
});

router.get('/:id', getOneFeedback);
router.put('/:id', updateFeedback);
router.delete('/:id', deleteFeedback);

export default router;