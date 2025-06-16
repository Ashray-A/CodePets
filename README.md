# 🐱 CodePets - Your Digital Coding Companion

## 🌟 Overview

CodePets is a unique gamified web application that transforms your coding activities into digital pet care! Watch your virtual cat grow stronger and happier as you code, commit, and maintain your development streaks.

**🚀 Live Demo:** [https://code-pets.vercel.app](https://code-pets.vercel.app)

## ✨ Features

### 🐾 **Digital Pet System**
- **5 Growth Levels**: From baby cat to master cat based on your coding activity
- **Real-time Growth**: Your pet evolves as you earn points through coding
- **Visual Progression**: Beautiful animations and level-specific pet appearances

### 📊 **Activity Tracking**
- **GitHub Integration**: Automatic commit synchronization from your repositories
- **Manual Time Logging**: Log your coding hours with descriptions
- **Comprehensive History**: Track all your coding activities and statistics

### 🔥 **Streak System**
- **Daily Coding Streaks**: Maintain consecutive days of coding activity
- **Streak Leaderboard**: Compete with other developers
- **Motivation System**: Keep your pet happy by coding consistently

### 🏆 **Social Features**
- **Global Leaderboard**: See how you rank against other developers
- **Points System**: Earn points through commits (0.5 pts) and time logging (1 pt/hour)
- **Achievement Tracking**: Monitor your longest streaks and total activity

### 📱 **Modern UI/UX**
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Clean Interface**: Intuitive navigation with tab-based dashboard
- **Real-time Updates**: Live updates when you log activities

## 🛠️ Tech Stack

### Frontend
- **React.js** - Modern UI library
- **Vite** - Fast build tool and dev server
- **CSS3** - Custom styling with responsive design
- **Axios** - HTTP client for API communication

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling

### Authentication & APIs
- **GitHub OAuth** - Secure authentication
- **GitHub API** - Repository and commit data
- **JWT** - Secure token-based authentication

### Deployment
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: MongoDB Atlas

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account
- GitHub OAuth App

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/codepets.git
   cd codepets
   ```

2. **Install dependencies**
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. **Environment Setup**

   **Server (.env)**
   ```env
   MONGODB_URI=your_mongodb_atlas_connection_string
   GITHUB_CLIENT_ID=your_github_oauth_client_id
   GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
   JWT_SECRET=your_super_secret_jwt_key
   CLIENT_URL=http://localhost:5173
   NODE_ENV=development
   PORT=5000
   ```

   **Client (.env)**
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

4. **GitHub OAuth Setup**
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Create a new OAuth App with:
     - Application name: CodePets
     - Homepage URL: `http://localhost:5173`
     - Authorization callback URL: `http://localhost:5173/auth/callback`

5. **Run the application**
   ```bash
   # Start the server (from server directory)
   npm start

   # Start the client (from client directory)
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

## 📖 How It Works

### 🔐 **Authentication**
1. Users log in with their GitHub account
2. OAuth flow securely authenticates and creates user profile
3. GitHub access token enables repository access

### 📈 **Point System**
- **Commits**: 0.5 points per commit when syncing repositories
- **Time Logging**: 1 point per hour of logged coding time
- **Pet Growth**: Accumulated points determine pet level (5 levels total)

### 🔥 **Streak Tracking**
- Streaks count consecutive days with any coding activity
- Activities include: GitHub commits or manual time logs
- Streaks reset after missing a day of activity

### 🏆 **Leaderboards**
- **Points Leaderboard**: Top users by total points earned
- **Streak Leaderboard**: Current longest coding streaks
- Real-time rankings and friendly competition

## 🎯 Pet Growth Levels

| Level | Name | Points Required | Description |
|-------|------|-----------------|-------------|
| 1 | Baby Cat | 0-50 | Just starting the coding journey |
| 2 | Young Cat | 51-150 | Building coding habits |
| 3 | Adult Cat | 151-300 | Consistent development activity |
| 4 | Wise Cat | 301-500 | Experienced developer |
| 5 | Master Cat | 501+ | Coding master with dedication |

## 🚀 Deployment

### Production Deployment

1. **Deploy Backend to Render**
   - Connect your GitHub repository
   - Set environment variables in Render dashboard
   - Use the provided `render.yaml` configuration

2. **Deploy Frontend to Vercel**
   - Connect your GitHub repository
   - Set `VITE_API_BASE_URL` to your Render backend URL
   - Automatic deployments on push

3. **Update GitHub OAuth**
   - Update callback URL to your production domain
   - Add production domain to CORS configuration

See `DEPLOYMENT_GUIDE.md` for detailed deployment instructions.

## 📊 API Endpoints

### Authentication
- `GET /api/auth/github/url` - Get GitHub OAuth URL
- `POST /api/auth/github` - Complete GitHub OAuth

### User & Pet
- `GET /api/users/profile` - Get user profile
- `GET /api/pets` - Get user's pet data
- `POST /api/pets/log-time` - Log coding time

### GitHub Integration
- `GET /api/github/repos` - Get user repositories
- `POST /api/github/sync-commits` - Sync recent commits

### Streaks & Leaderboards
- `GET /api/streaks` - Get user streak data
- `GET /api/streaks/leaderboard` - Get streak leaderboard
- `GET /api/users/leaderboard` - Get points leaderboard

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and conventions
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation if needed

## 🙏 Acknowledgments

- Inspired by the classic Tamagotchi digital pets
- Built with love for the developer community

## 🐛 Known Issues

- Rate limiting may occur with excessive GitHub API calls
- Mobile responsiveness improvements ongoing
- Additional pet types coming soon

## 🗺️ Roadmap

- [ ] Multiple pet types (dogs, birds, etc.)
- [ ] Achievement system with badges
- [ ] Team pets for collaborative projects
- [ ] Integration with more code platforms
- [ ] Mobile app development
- [ ] Social features and friend systems

---

**Start coding, grow your pet, and join the CodePets community today!** 🐱✨
