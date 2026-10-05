# Authentication System

This directory contains authentication utilities for the API.

## 🔐 **Current Authentication**

The API currently uses user-based authentication with JWT tokens. All routes are public (health check and auth endpoints).

## 📁 **Files**

### **`auth.ts`** - Authentication Utilities

**Note**: This file contains API key management functions that are currently unused. These functions reference database models (`ApiKey`, `Store`) that were removed during cleanup. They are kept for potential future use but will need to be updated if API key authentication is re-implemented.

### **Current Auth Flow**

1. **Signup**: Users can create accounts via `/v1/auth/signup`
2. **Signin**: Users authenticate via `/v1/auth/signin` and receive JWT tokens
3. **User Model**: Authentication uses the `User` model (not Customer/Store)

## 🚀 **Future Enhancements**

- API key authentication (if needed)
- Role-based access control
- Rate limiting per user
- Refresh token support
