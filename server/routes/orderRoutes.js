const router = require('express').Router();
const { create, getAll, getMyOrders, getOne, cancel, updateStatus } = require('../controllers/orderController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Place a new service order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateOrderRequest'
 *     responses:
 *       201:
 *         description: Order created, confirmation email queued
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Service provider not found or inactive
 *       401:
 *         description: Unauthorized
 */
router.post('/', verifyToken, create);

/**
 * @swagger
 * /orders:
 *   get:
 *     summary: Get all orders — paginated (Admin only)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, in-progress, completed, cancelled]
 *         description: Filter by order status
 *     responses:
 *       200:
 *         description: Paginated order list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orders:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 pages:
 *                   type: integer
 *       403:
 *         description: Admin access required
 */
router.get('/', verifyToken, requireAdmin, getAll);

/**
 * @swagger
 * /orders/my:
 *   get:
 *     summary: Get all orders placed by the logged-in user
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array of the user's orders (newest first)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 */
router.get('/my', verifyToken, getMyOrders);

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get a single order by ID (owner or admin)
 *     tags: [Orders]
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
 *         description: Order object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       403:
 *         description: Not authorized (not owner or admin)
 *       404:
 *         description: Order not found
 */
router.get('/:id', verifyToken, getOne);

/**
 * @swagger
 * /orders/{id}/cancel:
 *   put:
 *     summary: Cancel an order (only pending or confirmed orders)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CancelOrderRequest'
 *     responses:
 *       200:
 *         description: Order cancelled successfully
 *       400:
 *         description: Order cannot be cancelled (not pending/confirmed)
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Order not found
 */
router.put('/:id/cancel', verifyToken, cancel);

/**
 * @swagger
 * /orders/{id}/status:
 *   put:
 *     summary: Update order status (Admin only)
 *     tags: [Orders]
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
 *             $ref: '#/components/schemas/UpdateStatusRequest'
 *     responses:
 *       200:
 *         description: Updated order object
 *       404:
 *         description: Order not found
 *       403:
 *         description: Admin access required
 */
router.put('/:id/status', verifyToken, requireAdmin, updateStatus);

module.exports = router;
