# AI-Powered IT Support Ticket Prioritization System

This project is an AI-powered IT support request prioritization system. The system automatically evaluates incoming support requests with AI analysis and determines priority levels and assigns them to appropriate support levels (L1/L2).

## 🚀 Features

### Backend (Node.js + Express + MongoDB)

- **AI-Powered Prioritization**: AI analysis integrated with Ollama
- **Automatic Level Assignment**: L1/L2 assignment based on AI and SLA criteria
- **RESTful API**: Full CRUD operations
- **Dashboard Statistics**: Real-time analytics
- **MongoDB Integration**: Data persistence and performance

### Frontend (React + Vite + Tailwind CSS)

- **Modern UI/UX**: Responsive design
- **Dashboard**: Real-time statistics and charts
- **Ticket Management**: Create, list, update
- **AI Analysis**: Real-time complexity analysis
- **Filtering**: Status, level and SLA based filtering

## 🛠️ Technologies

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Ollama** - AI model integration

### Frontend

- **React 19** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Lucide React** - Icons

## 📋 Requirements

- Node.js (v18+)
- MongoDB (local or Atlas)
- Ollama (for AI model)

## 🚀 Installation

### 1. Clone the Project

```bash
git clone <repository-url>
cd IT_Helpdesk_System
```

### 2. Backend Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp env.example .env
# Edit the .env file

# Start MongoDB (local)
brew install mongodb-community
brew services start mongodb-community

# Install Ollama and download model
brew install ollama
ollama pull llama3
```

### 3. Frontend Setup

```bash
cd client
npm install --legacy-peer-deps
```

### 4. Start the Application

```bash
# Backend (in main directory)
npm run dev

# Frontend (new terminal)
cd client
npm run dev

# Or run both together
npm run dev:full
```

## 🌐 Access

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 📊 API Endpoints

### Tickets

- `GET /api/tickets` - List all tickets
- `GET /api/tickets/:id` - Get single ticket
- `POST /api/tickets` - Create new ticket
- `PUT /api/tickets/:id` - Update ticket
- `GET /api/tickets/stats/dashboard` - Dashboard statistics

### AI

- `POST /api/ai/analyze` - Perform AI analysis
- `GET /api/ai/health` - AI service status

### Health

- `GET /api/health` - System status

## 🎯 Usage

### 1. Dashboard

- View system general status
- Analyze ticket distribution
- Examine AI complexity distribution

### 2. Creating New Ticket

- Enter customer information
- Write problem description
- Click AI analyze button
- See automatic prioritization
- Create ticket

### 3. Ticket Management

- List existing tickets
- Use filtering options
- Make status updates
- Review details

## 🤖 AI Prioritization System

The system evaluates incoming support requests on a complexity level from 1-5:

- **1**: Very simple (password reset, simple printer problem)
- **2**: Simple (printer connection, email synchronization)
- **3**: Medium level (VPN outage, application error)
- **4**: Complex (network configuration, firewall settings)
- **5**: Very complex (system crash, data loss)

### Level Assignment Criteria

- **L2**: AI ≥ 4, SLA ≥ 3, or network problem
- **L1**: All other cases

## 📈 Dashboard Metrics

- Total request count
- Open/In Progress/Resolved distribution
- L1/L2 level distribution
- AI complexity distribution
- Resolution rate

## 🔧 Development

### Project Structure

```
IT_Helpdesk_System/
├── client/                 # Frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── ...
├── models/                # MongoDB models
├── routes/                # API routes
├── utils/                 # Helper functions
├── prompt/                # AI prompts
└── server.js             # Main server file
```

### Environment Variables

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/it-support-system
```

## 🧪 Test

### API Tests

```bash
# Health check
curl http://localhost:5000/api/health

# Create new ticket
curl -X POST http://localhost:5000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "customer_name": "Test Company",
    "sla_level": "Gold",
    "issue_description": "Network connection problem",
    "issue_type": "network",
    "ticket_source": "manual"
  }'

# List tickets
curl http://localhost:5000/api/tickets
```

## 🐛 Troubleshooting

### Common Problems

1. **MongoDB Connection Error**

   - Check if MongoDB is running
   - Verify connection string
   - Check network access

2. **Ollama AI Not Working**

   - Make sure Ollama is installed: `brew install ollama`
   - Download model: `ollama pull llama3`
   - Check if service is running: `ollama serve`

3. **Frontend Build Error**
   - Delete node_modules: `rm -rf node_modules`
   - Clean install: `npm install --legacy-peer-deps`

## 🤝 Support

If you encounter any issues:

1. Check the troubleshooting section above
2. Review the logs in the terminal
3. Add detailed error description

## 🚀 Future Improvements

- [ ] User authorization system
- [ ] Email notifications
- [ ] Advanced reporting
- [ ] Mobile application
- [ ] Slack integration
- [ ] Advanced AI analytics
- [ ] Multi-language support

**Note**: This system is designed to automate IT support processes and increase efficiency. AI analysis reduces human intervention while providing accurate prioritization.
