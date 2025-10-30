import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3000'),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    name: process.env.DB_NAME || 'array_eats',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET || 'change_this_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'change_this_refresh_secret',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
    from: process.env.EMAIL_FROM || 'noreply@array.com',
  },
  
  company: {
    allowedEmailDomain: process.env.ALLOWED_EMAIL_DOMAIN || 'array.com',
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },
  
  talabat: {
    apiKey: process.env.TALABAT_API_KEY || '',
    apiUrl: process.env.TALABAT_API_URL || 'https://api.talabat.com/v1',
    enabled: process.env.TALABAT_ENABLED === 'true',
  },
  
  companyAddress: {
    street: process.env.COMPANY_DELIVERY_STREET || '',
    building: process.env.COMPANY_DELIVERY_BUILDING || '',
    floor: process.env.COMPANY_DELIVERY_FLOOR || '',
    city: process.env.COMPANY_DELIVERY_CITY || 'Manama',
    area: process.env.COMPANY_DELIVERY_AREA || '',
    phone: process.env.COMPANY_DELIVERY_PHONE || '',
  },
};
