Command:

curl -X POST http://localhost:3000/api/secondchance/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!"}'

Expected successful response:

{
  "message": "Login successful",
  "token": "...",
  "user": {
    "_id": "...",
    "name": "Test User",
    "email": "test@example.com"
  }
}

Replace the placeholder output with the real terminal output before submitting Task 13.
