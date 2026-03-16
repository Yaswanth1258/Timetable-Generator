import Request from '../models/Request.js';

export const createRequest = async (req, res) => {
    try {
        const request = await Request.create({
            faculty: req.user._id,
            message: req.body.message
        });
        
        // Populate the faculty name
        const populatedRequest = await Request.findById(request._id).populate('faculty', 'name email');
        
        if (req.app.get('io')) {
            req.app.get('io').emit('new_request', populatedRequest);
        }
        
        res.status(201).json(populatedRequest);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

export const getRequests = async (req, res) => {
    try {
        // Find requests related to the logged in user if they are faculty
        // If they are admin, finding all requests
        const filter = req.user.role === 'ADMIN' ? {} : { faculty: req.user._id };
        const requests = await Request.find(filter).populate('faculty', 'name email').sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};

export const updateRequestStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const request = await Request.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('faculty', 'name email');
        if (!request) return res.status(404).json({ message: 'Request not found' });
        
        if (req.app.get('io')) {
            req.app.get('io').emit('request_updated', request);
        }
        
        res.json(request);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};
