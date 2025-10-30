import { Router } from 'express';
import { VotingController } from '../controllers/votingController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// Public routes (authenticated users)
router.get('/available', authenticate, VotingController.getAvailableRestaurants);
router.post('/vote', authenticate, VotingController.castVote);
router.get('/has-voted', authenticate, VotingController.hasUserVoted);
router.get('/results', authenticate, VotingController.getVotingResults);
router.get('/is-active', authenticate, VotingController.isVotingActive);

// Admin only routes
router.post('/close', authenticate, requireAdmin, VotingController.closeVoting);

export default router;
