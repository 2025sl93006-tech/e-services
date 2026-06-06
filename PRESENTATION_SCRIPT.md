# e-Services — Presentation Script

---

## Slide 1: Title Slide

Good morning / afternoon everyone. My name is [Your Name], and today I will be presenting my Full Stack Application Development project titled **e-Services** — an online service marketplace built using the MERN stack. This platform connects customers with home and professional service providers across categories like Civil, Electrical, Carpentry, and more.

---

## Slide 2: Problem Statement

In today's fast-paced world, finding reliable home service professionals is a challenge. People struggle to locate verified plumbers, electricians, or carpenters quickly. There is no single platform where they can browse, compare, and book these services online. e-Services solves this problem by providing a centralized digital marketplace for home and professional services.

---

## Slide 3: Project Objectives

The key objectives of this project are:

- To build a full-stack web application using the MERN stack
- To allow users to register, login, and book services online
- To provide an admin panel to manage categories, providers, and orders
- To implement a review and star rating system for service providers
- To send automated email notifications for order confirmations and status updates
- To expose a fully documented REST API using Swagger

---

## Slide 4: Technology Stack

The project uses the MERN stack — MongoDB, Express.js, React.js, and Node.js.

On the backend I used Node.js with Express.js for the REST API server, MongoDB with Mongoose as the database, JWT for authentication, Nodemailer for sending automated emails via Gmail, and Swagger UI for API documentation.

On the frontend I used React 18 with React Router v6 for navigation, Bootstrap 5 for responsive UI design, Axios for API calls, Formik and Yup for form handling and validation, and React Toastify for notifications.

---

## Slide 5: System Architecture

The application follows a 3-tier MVC architecture.

The React client runs on port 3001 and communicates with the server through Axios HTTP requests. The Express server runs on port 5001 and handles all business logic following the MVC pattern with separate Models, Controllers, and Routes. MongoDB stores all data in 5 collections — Users, Categories, ServiceProviders, Orders, and Reviews.

The client uses an Axios interceptor that automatically attaches the JWT Bearer token to every request and handles 401 unauthorized responses globally by logging the user out.

---

## Slide 6: Database Design

The database has 5 Mongoose models.

**User** stores name, email, hashed password, role which is either admin or enduser, phone, and address.

**Category** stores service categories like Civil, Electrical, and Carpentry with a soft delete flag called isActive.

**ServiceProvider** stores provider details including category, location, charge per hour, minimum charge, and denormalized averageRating and totalReviews for faster queries.

**Order** stores booking details with a unique order reference in the format ES-YYYY-XXXX generated automatically by a pre-save hook, along with service date, address, estimated cost, and status.

**Review** has a compound unique index on user and provider to enforce one review per user per provider. It has a static method called recomputeRating that recalculates the average rating after every review change.

---

## Slide 7: Authentication

The authentication system uses JWT — JSON Web Tokens.

When a user logs in, the server verifies their password using bcryptjs and generates a JWT token signed with a secret key. The token payload contains only the user ID and role — no sensitive data is stored inside the token.

On every protected API request, the verifyToken middleware decodes the token from the Authorization header. There is no database lookup on every request — the token itself carries all needed information, making it stateless and efficient.

The requireAdmin middleware further checks if the role is admin before allowing access to admin-only endpoints.

---

## Slide 8: Service Browsing and Ordering

Users can browse services on the Services page which supports multiple filters at the same time — filter by category, filter by location using regex search, filter by minimum and maximum cost, and text search across provider name, description, and location.

Once a user selects a provider, they can view full details including ratings and reviews, then place an order by filling in the service date, address, description, and estimated hours.

The estimated cost is calculated on the server using the formula: maximum of chargePerHour multiplied by estimatedHours, or the minimum charge. This is never accepted from the client, which prevents price manipulation.

---

## Slide 9: Email Notifications

The application sends automated email notifications using Nodemailer with Gmail.

There are two types of emails.

The first is the Order Confirmation Email, sent immediately when an order is placed. It includes the order reference, provider details, service date, address, and estimated cost in a formatted HTML table.

The second is the Status Update Email, sent whenever the admin changes the order status to Confirmed, In Progress, Completed, or Cancelled. Each status has a unique colour-coded banner in the email.

Emails are sent non-blocking — if the email fails, the API response is not affected and the order is still saved successfully.

---

## Slide 10: Reviews and Ratings

The review and rating system allows users to rate service providers after their order is completed.

A compound unique index on user and provider enforces only one review per user per provider at the database level. Ratings are stored from 1 to 5 stars.

After every review create, update, or delete, the static method recomputeRating runs a MongoDB aggregation to recalculate the average rating and total review count. These values are stored directly on the ServiceProvider document — this is called denormalization, which avoids expensive queries and makes the provider listing page fast.

Admins can soft-delete inappropriate reviews by setting isVisible to false.

---

## Slide 11: Admin Panel

The Admin Panel is accessible only to users with the admin role.

Admins can manage categories by creating, editing, and soft-deleting service categories. They can manage service providers by adding new ones, editing existing ones, and deactivating them. They can manage orders by viewing all orders with pagination and status filters, and updating order status — which automatically triggers a status update email to the customer. They can also moderate reviews and soft-delete inappropriate ones.

The Admin Dashboard shows KPI cards with counts for total orders, pending, completed, and cancelled.

---

## Slide 12: REST API and Swagger

The backend exposes 27 REST API endpoints across 5 route groups — Auth, Categories, Providers, Orders, and Reviews.

All endpoints are fully documented using Swagger UI available at http://localhost:5001/api-docs. The documentation is auto-generated from JSDoc swagger annotations written in the route files.

To test a protected endpoint in Swagger, call POST /auth/login first, copy the JWT token from the response, click the Authorize button, and paste the token. All subsequent requests will be authenticated automatically.

---

## Slide 13: Security

Security was a key consideration throughout the project.

Passwords are never stored in plain text — bcryptjs hashes them with 10 salt rounds. JWT tokens are stateless and carry only non-sensitive data. Role-based access control protects all admin endpoints via the requireAdmin middleware. Users can only access their own orders and reviews — the controller explicitly checks ownership. Soft deletes preserve data integrity. Estimated cost is always computed on the server. All secrets including the JWT secret, email credentials, and database URI are stored in environment variables and excluded from version control.

---

## Slide 14: Project Structure

The project follows a clean MVC structure.

The server directory has: config for database and email setup, middleware for auth and error handling, models for all Mongoose schemas, controllers for business logic, routes for Express endpoints with Swagger annotations, and services for the email service.

The client directory has: an api folder with one file per resource, a context folder with AuthContext for global login state, a components folder for reusable UI including PrivateRoute, AdminRoute, StarRating, Navbar, and Footer, and a pages folder for all views.

This separation of concerns makes the codebase clean and maintainable.

---

## Slide 15: Live Demo

Let me now walk you through a live demo.

I will open the application, register a new user, and log in. On the Services page I will apply filters to find a provider. I will open the provider detail page to view ratings and reviews, then place an order. You will see the estimated cost calculated automatically. We will then check the email for the order confirmation.

Next I will log in as admin using admin@eservices.com and password admin123. From the admin panel I will update the order status to Confirmed and we will check the customer email to see the status update notification. Finally I will show the Swagger API documentation at /api-docs.

---

## Slide 16: Challenges and Learnings

During development I faced several challenges.

Configuring Gmail with App Passwords and making emails non-blocking was a key learning. Understanding JWT stateless authentication — that the token payload eliminates any database lookup on every request — improved my understanding of scalable auth design. Deciding to store averageRating directly on ServiceProvider rather than computing it on every request was an important performance decision. Using React Context API for global auth state avoided prop drilling across components. Learning that static Express route segments like /my must be registered before dynamic /:id segments was a practical lesson in route ordering.

---

## Slide 17: Future Enhancements

There are several features I would like to add in the future.

Payment integration using Razorpay or Stripe for online payments. Real-time notifications using Socket.IO. A provider self-registration portal so service providers can manage their own profiles. Geolocation to show nearby providers on a map. A React Native mobile app using the same REST API. And admin analytics with charts for revenue trends and popular service categories.

---

## Slide 18: Conclusion

To summarize, e-Services is a complete full-stack MERN application that satisfies all 7 project requirements. It implements secure JWT authentication with role-based access control, provides filtering, search, ordering, and a review system, sends automated email notifications, exposes a fully documented REST API with Swagger, and follows best practices throughout.

This project has given me practical hands-on experience building a production-ready full-stack application from scratch.

Thank you for your time. I am happy to take any questions.
