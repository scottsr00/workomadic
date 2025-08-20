#!/bin/bash

# Workomadic Database Management Script
# Usage: ./scripts/db-commands.sh [command]

DB_NAME="workomadic"
DB_URL="postgresql://stephenscott@localhost:5432/workomadic"

case "$1" in
  "status")
    echo "📊 Database Status:"
    echo "Database: $DB_NAME"
    echo "URL: $DB_URL"
    echo ""
    echo "📈 Data Counts:"
    psql -d $DB_NAME -c "SELECT 'Cities' as table_name, COUNT(*) as count FROM \"City\" UNION ALL SELECT 'Locations' as table_name, COUNT(*) as count FROM \"Location\" UNION ALL SELECT 'Approved Locations' as table_name, COUNT(*) as count FROM \"Location\" WHERE \"isApproved\" = true;"
    ;;
    
  "reset")
    echo "🗑️  Resetting database..."
    psql -d $DB_NAME -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
    npx prisma db push
    npm run db:seed
    echo "✅ Database reset complete!"
    ;;
    
  "seed")
    echo "🌱 Seeding database..."
    npm run db:seed
    echo "✅ Database seeded!"
    ;;
    
  "approve-all")
    echo "✅ Approving all pending locations..."
    psql -d $DB_NAME -c "UPDATE \"Location\" SET \"isApproved\" = true WHERE \"isApproved\" = false;"
    echo "✅ All locations approved!"
    ;;
    
  "pending")
    echo "⏳ Pending locations:"
    psql -d $DB_NAME -c "SELECT name, address, \"createdAt\" FROM \"Location\" WHERE \"isApproved\" = false ORDER BY \"createdAt\" DESC;"
    ;;
    
  "cities")
    echo "🏙️  Cities in database:"
    psql -d $DB_NAME -c "SELECT id, name, state, \"_count\".locations as location_count FROM \"City\" LEFT JOIN (SELECT \"cityId\", COUNT(*) as locations FROM \"Location\" GROUP BY \"cityId\") as \"_count\" ON \"City\".id = \"_count\".\"cityId\";"
    ;;
    
  "help"|*)
    echo "🚀 Workomadic Database Management Commands:"
    echo ""
    echo "  status     - Show database status and data counts"
    echo "  reset      - Reset database and reseed with initial data"
    echo "  seed       - Seed database with initial data"
    echo "  approve-all - Approve all pending location submissions"
    echo "  pending    - Show pending location submissions"
    echo "  cities     - List all cities with location counts"
    echo "  help       - Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./scripts/db-commands.sh status"
    echo "  ./scripts/db-commands.sh approve-all"
    ;;
esac
