const router = require('express').Router();
const { getAll, getByCategory, getOne, create, update, remove } = require('../controllers/providerController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /providers:
 *   get:
 *     summary: Get all active providers (with optional filters)
 *     tags: [Providers]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category ObjectId
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location (partial match, case-insensitive)
 *         example: Bangalore
 *       - in: query
 *         name: minCost
 *         schema:
 *           type: number
 *         description: Minimum charge per hour (₹)
 *       - in: query
 *         name: maxCost
 *         schema:
 *           type: number
 *         description: Maximum charge per hour (₹)
 *       - in: query
 *         name: availability
 *         schema:
 *           type: string
 *           enum: [available, busy, unavailable]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Full-text search across name, description, and location
 *     responses:
 *       200:
 *         description: Array of providers sorted by rating
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Provider'
 */
router.get('/', getAll);

/**
 * @swagger
 * /providers/category/{categoryId}:
 *   get:
 *     summary: Get all providers under a specific category
 *     tags: [Providers]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB ObjectId of the category
 *     responses:
 *       200:
 *         description: Array of providers for that category
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Provider'
 */
router.get('/category/:categoryId', getByCategory);

/**
 * @swagger
 * /providers/{id}:
 *   get:
 *     summary: Get a single provider by ID
 *     tags: [Providers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Provider object with populated category
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Provider'
 *       404:
 *         description: Service provider not found
 */
router.get('/:id', getOne);

/**
 * @swagger
 * /providers:
 *   post:
 *     summary: Create a new service provider (Admin only)
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProviderRequest'
 *     responses:
 *       201:
 *         description: Created provider
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Provider'
 *       403:
 *         description: Admin access required
 */
router.post('/', verifyToken, requireAdmin, create);

/**
 * @swagger
 * /providers/{id}:
 *   put:
 *     summary: Update a service provider (Admin only)
 *     tags: [Providers]
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
 *             $ref: '#/components/schemas/ProviderRequest'
 *     responses:
 *       200:
 *         description: Updated provider
 *       404:
 *         description: Service provider not found
 *       403:
 *         description: Admin access required
 */
router.put('/:id', verifyToken, requireAdmin, update);

/**
 * @swagger
 * /providers/{id}:
 *   delete:
 *     summary: Deactivate a provider (Admin only — soft delete)
 *     tags: [Providers]
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
 *         description: Service provider deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       404:
 *         description: Service provider not found
 *       403:
 *         description: Admin access required
 */
router.delete('/:id', verifyToken, requireAdmin, remove);

module.exports = router;
