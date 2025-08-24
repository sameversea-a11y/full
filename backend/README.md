# UDIN Backend API

A comprehensive backend API system for UDIN (Unique Document Identification Number) with Razorpay payment integration.

## Features

- **User Management**: Registration, login, email verification
- **Document Management**: Upload, track, and manage documents with unique UDIN
- **Payment Processing**: Razorpay integration with complete transaction tracking
- **Backoffice Panel**: Admin dashboard for document verification and payment management
- **Security**: JWT authentication, rate limiting, input validation
- **Architecture**: Model-Controller-Service (MCS) pattern for better code organization

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Payment Gateway**: Razorpay
- **Authentication**: JWT tokens
- **File Upload**: Multer
- **Email**: Nodemailer
- **Security**: Helmet, CORS, Rate limiting

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Configure environment variables in `.env`

5. Start the server:
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Email verification
- `GET /api/auth/me` - Get user profile
- `POST /api/auth/logout` - User logout

### Documents (User)
- `POST /api/documents/upload` - Upload document
- `GET /api/documents` - Get user documents
- `GET /api/documents/:udin` - Get document by UDIN
- `DELETE /api/documents/:udin` - Delete document

### Payments (User)
- `POST /api/payments/create-order` - Create payment order
- `POST /api/payments/verify` - Verify payment
- `GET /api/payments/history` - Get payment history

### Backoffice (Admin)
- `GET /api/backoffice/dashboard` - Dashboard statistics
- `GET /api/backoffice/documents` - Get all documents
- `PUT /api/backoffice/documents/:documentId/status` - Update document status
- `GET /api/backoffice/users` - Get all users
- `GET /api/backoffice/payments` - Get all payments
- `POST /api/backoffice/payments/:paymentId/refund` - Process refund
- `GET /api/backoffice/transactions` - Get transaction history

## Document Upload Process

1. User uploads document (JPG, JPEG, PNG, PDF, DOC, DOCX, XLS, XLSX)
2. System generates unique UDIN
3. Document hash is created for duplicate detection
4. File is stored securely with metadata

## Payment Process

1. User initiates payment for document verification
2. Razorpay order is created
3. Payment verification with signature validation
4. Transaction records are maintained for audit trail
5. Document status is updated upon successful payment

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting to prevent abuse
- Input validation and sanitization
- File type and size restrictions
- CORS protection
- Helmet security headers

## Database Models

- **User**: User account information
- **Document**: Document details and metadata
- **Payment**: Payment records with Razorpay integration
- **Transaction**: Complete transaction audit trail

## Error Handling

- Comprehensive error handling with proper HTTP status codes
- Detailed error messages for development
- Generic error messages for production
- File cleanup on upload errors

## Environment Variables

See `.env.example` for all required environment variables.

## License

MIT License