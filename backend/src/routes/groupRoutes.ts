import { Router } from 'express';
import {
  GroupController,
  createGroupValidation,
  getGroupsValidation,
  joinGroupValidation,
} from '../controllers/groupController';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();

// Routes with optional authentication (for browsing public groups)
router.get('/', optionalAuth, getGroupsValidation, GroupController.getGroups);
router.get('/:id', optionalAuth, GroupController.getGroupById);

// Protected routes (authentication required)
router.post('/', authenticate, createGroupValidation, GroupController.createGroup);
router.post('/:id/join', authenticate, joinGroupValidation, GroupController.joinGroup);
router.delete('/:id', authenticate, GroupController.deleteGroup);

export default router;
