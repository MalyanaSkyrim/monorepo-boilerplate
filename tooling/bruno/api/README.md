# App Boilerplate API - Bruno Collection

This directory contains the Bruno API collection for testing the App Boilerplate API endpoints.

## Structure

```
api/
├── Auth/                      # Authentication endpoints
│   ├── Sign In.bru           # User sign in
│   └── Sign up.bru           # User sign up
├── API Health.bru            # Health check endpoint
└── environments/             # Environment configurations
    ├── Dev.bru              # Local development
    ├── Staging.bru          # Staging environment
    └── PROD.bru             # Production environment
```

## Getting Started

### 1. Install Bruno

Download and install Bruno from: https://www.usebruno.com/

### 2. Open the Collection

1. Open Bruno
2. Click "Open Collection"
3. Navigate to: `tooling/bruno/api`
4. Select the folder

### 3. Configure Environment

1. Select the environment (Dev, Staging, or PROD) from the dropdown
2. The `API_AUTH_URL` is pre-configured in each environment file

### 4. Test the API

Start by testing the Health Check:

1. Select "API Health" request
2. Click "Send"
3. You should see a 200 response with `{"status":"OK"}`

## Environment Variables

Each environment file contains:

| Variable       | Description         | Example                 |
| -------------- | ------------------- | ----------------------- |
| `API_AUTH_URL` | Base URL of the API | `http://localhost:4000` |

## API Endpoints

### Authentication (Public)

#### Sign Up

- **POST** `/v1/auth/signup`
- Creates a new user account
- Body: `{ "email", "password", "firstName", "lastName" }`

#### Sign In

- **POST** `/v1/auth/signin`
- Authenticates a user and returns JWT token
- Body: `{ "email", "password" }`
- Response includes `accessToken` and `user` object

### Health Check

#### API Health

- **GET** `/health`
- Checks if the API is running
- Response: `{ "status": "OK" }`

## Development Workflow

1. **Start the API**:

   ```bash
   cd apps/api-auth
   pnpm dev
   ```

2. **Test endpoints** using Bruno

3. **Iterate**: Make changes to your API and test immediately in Bruno

## Tips

1. **Use variables**: The `~` prefix in query parameters means the parameter is disabled by default. Remove `~` to enable it.

2. **Test authentication**: Use the Sign Up request to create a test user, then use Sign In to get a JWT token.

3. **Copy tokens**: After signing in, copy the `accessToken` from the response to use in authenticated requests (if implemented in the future).

## Troubleshooting

### 404 Not Found

- Check the URL path is correct
- Verify the API is running
- Make sure you're using the correct environment

### 400 Bad Request

- Check the request body format
- Verify required fields are present
- Check data types match the schema

Happy testing! 🚀
