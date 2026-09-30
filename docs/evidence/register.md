Command:

curl -X POST http://localhost:3000/api/secondchance/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Password123!"}'

Expected successful response:

{
  "message": "User registered successfully",
  "user": {
    "_id": "...",
    "name": "Test User",
    "email": "test@example.com",
    "createdAt": "...",
    "updatedAt": "..."
  }
}

Replace the placeholder output with the real terminal output before submitting Task 12.
