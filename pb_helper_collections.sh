#!/bin/bash

PB_URL="http://127.0.0.1:8090"
ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NjU4MTM3MjIsImlkIjoibHQwMnQ1OHAxeHdyajkzIiwidHlwZSI6ImFkbWluIn0.UOsB9kOi0hM7VxntnXhCexK-gDxulZRTDtAgysj3xfk"

page=1
per_page=50

while true; do
    echo "Fetching page $page ..."

    response=$(curl -s -X GET "$PB_URL/api/collections?page=$page&perPage=$per_page" \
      -H "Authorization: Admin $ADMIN_TOKEN")

    # Validate JSON
    if ! echo "$response" | jq empty 2>/dev/null; then
        echo "❌ ERROR: Invalid JSON returned. Response was:"
        echo "$response"
        break
    fi

    items_count=$(echo "$response" | jq '.items | length')
    total_pages=$(echo "$response" | jq '.totalPages')

    if [ "$items_count" -eq 0 ]; then
        echo "✔ No more items. Done."
        break
    fi

    # Process the items
    echo "$response" | jq '.items'

    # Check for last page
    if [ "$page" -ge "$total_pages" ]; then
        echo "✔ Reached last page ($total_pages). Completed."
        break
    fi

    page=$((page+1))
done
