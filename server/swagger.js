const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'e-Services API',
      version: '1.0.0',
      description: 'REST API for the e-Services platform — browse, book, and review home & professional services.',
    },
    servers: [{ url: 'http://localhost:5001/api', description: 'Local development server' }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Paste the JWT token obtained from /auth/login',
        },
      },
      schemas: {
        // ── Auth ──────────────────────────────────────────────────────────────
        RegisterRequest: {
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name:     { type: 'string', example: 'Rahul Sharma' },
            email:    { type: 'string', format: 'email', example: 'rahul@example.com' },
            password: { type: 'string', example: 'user123' },
            phone:    { type: 'string', example: '9876543210' },
            address:  { type: 'string', example: 'Chennai, TN' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email:    { type: 'string', example: 'admin@eservices.com' },
            password: { type: 'string', example: 'admin123' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            token: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id:    { type: 'string' },
                name:  { type: 'string' },
                email: { type: 'string' },
                role:  { type: 'string', enum: ['admin', 'enduser'] },
              },
            },
          },
        },
        UpdateProfileRequest: {
          type: 'object',
          properties: {
            name:    { type: 'string', example: 'New Name' },
            phone:   { type: 'string', example: '9000000000' },
            address: { type: 'string', example: 'Bangalore, KA' },
          },
        },
        ChangePasswordRequest: {
          type: 'object',
          required: ['currentPassword', 'newPassword'],
          properties: {
            currentPassword: { type: 'string', example: 'oldpass' },
            newPassword:     { type: 'string', example: 'newpass' },
          },
        },
        // ── Category ─────────────────────────────────────────────────────────
        Category: {
          type: 'object',
          properties: {
            _id:         { type: 'string' },
            name:        { type: 'string', example: 'Electrical' },
            description: { type: 'string', example: 'Wiring and electrical repairs' },
            imageUrl:    { type: 'string', example: 'https://images.unsplash.com/...' },
            isActive:    { type: 'boolean' },
            createdAt:   { type: 'string', format: 'date-time' },
          },
        },
        CategoryRequest: {
          type: 'object',
          required: ['name'],
          properties: {
            name:        { type: 'string', example: 'Pest Control' },
            description: { type: 'string', example: 'Pest removal services' },
            imageUrl:    { type: 'string', example: 'https://images.unsplash.com/...' },
          },
        },
        // ── Provider ──────────────────────────────────────────────────────────
        Provider: {
          type: 'object',
          properties: {
            _id:            { type: 'string' },
            name:           { type: 'string', example: 'Vikram Electricals' },
            category:       { $ref: '#/components/schemas/Category' },
            description:    { type: 'string' },
            location:       { type: 'string', example: 'Bangalore' },
            address:        { type: 'string' },
            phone:          { type: 'string' },
            email:          { type: 'string' },
            imageUrl:       { type: 'string' },
            chargePerHour:  { type: 'number', example: 600 },
            minCharge:      { type: 'number', example: 800 },
            experience:     { type: 'number', example: 15 },
            availability:   { type: 'string', enum: ['available', 'busy', 'unavailable'] },
            averageRating:  { type: 'number', example: 4.5 },
            totalReviews:   { type: 'number', example: 12 },
            isActive:       { type: 'boolean' },
          },
        },
        ProviderRequest: {
          type: 'object',
          required: ['name', 'category', 'location', 'chargePerHour'],
          properties: {
            name:          { type: 'string', example: 'New Provider' },
            category:      { type: 'string', example: '64abc123...' },
            description:   { type: 'string' },
            location:      { type: 'string', example: 'Chennai' },
            address:       { type: 'string' },
            phone:         { type: 'string' },
            email:         { type: 'string' },
            imageUrl:      { type: 'string' },
            chargePerHour: { type: 'number', example: 700 },
            minCharge:     { type: 'number', example: 500 },
            experience:    { type: 'number', example: 5 },
            availability:  { type: 'string', enum: ['available', 'busy', 'unavailable'], default: 'available' },
          },
        },
        // ── Order ────────────────────────────────────────────────────────────
        Order: {
          type: 'object',
          properties: {
            _id:             { type: 'string' },
            orderRef:        { type: 'string', example: 'ES-2026-4821' },
            user:            { type: 'object' },
            provider:        { $ref: '#/components/schemas/Provider' },
            category:        { $ref: '#/components/schemas/Category' },
            serviceDate:     { type: 'string', format: 'date', example: '2026-07-20' },
            serviceAddress:  { type: 'string', example: '12 Main Road, Bangalore' },
            description:     { type: 'string' },
            estimatedHours:  { type: 'number', example: 2 },
            estimatedCost:   { type: 'number', example: 1200 },
            orderStatus:     { type: 'string', enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'] },
            cancellationReason: { type: 'string' },
            emailSent:       { type: 'boolean' },
            createdAt:       { type: 'string', format: 'date-time' },
          },
        },
        CreateOrderRequest: {
          type: 'object',
          required: ['providerId', 'serviceDate', 'serviceAddress'],
          properties: {
            providerId:     { type: 'string', example: '64abc123...' },
            serviceDate:    { type: 'string', format: 'date', example: '2026-07-20' },
            serviceAddress: { type: 'string', example: '12 Main Road, Bangalore' },
            description:    { type: 'string', example: 'Need full rewiring for 2BHK' },
            estimatedHours: { type: 'number', example: 3, default: 1 },
          },
        },
        CancelOrderRequest: {
          type: 'object',
          properties: {
            reason: { type: 'string', example: 'Changed my mind' },
          },
        },
        UpdateStatusRequest: {
          type: 'object',
          required: ['orderStatus'],
          properties: {
            orderStatus: {
              type: 'string',
              enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
              example: 'confirmed',
            },
          },
        },
        // ── Review ───────────────────────────────────────────────────────────
        Review: {
          type: 'object',
          properties: {
            _id:       { type: 'string' },
            user:      { type: 'object', properties: { _id: { type: 'string' }, name: { type: 'string' } } },
            provider:  { type: 'string' },
            order:     { type: 'string' },
            rating:    { type: 'number', minimum: 1, maximum: 5, example: 5 },
            comment:   { type: 'string', example: 'Excellent work!' },
            isVisible: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateReviewRequest: {
          type: 'object',
          required: ['providerId', 'rating'],
          properties: {
            providerId: { type: 'string', example: '64abc123...' },
            orderId:    { type: 'string', example: '64def456...' },
            rating:     { type: 'number', minimum: 1, maximum: 5, example: 5 },
            comment:    { type: 'string', example: 'Great service!' },
          },
        },
        UpdateReviewRequest: {
          type: 'object',
          properties: {
            rating:  { type: 'number', minimum: 1, maximum: 5, example: 4 },
            comment: { type: 'string', example: 'Updated: very good!' },
          },
        },
        // ── Common ───────────────────────────────────────────────────────────
        MessageResponse: {
          type: 'object',
          properties: { message: { type: 'string' } },
        },
        ErrorResponse: {
          type: 'object',
          properties: { message: { type: 'string', example: 'Error description' } },
        },
      },
    },
    tags: [
      { name: 'Auth',       description: 'Register, login, profile management' },
      { name: 'Categories', description: 'Service categories (Civil, Electrical, etc.)' },
      { name: 'Providers',  description: 'Service provider listings and management' },
      { name: 'Orders',     description: 'Book and manage service orders' },
      { name: 'Reviews',    description: 'Ratings and reviews for providers' },
    ],
  },
  apis: ['./routes/*.js'],
};

module.exports = swaggerJsdoc(options);
