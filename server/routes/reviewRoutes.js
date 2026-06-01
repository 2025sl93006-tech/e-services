const router = require('express').Router();
const { create, getAll, getMyReviews, getByProvider, update, remove } = require('../controllers/reviewController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /reviews:
 *   post:
 *     summary: Submit a review for a provider (one review per user per provider)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateReviewRequest'
 *     responses:
 *       201:
 *         description: Review created; provider averageRating recalculated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Review'
 *       400:
 *         description: You have already reviewed this provider
 *       404:
 *         description: Service provider not found
 *       401:
 *         description: Unauthorized
 */
router.post('/', verifyToken, create);

/**
 * @swagger
 * /reviews:
 *   get:
 *     summary: Get all reviews — for admin moderation (Admin only)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of all reviews (including hidden)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       403:
 *         description: Admin access required
 */
router.get('/', verifyToken, requireAdmin, getAll);

/**
 * @swagger
 * /reviews/my:
 *   get:
 *     summary: Get all reviews submitted by the logged-in user
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User's own reviews with populated provider info
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 *       401:
 *         description: Unauthorized
 */
router.get('/my', verifyToken, getMyReviews);

/**
 * @swagger
 * /reviews/provider/{providerId}:
 *   get:
 *     summary: Get all visible reviews for a specific provider (public)
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: providerId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the provider
 *     responses:
 *       200:
 *         description: Array of visible reviews, newest first
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Review'
 */
router.get('/provider/:providerId', getByProvider);

/**
 * @swagger
 * /reviews/{id}:
 *   put:
 *     summary: Update your own review (owner only)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateReviewRequest'
 *     responses:
 *       200:
 *         description: Updated review; averageRating recalculated
 *       403:
 *         description: Not authorized (not owner)
 *       404:
 *         description: Review not found
 */
router.put('/:id', verifyToken, update);

/**
 * @swagger
 * /reviews/{id}:
 *   delete:
 *     summary: Hide a review (Admin only — soft delete, sets isVisible false)
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review removed; averageRating recalculated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       404:
 *         description: Review not found
 *       403:
 *         description: Admin access required
 */
router.delete('/:id', verifyToken, requireAdmin, remove);

module.exports = router;
