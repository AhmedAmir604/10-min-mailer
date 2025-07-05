# 10 Minute Mail Service

A temporary email service built with Next.js that provides disposable email addresses that automatically expire. Perfect for testing, registrations, and avoiding spam.

## 🎯 Features

- **Temporary Email Generation**: Create email addresses that expire in 10 minutes, 30 minutes, 1 hour, or 24 hours
- **Real-time Email Reception**: Receive and display emails instantly
- **Clean UI**: Modern, responsive interface built with Tailwind CSS
- **AWS Integration**: Uses AWS SES for email reception and S3 for storage
- **Auto-cleanup**: Emails automatically deleted when they expire
- **Custom Prefixes**: Option to use custom email prefixes
- **Attachment Support**: View email attachments
- **Mobile Responsive**: Works on all devices

## 🏗️ Architecture

```
Email → AWS SES → S3 Bucket → Lambda Function → Next.js API → MongoDB → Frontend
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: MongoDB
- **Email**: AWS SES, AWS S3
- **Processing**: AWS Lambda
- **Icons**: Lucide React
- **Deployment**: Vercel (Frontend), AWS (Backend services)

## 📋 Prerequisites

1. **AWS Account** with:
   - SES configured for your domain
   - S3 bucket for email storage
   - Lambda function permissions

2. **MongoDB Database** (local or MongoDB Atlas)

3. **Domain Name** configured with AWS SES

## 🚀 Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory:

```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
S3_BUCKET_NAME=your-s3-bucket-name

# Database
MONGODB_URI=mongodb://localhost:27017/tenminmail
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tenminmail

# Domain Configuration
DOMAIN_NAME=yourdomain.com

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Install Dependencies

```bash
npm install
```

### 3. AWS SES Configuration

1. **Verify your domain** in AWS SES console
2. **Create MX record** pointing to AWS SES:
   ```
   10 inbound-smtp.us-east-1.amazonaws.com
   ```
3. **Configure SES Receipt Rule**:
   - Action: Store in S3 bucket
   - S3 bucket: Your configured bucket
   - Object key prefix: `emails/`

### 4. AWS Lambda Setup

1. **Create Lambda function**:
   ```bash
   cd aws-lambda
   npm install
   zip -r email-processor.zip .
   ```

2. **Deploy to AWS Lambda**:
   - Runtime: Node.js 18.x
   - Handler: email-processor.handler
   - Environment variables:
     ```
     API_ENDPOINT=https://yourdomain.com
     AWS_REGION=us-east-1
     ```

3. **Configure S3 Trigger**:
   - Event type: All object create events
   - Prefix: `emails/`

### 5. Database Setup

If using local MongoDB:
```bash
# Start MongoDB
mongod

# The application will automatically create collections
```

If using MongoDB Atlas:
- Create a cluster
- Get connection string
- Update MONGODB_URI in .env.local

### 6. Run the Application

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

Visit `http://localhost:3000` to see your 10-minute mail service!

## 📧 How It Works

1. **Email Generation**: User generates a temporary email address
2. **Email Reception**: AWS SES receives emails for your domain
3. **Storage**: SES stores raw emails in S3 bucket
4. **Processing**: Lambda function triggers on S3 uploads
5. **Parsing**: Lambda parses email and calls your API
6. **Database**: Email stored in MongoDB with expiry
7. **Display**: Frontend shows emails in real-time
8. **Cleanup**: Expired emails automatically deleted

## 🔧 API Endpoints

- `POST /api/generate-email` - Generate temporary email
- `GET /api/emails/[emailAddress]` - Get emails for address
- `POST /api/emails/[emailAddress]/[emailId]/read` - Mark email as read
- `POST /api/process-s3-email` - Process email from S3 (internal)

## 🎨 Customization

### Email Duration Options

Edit `lib/services/emailGenerator.ts` to modify available durations:

```typescript
const durationOptions = [
  { value: '10min', label: '10 Minutes' },
  { value: '30min', label: '30 Minutes' },
  { value: '1hour', label: '1 Hour' },
  { value: '24hours', label: '24 Hours' },
];
```

### UI Styling

Modify `tailwind.config.js` and component styles to match your brand.

### Domain Configuration

Update `DOMAIN_NAME` environment variable to use your domain.

## 🚦 Troubleshooting

### Common Issues

1. **Emails not appearing**:
   - Check AWS SES receipt rules
   - Verify S3 bucket permissions
   - Check Lambda function logs

2. **Database connection errors**:
   - Verify MongoDB is running
   - Check MONGODB_URI format
   - Ensure network access for MongoDB Atlas

3. **Email generation fails**:
   - Check environment variables
   - Verify database connection
   - Check browser console for errors

### Debugging

1. **Check Lambda logs**:
   ```bash
   aws logs describe-log-groups --log-group-name-prefix /aws/lambda/your-function-name
   ```

2. **Monitor S3 bucket**:
   - Verify emails are being stored
   - Check object permissions

3. **Database queries**:
   ```bash
   # Connect to MongoDB
   mongo
   use tenminmail
   db.tempemails.find()
   db.emails.find()
   ```

## 📈 Scaling

### Production Considerations

1. **Rate Limiting**: Implement rate limiting to prevent abuse
2. **CAPTCHA**: Add CAPTCHA for email generation
3. **CDN**: Use CloudFront for static assets
4. **Monitoring**: Set up CloudWatch alarms
5. **Backup**: Configure database backups

### Performance Optimization

1. **Database Indexing**: Ensure proper indexes on email addresses and expiry dates
2. **Caching**: Implement Redis for session storage
3. **Lambda Optimization**: Optimize Lambda function cold starts

## 🔒 Security

- Emails automatically expire and are deleted
- No personal information stored
- Rate limiting recommended for production
- HTTPS recommended for production deployment

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review AWS SES documentation
3. Open an issue on GitHub

---

**Note**: This is a complete, production-ready 10-minute mail service. Make sure to configure all AWS services properly and secure your environment variables. 