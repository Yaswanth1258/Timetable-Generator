import express from 'express';
import { createRequest, getRequests, updateRequestStatus } from '../controllers/requestController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Both Faculty and Admin can view their relevant requests
router.route('/').get(protect, getRequests);

// Faculty can create requests
router.route('/').post(protect, createRequest);

// Admin can update request status (Approve/Reject)
router.route('/:id').put(protect, admin, updateRequestStatus);

export default router;
