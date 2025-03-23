#!/bin/sh
# Adjust permissions for the .next directory (or /app as needed)
chmod -R 777 /app/.next
exec "$@"
