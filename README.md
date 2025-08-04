# Sales Management App

A comprehensive React-based sales management application with Express.js backend for small to medium businesses.

## � Features

### 📊 **Sales Management**
- **New Sale Creation**: Step-by-step process to create sales
- **Pack Selection**: Choose from available product packs
- **Client Selection**: Select existing clients or add new ones
- **Sale Confirmation**: Review and confirm sale details
- **Real-time Data Sync**: Sales data is automatically saved

### 📈 **Sales Reporting & Analytics**
- **Interactive Dashboard**: Overview of key metrics and recent activity
- **Advanced Sales Reports**: Detailed analytics with filtering options
- **Date Range Filters**: Today, Week, Month, Quarter, Year
- **Representative Performance**: Sales by representative analysis
- **Product Performance**: Top-selling packs analysis
- **Visual Charts**: 7-day sales trend visualization
- **CSV Export**: Export sales data for external analysis

### 👥 **Client Management**
- **Client Database**: Comprehensive client information storage
- **Add/Edit Clients**: Create and modify client profiles
- **Search & Filter**: Find clients by name, city, or phone
- **Client Statistics**: View total sales and spending per client
- **Location Tracking**: City and Wilaya-based organization

### 📦 **Product Pack Management**
- **Pack Creation**: Build product packs from available articles
- **Article Selection**: Multi-select interface for articles
- **Gift Integration**: Optional gift inclusion in packs
- **Price Management**: Auto-calculation or custom pricing
- **Pack Analytics**: Sales performance per pack
- **Search & Filter**: Find packs by name, articles, or price range

### ⚙️ **Settings & Profile**
- **Profile Management**: Update personal information
- **Security Settings**: Password change functionality
- **Notification Preferences**: Customize alerts and notifications
- **Application Preferences**: Language, currency, date format settings

### 🔐 **User Authentication**
- **Secure Login**: Username/password authentication
- **Session Management**: Persistent login sessions
- **Representative Profiles**: Role-based access control

## 🛠️ Technical Features

### 🔄 **Data Management**
- **Real-time Updates**: Instant data synchronization
- **Local Storage**: File-based data persistence
- **State Management**: React state for UI responsiveness
- **Data Validation**: Form validation and error handling

### 🎨 **User Interface**
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Clean, professional Tailwind CSS styling
- **Interactive Components**: Hover effects, animations, and transitions
- **Accessibility**: Keyboard navigation and screen reader support

### 🌐 **API Integration**
- **RESTful API**: Express.js backend with standardized endpoints
- **Environment Configuration**: Flexible deployment settings
- **Error Handling**: Comprehensive error management
- **CORS Support**: Cross-origin resource sharing enabled

## 📱 User Interface Highlights

### Dashboard
- **Statistics Cards**: Total sales, clients, packs, revenue
- **Quick Actions**: One-click access to main functions
- **Recent Sales Table**: Latest transactions overview
- **Navigation Hub**: Central access to all features

### Sales Flow
1. **Pack Selection**: Browse and select product packs
2. **Client Selection**: Choose or add client information
3. **Confirmation**: Review sale details before submission
4. **Success**: Confirmation with option for new sale

### Management Interfaces
- **Grid-based Layouts**: Card-style information display
- **Advanced Search**: Real-time filtering and sorting
- **Form Modals**: Inline editing without page navigation
- **Statistics Integration**: Performance metrics per item

## 🚨 Deployment Considerations

### ⚠️ **Important Notice**
This app requires both frontend and backend to work properly. Simply hosting on GitHub Pages **will not work** because:

1. The backend server cannot run on GitHub Pages
2. API calls will fail without a running backend
3. Data persistence requires a proper database

### 🛠️ **Setup for Development**

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd sales-management-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Update REACT_APP_API_URL in .env file
   ```

4. **Run the application**
   ```bash
   # Option 1: Run both frontend and backend together
   npm run dev
   
   # Option 2: Run separately
   # Terminal 1 - Backend
   npm run server
   
   # Terminal 2 - Frontend  
   npm start
   ```

### 🚀 **Deployment Options**

#### **Option 1: Free Hosting (Recommended for demos)**

**Frontend (Netlify/Vercel):**
1. Build the app: `npm run build`
2. Deploy the `build` folder to Netlify or Vercel
3. Set environment variable: `REACT_APP_API_URL=<your-backend-url>`

**Backend (Railway/Render/Heroku):**
1. Create account on hosting service
2. Connect your GitHub repository
3. Deploy the backend automatically
4. Use the provided URL as your `REACT_APP_API_URL`

#### **Option 2: Local Network Sharing**
If you only want to share locally:
1. Find your IP address: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
2. Update `.env`: `REACT_APP_API_URL=http://YOUR-IP:3001`
3. Run: `npm run dev`
4. Share: `http://YOUR-IP:3001`

## 📁 Project Structure

```
├── public/
│   └── Data/              # JSON data files (clients, packs, articles, etc.)
├── src/
│   ├── components/
│   │   ├── Common/        # Shared components (Header)
│   │   ├── Dashboard/     # Dashboard component
│   │   ├── Login/         # Authentication
│   │   ├── Sales/         # Sales process components
│   │   ├── Reports/       # Analytics and reporting
│   │   ├── Clients/       # Client management
│   │   ├── Products/      # Pack management
│   │   └── Settings/      # User settings
│   ├── App.jsx           # Main application component
│   └── index.js          # Application entry point
├── server.js             # Express backend
├── .env                  # Environment variables
└── package.json          # Dependencies and scripts
```

## 🔧 **API Endpoints**

- `POST /api/sales` - Create new sale
- `GET /api/sales` - Get all sales
- `GET /api/health` - Health check

## � Configuration

### Environment Variables
- `REACT_APP_API_URL`: Backend API URL (default: http://localhost:3001)

### Available Scripts
- `npm start` - Start React development server
- `npm run server` - Start Express backend
- `npm run dev` - Start both frontend and backend
- `npm run build` - Build for production
- `npm run deploy` - Deploy to GitHub Pages (frontend only)

## 🐛 Troubleshooting

**"Failed to save sale to backend"**
- Check if backend server is running
- Verify `REACT_APP_API_URL` is correct
- Check browser console for network errors

**Cannot connect to API**
- Ensure backend is accessible from frontend host
- Check firewall settings
- Verify environment variables are set correctly

**Dashboard not loading data**
- Check browser console for JavaScript errors
- Verify data files exist in `public/Data/`
- Ensure proper data structure in JSON files

## 👤 Demo Credentials

**Username:** `ahmed`  
**Password:** `123456`

## 🔮 Future Enhancements

- **Database Integration**: Replace file storage with proper database
- **Multi-language Support**: Internationalization
- **Advanced Analytics**: More detailed reporting features
- **Mobile App**: React Native mobile application
- **Inventory Management**: Stock tracking and management
- **Multi-company Support**: Support for multiple businesses
- **Advanced Security**: JWT tokens, role-based permissions
- **Automated Backups**: Scheduled data backups
- **Integration APIs**: Connect with external services

## 📄 License

This project is private and proprietary.

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
