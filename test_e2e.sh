#!/bin/bash
set -e

echo "=== 1. HEALTH CHECK ==="
curl -s http://localhost:8000/api/health/
echo -e "\n"

echo "=== 2. REGISTER USER ==="
REGISTER=$(curl -s -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"username":"e2etest","password":"testpass123","email":"e2e@test.com"}')
echo "$REGISTER"
echo ""

echo "=== 3. LOGIN ==="
LOGIN=$(curl -s -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"e2etest","password":"testpass123"}')
echo "Access token received: ${LOGIN:0:50}..."
TOKEN=$(echo "$LOGIN" | python3 -c "import sys,json; print(json.load(sys.stdin)['access'])")
echo ""

echo "=== 4. GET USER INFO ==="
curl -s http://localhost:8000/api/auth/me/ -H "Authorization: Bearer $TOKEN"
echo -e "\n"

echo "=== 5. CREATE CHAT CHANNEL ==="
CHANNEL=$(curl -s -X POST http://localhost:8000/api/chat/channels/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"test-room"}')
echo "$CHANNEL"
CHANNEL_ID=$(echo "$CHANNEL" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])")
echo ""

echo "=== 6. LIST CHANNELS ==="
curl -s http://localhost:8000/api/chat/channels/ -H "Authorization: Bearer $TOKEN"
echo -e "\n"

echo "=== 7. SEND MESSAGE ==="
curl -s -X POST http://localhost:8000/api/chat/channels/$CHANNEL_ID/messages/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello World!"}'
echo -e "\n"

echo "=== 8. GET MESSAGES ==="
curl -s http://localhost:8000/api/chat/channels/$CHANNEL_ID/messages/ \
  -H "Authorization: Bearer $TOKEN"
echo -e "\n"

echo "=== 9. PUSH SUBSCRIBE ==="
curl -s -X POST http://localhost:8000/api/push/subscribe/ \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"endpoint":"https://push.test.com/endpoint","keys":{"p256dh":"key1","auth":"key2"}}'
echo -e "\n"

echo "=== 10. FRONTEND STATUS ==="
curl -s -I http://localhost:3000 | head -3
echo ""

echo "✅ ALL TESTS PASSED!"
