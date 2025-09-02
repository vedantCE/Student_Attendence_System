# Student Attendance Management Frontend

A modern React frontend for the Student Attendance Management System with beautiful UI and smooth animations.

## 🚀 Features

- **Modern UI**: Built with TailwindCSS and shadcn/ui components
- **Smooth Animations**: Framer Motion for page transitions and interactions
- **Interactive Charts**: Recharts for attendance visualization
- **Role-based Access**: Different dashboards for Students and Faculty
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Toast notifications for user feedback

## 🛠️ Tech Stack

- **React 19** - Frontend framework
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **shadcn/ui** - UI components
- **Framer Motion** - Animations
- **Recharts** - Charts and graphs
- **React Router** - Navigation
- **Axios** - API calls
- **React Hot Toast** - Notifications

## 📱 Pages & Features

### Authentication
- **Login/Register Page** with role selection (Student/Faculty)
- JWT token-based authentication
- Protected routes

### Student Features
- **Dashboard**: View today's classes and mark attendance
- **Attendance History**: View past attendance with charts
- **Profile**: Personal information display

### Faculty Features
- **Dashboard**: View classes and attendance reports
- **Class Management**: View all created classes
- **Attendance Reports**: Detailed student attendance with charts

## 🎨 UI Components

- **Cards**: Clean card layouts for content
- **Buttons**: Multiple variants (primary, secondary, outline, etc.)
- **Forms**: Styled input fields with validation
- **Charts**: Pie charts and bar charts for data visualization
- **Navigation**: Responsive navbar and sidebar
- **Animations**: Smooth page transitions and hover effects

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## 🔧 Configuration

The frontend is configured to connect to the backend at `http://localhost:5000/api`. Update the API base URL in `src/services/api.js` if needed.

## 📊 Demo Login Credentials

**Admin/Faculty:**
- Email: admin@demo.com, Password: admin

**Student:**
- Email: student@demo.com, Password: student123

## Other Sample Credentials

**Faculty:**
- Email: john.smith@university.edu, Password: password123

**Students:**
- Email: alice.brown@student.edu, Password: password123
- Email: bob.wilson@student.edu, Password: password123

## 🎯 Usage Flow

1. **Login** with your credentials
2. **Student**: View today's classes → Mark attendance → View history
3. **Faculty**: View classes → Check attendance reports → View notifications

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   └── layout/       # Layout components
├── pages/            # Page components
├── hooks/            # Custom React hooks
├── services/         # API service layer
├── lib/              # Utility functions
└── utils/            # Helper functions
```

## 🎨 Design System

- **Colors**: Modern blue-based color palette
- **Typography**: Clean, readable fonts
- **Spacing**: Consistent spacing scale
- **Shadows**: Subtle shadows for depth
- **Animations**: Smooth, purposeful animations

The frontend provides a complete, production-ready interface for the Student Attendance Management System with modern design patterns and excellent user experience.