# Voting System

A comprehensive web-based voting system with real-time features, admin and voter interfaces, and secure authentication.

## Features

### 🗳️ Core Voting Features
- **Real-time Voting**: Live updates during voting sessions using Socket.IO
- **Multiple Event Types**: Support for various voting event formats
- **Secure Ballot System**: Encrypted and tamper-proof voting mechanism
- **Results Visualization**: Real-time charts and statistics

### 👥 User Management
- **Admin Dashboard**: Complete event and voter management
- **Voter Interface**: User-friendly voting experience
- **Email Verification**: Secure account verification system
- **Admin Registration**: Approval-based admin registration system

### 🔐 Security Features
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt encryption for passwords
- **Email Verification**: Multi-step verification process
- **Rate Limiting**: Protection against abuse
- **CORS Protection**: Cross-origin request security

### 📊 Admin Features
- **Event Management**: Create, edit, and manage voting events
- **Voter Management**: Add, remove, and manage voter accounts
- **Real-time Statistics**: Live voting results and analytics
- **Public Links**: Shareable voting URLs for public events

## Tech Stack

### Frontend
- **React 18**: Modern UI framework
- **React Router**: Client-side routing
- **Tailwind CSS**: Utility-first CSS framework
- **Socket.IO Client**: Real-time communication
- **Chart.js**: Data visualization
- **React Hot Toast**: User notifications

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **Socket.IO**: Real-time bidirectional communication
- **JWT**: JSON Web Tokens for authentication
- **Nodemailer**: Email functionality
- **Bcrypt**: Password hashing

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <your-repository-url>
   cd voting-system
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Configuration**
   
   Create a `.env` file in the `server` directory:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/voting-system
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   
   # Email Configuration (Gmail)
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   
   # Client URL
   CLIENT_URL=http://localhost:3000
   ```

4. **Start the application**
   ```bash
   npm run dev
   ```

   This will start both the backend server (port 5000) and frontend development server (port 3000).

## Usage

### Admin Registration
1. Navigate to the login page
2. Select "Admin" and click "Register"
3. Fill in your details (name, email, password)
4. The system will send an approval request to `debtanu.operations.script@gmail.com`
5. Once approved, you'll receive a confirmation email

### Creating Voting Events
1. Log in as an admin
2. Navigate to "Create Event" in the admin dashboard
3. Fill in event details (title, description, options, duration)
4. Set voting parameters and save the event

### Voter Participation
1. Voters can register/login using their email
2. View available voting events
3. Participate in real-time voting sessions
4. View live results and voting history

## API Endpoints

### Authentication
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/admin/register` - Admin registration
- `POST /api/auth/voter/login` - Voter login/registration
- `GET /api/auth/verify/:type/:token` - Account verification
- `GET /api/auth/me` - Get current user

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create new event
- `GET /api/events/:id` - Get specific event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Voting
- `POST /api/votes` - Submit vote
- `GET /api/votes/event/:eventId` - Get votes for event
- `GET /api/votes/history` - Get voting history

## Project Structure

```
voting-system/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   └── App.js          # Main app component
│   └── package.json
├── server/                 # Node.js backend
│   ├── middleware/         # Express middleware
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   └── index.js           # Server entry point
├── package.json           # Root package.json
└── README.md
```

## Development

### Available Scripts
- `npm run dev` - Start development servers
- `npm run server` - Start backend server only
- `npm run client` - Start frontend server only
- `npm run build` - Build for production
- `npm run install-all` - Install all dependencies

### Code Style
- ESLint configuration for code quality
- Prettier for code formatting
- Consistent naming conventions

## Deployment

### Production Setup
1. Set `NODE_ENV=production` in environment variables
2. Configure production MongoDB URI
3. Set up proper JWT secret
4. Configure email settings
5. Build the frontend: `npm run build`
6. Start the production server: `npm start`

### Deployed links

```
   https://vote-bg3z.onrender.com/ -- frontend url
   https://vote-api-w1t0.onrender.com/api -- backend api utl
```

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/voting-system
JWT_SECRET=your-production-jwt-secret
EMAIL_USER=your-production-email@gmail.com
EMAIL_PASS=your-production-app-password
CLIENT_URL=https://your-domain.com
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository.

## Changelog

### Version 1.0.0
- Initial release
- Admin and voter authentication
- Real-time voting system
- Email verification
- Admin registration with approval system
- Comprehensive admin dashboard
- Mobile-responsive design
