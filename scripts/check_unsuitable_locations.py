#!/usr/bin/env python3

import os
import psycopg2
from psycopg2.extras import RealDictCursor
import re
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables
load_dotenv('.env.local')

# Database connection
DATABASE_URL = os.getenv('DATABASE_URL')

# Keywords that indicate unsuitable business types
UNSUITABLE_KEYWORDS = [
    # Entertainment/Recreation (excluding bars/pubs that might have daytime hours)
    'club', 'nightclub', 'lounge', 'karaoke', 'dance',
    'movie', 'theater', 'cinema', 'bowling', 'arcade', 'game', 'gaming',
    'gym', 'fitness', 'yoga', 'pilates', 'crossfit', 'workout',
    'spa', 'massage', 'salon', 'barber', 'beauty', 'nail',
    'tattoo', 'piercing', 'tanning',
    
    # Retail (specific types)
    'comic', 'bookstore', 'toy', 'game store', 'music store', 'record',
    'clothing', 'fashion', 'jewelry', 'shoe', 'accessory',
    'electronics', 'phone', 'computer store',
    'grocery', 'supermarket', 'convenience', 'liquor', 'wine',
    
    # Food service (fast food, takeout focused)
    'fast food', 'drive-thru', 'takeout', 'delivery', 'pizza',
    'burger', 'taco', 'sandwich', 'subway', 'mcdonalds', 'kfc',
    
    # Services
    'bank', 'credit union', 'atm', 'post office', 'mail',
    'car wash', 'auto', 'mechanic', 'repair', 'service',
    'dry cleaner', 'laundry', 'tailor',
    
    # Healthcare
    'dentist', 'doctor', 'medical', 'clinic', 'pharmacy',
    'veterinary', 'vet', 'pet hospital',
    
    # Other
    'gas station', 'fuel', 'tobacco', 'vape', 'smoke',
    'pawn', 'payday', 'check cashing',
]

# Bar/pub keywords that need special hour checking
BAR_KEYWORDS = ['bar', 'pub']

# Night-only indicators
NIGHT_KEYWORDS = [
    'night', 'evening', 'late', 'after hours', '5pm', '6pm', '7pm', '8pm', '9pm',
    'closes at', 'open until', 'til', 'until'
]

def connect_to_db():
    """Connect to the database"""
    try:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        print(f"Error connecting to database: {e}")
        return None

def check_unsuitable_locations():
    """Find locations that might not be suitable for remote work"""
    conn = connect_to_db()
    if not conn:
        return
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            # Get all approved locations
            cur.execute("""
                SELECT id, name, description, hours, address, "cityId"
                FROM "Location"
                WHERE "isApproved" = true
                ORDER BY name
            """)
            
            locations = cur.fetchall()
            unsuitable_locations = []
            
            print(f"Scanning {len(locations)} approved locations...\n")
            
            for location in locations:
                reasons = []
                
                # Check business name for unsuitable keywords
                name_lower = location['name'].lower()
                description_lower = location['description'].lower() if location['description'] else ''
                
                # Check for bar/pub keywords first (need special handling)
                is_bar_or_pub = False
                for bar_keyword in BAR_KEYWORDS:
                    if bar_keyword in name_lower or bar_keyword in description_lower:
                        is_bar_or_pub = True
                        break
                
                # Check other unsuitable keywords (excluding bars/pubs)
                if not is_bar_or_pub:
                    for keyword in UNSUITABLE_KEYWORDS:
                        if keyword in name_lower or keyword in description_lower:
                            reasons.append(f"Business type: {keyword}")
                            break
                
                # Special handling for bars/pubs - check if they have suitable daytime hours
                if is_bar_or_pub and location['hours']:
                    hours_text = location['hours']
                    hours_lower = hours_text.lower()
                    
                    # Check for daytime opening hours (before 12pm/noon)
                    has_daytime_hours = False
                    
                    # Look for opening times before noon
                    if re.search(r'(open|opens?|from)\s+(\d{1,2}):?(\d{2})?\s*([ap]m)', hours_lower):
                        open_matches = re.findall(r'(open|opens?|from)\s+(\d{1,2}):?(\d{2})?\s*([ap]m)', hours_lower)
                        for match in open_matches:
                            hour = int(match[1])
                            ampm = match[3].lower()
                            if ampm == 'am' or (ampm == 'pm' and hour < 12):
                                has_daytime_hours = True
                                break
                    
                    # Look for time ranges that start early
                    if re.search(r'(\d{1,2}):?(\d{2})?\s*([ap]m)\s*[-–—]\s*(\d{1,2}):?(\d{2})?\s*([ap]m)', hours_lower):
                        range_matches = re.findall(r'(\d{1,2}):?(\d{2})?\s*([ap]m)\s*[-–—]\s*(\d{1,2}):?(\d{2})?\s*([ap]m)', hours_lower)
                        for match in range_matches:
                            start_hour = int(match[0])
                            start_ampm = match[2].lower()
                            if start_ampm == 'am' or (start_ampm == 'pm' and start_hour < 12):
                                has_daytime_hours = True
                                break
                    
                    # If no daytime hours found, flag the bar/pub
                    if not has_daytime_hours:
                        reasons.append(f"Bar/pub with no daytime hours")
                
                # Check hours for night-only operations (for non-bar locations)
                if not is_bar_or_pub and location['hours']:
                    hours_text = location['hours']
                    hours_lower = hours_text.lower()
                    
                    # More sophisticated hours analysis
                    has_daytime_hours = False
                    has_night_only_hours = False
                    
                    # Look for time ranges (e.g., "6am-8pm", "9:00 AM - 10:00 PM")
                    time_ranges = re.findall(r'(\d{1,2}):?(\d{2})?\s*([ap]m)\s*[-–—]\s*(\d{1,2}):?(\d{2})?\s*([ap]m)', hours_lower)
                    for range_match in time_ranges:
                        start_hour = int(range_match[0])
                        start_ampm = range_match[2].lower()
                        end_hour = int(range_match[3])
                        end_ampm = range_match[5].lower()
                        
                        # Check if this range includes daytime hours
                        if start_ampm == 'am' or (start_ampm == 'pm' and start_hour < 12):
                            has_daytime_hours = True
                        
                        # Check if this range is night-only (starts after 5pm)
                        if (start_ampm == 'pm' and start_hour >= 5) or start_ampm == 'am':
                            # Only flag as night-only if it's the ONLY range and starts late
                            if start_ampm == 'pm' and start_hour >= 5:
                                has_night_only_hours = True
                    
                    # Look for opening times (e.g., "opens at 6am", "from 7:00 AM")
                    opening_times = re.findall(r'(open|opens?|from)\s+(\d{1,2}):?(\d{2})?\s*([ap]m)', hours_lower)
                    for open_match in opening_times:
                        hour = int(open_match[1])
                        ampm = open_match[3].lower()
                        if ampm == 'am' or (ampm == 'pm' and hour < 12):
                            has_daytime_hours = True
                        elif ampm == 'pm' and hour >= 5:
                            has_night_only_hours = True
                    
                    # Look for closing times (e.g., "closes at 6pm")
                    closing_times = re.findall(r'close(?:s|d)?\s+(?:at|by)?\s+(\d{1,2}):?(\d{2})?\s*([ap]m)', hours_lower)
                    for close_match in closing_times:
                        hour = int(close_match[0])
                        ampm = close_match[2].lower()
                        if ampm == 'pm' and hour <= 6:
                            # Only flag if it's the only closing time mentioned
                            if len(closing_times) == 1:
                                reasons.append(f"Closes early at {hour}{ampm}")
                    
                    # Check for night-only keywords that indicate evening-only operations
                    night_only_indicators = []
                    for night_keyword in ['night only', 'evening only', 'after hours', 'late night']:
                        if night_keyword in hours_lower:
                            night_only_indicators.append(night_keyword)
                    
                    if night_only_indicators:
                        reasons.append(f"Night-only indicators: {', '.join(night_only_indicators)}")
                    
                    # Only flag as night-only if we have no daytime hours and have night hours
                    if not has_daytime_hours and has_night_only_hours:
                        reasons.append("Night-only hours detected")
                    
                    # If no hours information could be parsed, don't flag it
                    if not time_ranges and not opening_times and not closing_times:
                        # Don't flag locations with unclear hours
                        pass
                
                if reasons:
                    unsuitable_locations.append({
                        'id': location['id'],
                        'name': location['name'],
                        'address': location['address'],
                        'reasons': reasons
                    })
            
            # Output results to file
            output_file = "unsuitable_locations_report.txt"
            
            with open(output_file, 'w') as f:
                f.write("UNSUITABLE LOCATIONS REPORT\n")
                f.write("=" * 50 + "\n")
                f.write(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                f.write(f"Total locations scanned: {len(locations)}\n\n")
                
                if unsuitable_locations:
                    f.write(f"Found {len(unsuitable_locations)} potentially unsuitable locations:\n\n")
                    f.write("ID".ljust(40) + "Name".ljust(40) + "Address".ljust(50) + "Reasons\n")
                    f.write("-" * 130 + "\n")
                    
                    for loc in unsuitable_locations:
                        f.write(f"{loc['id']:<40} {loc['name'][:38]:<40} {loc['address'][:48]:<50} {', '.join(loc['reasons'])}\n")
                    
                    f.write(f"\nTotal: {len(unsuitable_locations)} locations flagged as potentially unsuitable\n")
                else:
                    f.write("No unsuitable locations found!\n")
            
            print(f"Report saved to: {output_file}")
            print(f"Found {len(unsuitable_locations)} potentially unsuitable locations out of {len(locations)} total locations")
                
    except Exception as e:
        print(f"Error querying database: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    check_unsuitable_locations()
