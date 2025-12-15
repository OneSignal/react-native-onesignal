#!/bin/bash

# Load environment variables from .env file
set -a
[ -f .env ] && . .env
set +a

# Test data
read -r -d '' TEST_DATA_1 << 'EOF'
{
  "route": "Search",
  "basket": [
    {
      "sku": "12qw3er56y",
      "itemName": "Hand-crafted Peppermint Candy Canes",
      "qty": 3,
      "cost": "9.99"
    },
    {
      "sku": "90ujr5383",
      "itemName": "Fat Squirrel",
      "qty": 1,
      "cost": "29.99"
    }
  ]
}
EOF

read -r -d '' TEST_DATA_2 << 'EOF'
{
  "route": "ComplexTest",
  "stringValue": "test string",
  "booleanValue": true,
  "integerValue": 42,
  "doubleValue": 3.14159,
  "nullValue": null,
  "stringArray": ["apple", "banana", "cherry"],
  "numberArray": [1, 2, 3, 4, 5],
  "booleanArray": [true, false, true],
  "mixedArray": [
    "string item",
    123,
    45.67,
    true,
    false,
    null,
    {
      "nestedString": "value",
      "nestedNumber": 999,
      "nestedBoolean": false
    },
    [
      "nested array item 1",
      "nested array item 2",
      789
    ]
  ],
  "nestedObjects": {
    "level1": {
      "level2": {
        "level3": {
          "deepValue": "deeply nested",
          "deepNumber": 1000,
          "deepArray": [1, 2, 3]
        }
      }
    }
  },
  "arrayOfObjects": [
    {
      "id": 1,
      "name": "Item One",
      "active": true,
      "price": 19.99,
      "tags": ["tag1", "tag2"]
    },
    {
      "id": 2,
      "name": "Item Two",
      "active": false,
      "price": 29.99,
      "tags": ["tag3"],
      "metadata": {
        "created": "2024-01-01",
        "updated": null
      }
    },
    {
      "id": 3,
      "name": null,
      "active": true,
      "price": 0,
      "tags": []
    }
  ],
  "nestedArrays": [
    [1, 2, 3],
    ["a", "b", "c"],
    [true, false],
    [
      {
        "item": "nested in array in array",
        "value": 42
      }
    ]
  ],
  "emptyArray": [],
  "emptyObject": {}
}
EOF

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
  \"data\": $TEST_DATA_2
}"
