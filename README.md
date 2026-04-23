# MediSync - Hospital Appointment Management System

A comprehensive hospital appointment management system built with React (TypeScript) frontend and ASP.NET Core backend, designed to streamline healthcare appointment scheduling and management.

## 🌟 Features

### 🔐 Authentication & Authorization
- **JWT-based Authentication**: Secure token-based authentication system
- **Role-based Access Control**: Support for Admin, Doctor, and Receptionist roles
- **User Registration**: Self-service account creation with email validation
- **Password Security**: SHA256 hashing with salt for secure password storage

### 📅 Appointment Management
- **Full CRUD Operations**: Create, Read, Update, Delete appointments
- **Advanced Search & Filtering**: Filter by patient name, doctor, status, priority, and date range
- **Doctor Selection Dropdown**: Dynamic dropdown populated with available doctors
- **Priority Levels**: Low, Medium, High, Urgent classification
- **Status Tracking**: Scheduled, Completed, Cancelled, NoShow management
- **Pagination**: Efficient handling of large appointment datasets

### 🎨 Modern UI/UX
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Professional Healthcare Theme**: Clean, medical-focused interface
- **Real-time Feedback**: Toast notifications for user actions
- **Form Validation**: Comprehensive client-side and server-side validation
- **Loading States**: Smooth loading indicators and skeleton screens

### 🛡️ Security & Reliability
- **Input Sanitization**: Automatic data cleaning and validation
- **CORS Configuration**: Secure cross-origin resource sharing
- **Error Handling**: Comprehensive error management with user-friendly messages
- **Data Integrity**: Database constraints and validation rules

## 🏗️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **React Hook Form** with Zod validation
- **Axios** for API communication
- **React Hot Toast** for notifications
- **Lucide React** for icons

### Backend
- **ASP.NET Core 9.0** Web API
- **Entity Framework Core** with SQL Server
- **JWT Authentication** with custom middleware
- **Raw SQL** for complex queries
- **Swagger/OpenAPI** documentation

### Database
- **SQL Server** (LocalDB or full instance)
- **Entity Framework Migrations**
- **Optimized indexing** for performance

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **.NET 9.0 SDK**
- **SQL Server** (LocalDB or full instance)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/medisync.git
   cd medisync
   ```

2. **Setup Backend**
   ```bash
   cd MediSyncAPI
   
   # Restore dependencies
   dotnet restore
   
   # Update connection string in appsettings.json
   # Then create database
   sqlcmd -S localhost -i ../CREATE_DATABASE.sql
   
   # Run migrations
   dotnet ef database update
   
   # Start backend
   dotnet run
   ```

3. **Setup Frontend**
   ```bash
   # In a new terminal, from project root
   npm install
   
   # Start development server
   npm run dev
   ```

4. **Access the Application**
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:5086
   - **Swagger Documentation**: http://localhost:5086/swagger

## 🔧 Configuration

### Backend Configuration (`appsettings.json`)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=localhost;Database=MediSyncDb;Trusted_Connection=true;TrustServerCertificate=true;"
  },
  "Jwt": {
    "Key": "your-super-secret-key-here-make-it-long-and-secure",
    "Issuer": "MediSyncAPI",
    "Audience": "MediSyncApp"
  }
}
```

### Environment Variables
```bash
# Development
ASPNETCORE_ENVIRONMENT=Development

# Production
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection="your-production-connection-string"
Jwt__Key="your-production-jwt-key"
```

## 📚 API Documentation

### Authentication Endpoints

#### POST /api/auth/login
```json
{
  "email": "admin@medisync.com",
  "password": "admin123"
}
```

#### POST /api/auth/register
```json
{
  "email": "doctor@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Smith",
  "role": "Doctor"
}
```

#### GET /api/auth/doctors
Returns all users with "Doctor" role for appointment form dropdown.

### Appointment Endpoints

#### GET /api/appointments
- Query parameters: `search`, `doctorName`, `status`, `priority`, `dateFrom`, `dateTo`, `pageNumber`, `pageSize`
- Returns paginated appointment list with filtering

#### POST /api/appointments
```json
{
  "patientName": "Jane Doe",
  "patientEmail": "jane@example.com",
  "patientPhone": "123-456-7890",
  "doctorName": "Dr. Smith",
  "appointmentDate": "2026-04-25",
  "appointmentTime": "10:00",
  "priority": "Medium",
  "notes": "Regular checkup"
}
```

#### PUT /api/appointments/{id}
Update existing appointment with same structure as POST.

#### DELETE /api/appointments/{id}
Delete appointment by ID.

## 🧪 Testing

### Default Test Accounts
| Email | Password | Role |
|-------|----------|------|
| admin@medisync.com | admin123 | Admin |
| doctor@medisync.com | doctor123 | Doctor |
| receptionist@medisync.com | receptionist123 | Receptionist |

### Setup Test Data
```bash
# Initialize default passwords
curl -X POST http://localhost:5086/api/auth/setup-default-passwords

# Check API health
curl http://localhost:5086/api/test/health
```

## 📁 Project Structure

```
medisync/
├── src/                          # React frontend
│   ├── components/
│   │   ├── Appointments/         # Appointment-related components
│   │   ├── Auth/                 # Authentication components
│   │   └── Layout/               # Layout components
│   ├── contexts/                 # React contexts
│   ├── hooks/                    # Custom hooks
│   ├── pages/                    # Page components
│   ├── services/                 # API services
│   └── types/                    # TypeScript type definitions
├── MediSyncAPI/                  # ASP.NET Core backend
│   ├── Controllers/              # API controllers
│   ├── Data/                     # Entity Framework context
│   ├── Models/                   # Data models and DTOs
│   ├── Migrations/               # EF Core migrations
│   └── Properties/               # Launch settings
├── public/                       # Static assets
├── docs/                         # Documentation files
└── sql/                          # Database scripts
```

## 🔒 Security Features

- **JWT Token Authentication** with secure key management
- **Password Hashing** using SHA256 with salt
- **Input Validation** on both client and server side
- **CORS Policy** configured for secure cross-origin requests
- **SQL Injection Prevention** through parameterized queries
- **XSS Protection** through proper data sanitization

## 🚀 Deployment

### Frontend Deployment
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend Deployment
```bash
# Publish for production
dotnet publish -c Release -o ./publish

# Run in production
cd publish
dotnet MediSyncAPI.dll
```

### Docker Support (Optional)
```dockerfile
# Frontend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]

# Backend Dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY ./publish .
EXPOSE 80
ENTRYPOINT ["dotnet", "MediSyncAPI.dll"]
```

## 📊 Performance Features

- **Lazy Loading**: Components loaded on demand
- **Pagination**: Efficient data loading for large datasets
- **Caching**: API response caching where appropriate
- **Optimized Queries**: Database queries optimized with proper indexing
- **Bundle Splitting**: Optimized JavaScript bundles

## 🛠️ Development

### Available Scripts

#### Frontend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking
```

#### Backend
```bash
dotnet run                    # Start development server
dotnet build                  # Build project
dotnet test                   # Run tests
dotnet ef migrations add      # Add new migration
dotnet ef database update     # Update database
```

### Code Quality
- **ESLint** and **Prettier** for code formatting
- **TypeScript** for type safety
- **Zod** for runtime validation
- **React Hook Form** for form management

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed
- Ensure responsive design compatibility

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **API Documentation**: Visit `/swagger` when running the backend
- **Issues**: Create an issue on GitHub for bugs or feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas

## 🎯 Roadmap

### Upcoming Features
- [ ] **Email Notifications**: Appointment reminders and confirmations
- [ ] **Calendar Integration**: Sync with external calendar systems
- [ ] **Reporting Dashboard**: Analytics and appointment statistics
- [ ] **Mobile App**: React Native mobile application
- [ ] **Multi-language Support**: Internationalization (i18n)
- [ ] **Advanced Search**: Full-text search capabilities
- [ ] **File Attachments**: Upload and manage appointment-related files
- [ ] **Audit Trail**: Track all system changes and user actions

### Technical Improvements
- [ ] **Real-time Updates**: WebSocket integration for live updates
- [ ] **Offline Support**: PWA capabilities for offline functionality
- [ ] **Performance Monitoring**: Application performance insights
- [ ] **Automated Testing**: Comprehensive test suite
- [ ] **CI/CD Pipeline**: Automated deployment pipeline

## 🏆 Acknowledgments

- **React Team** for the amazing frontend framework
- **Microsoft** for ASP.NET Core and Entity Framework
- **Tailwind CSS** for the utility-first CSS framework
- **Lucide** for the beautiful icon set
- **Community Contributors** for their valuable feedback and contributions

---

**Built with ❤️ for healthcare professionals**

*MediSync - Streamlining healthcare, one appointment at a time.*