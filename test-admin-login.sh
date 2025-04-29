#!/bin/bash

# First, get a CSRF token by visiting any endpoint that sets cookies
echo "Getting CSRF token..."
curl -s -c cookies.txt http://localhost:5000/api/professional-profiles/featured > /dev/null

# Extract CSRF token from cookies
CSRF_TOKEN=$(grep -oP 'XSRF-TOKEN\s+\K[^;]+' cookies.txt)
echo "CSRF Token: $CSRF_TOKEN"

# Now use the token and cookies for the login request
echo "Attempting admin login..."
curl -X POST http://localhost:5000/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $CSRF_TOKEN" \
  -b cookies.txt \
  -v \
  -d '{
    "email": "admin@example.com", 
    "password": "password123"
  }'

echo -e "\n"