#!/bin/bash

# Load environment variables from .env file
set -a
[ -f .env ] && . .env
set +a

curl --request POST \
  --url 'https://api.onesignal.com/notifications?c=push' \
  --header "Authorization: Key $API_KEY" \
  --header 'Content-Type: application/json' \
  --data "{
  \"app_id\": \"$APP_ID\",
  \"contents\": {
    \"en\": \"Default message.\"
  },
  \"include_aliases\": {
    \"external_id\": [
      \"$EXTERNAL_ID\"
    ]
  },
  \"target_channel\": \"push\",
  \"headings\": {
    \"en\": \"Test Notification\"
  },
  \"subtitle\": {
    \"en\": \"Test Subtitle\"
  },
  \"name\": \"abc123\",
  \"data\": {
    \"route\": \"Search\",
    \"basket\": [
      {
        \"sku\": \"12qw3er56y\",
        \"itemName\": \"Hand-crafted Peppermint Candy Canes\",
        \"qty\": 3,
        \"cost\": \"9.99\"
      },
      {
        \"sku\": \"90ujr5383\",
        \"itemName\": \"Fat Squirrel\",
        \"qty\": 1,
        \"cost\": \"29.99\"
      }
    ]
  }
}"
