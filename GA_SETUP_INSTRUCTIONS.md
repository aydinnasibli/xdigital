# Google Analytics Configuration

# Public GA Measurement ID (for client-side tracking)
# Get this from: Google Analytics > Admin > Data Streams > Web > Measurement ID
# Format: G-XXXXXXXXXX
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Google Analytics Property ID (for server-side data API)
# Get this from: Google Analytics > Admin > Property Settings
# Format: 123456789 (just the numbers)
GOOGLE_ANALYTICS_PROPERTY_ID=123456789

# Google Analytics Service Account Credentials (for server-side data API)
# This should be a JSON string containing your service account key
# Steps to get this:
# 1. Go to Google Cloud Console > IAM & Admin > Service Accounts
# 2. Create a service account or use existing one
# 3. Download the JSON key file
# 4. Copy the entire JSON content and paste it as a single line here
# 5. In Google Analytics Admin, add the service account email (from JSON) with "Viewer" role
GOOGLE_ANALYTICS_CREDENTIALS='{"type":"service_account","project_id":"your-project","private_key_id":"xxx","private_key":"-----BEGIN PRIVATE KEY-----\nxxx\n-----END PRIVATE KEY-----\n","client_email":"xxx@xxx.iam.gserviceaccount.com","client_id":"xxx","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"xxx"}'

# Setup Instructions:
#
# 1. Create/Use Google Cloud Project:
#    - Go to https://console.cloud.google.com
#    - Create new project or select existing
#
# 2. Enable Google Analytics Data API:
#    - Navigate to APIs & Services > Library
#    - Search for "Google Analytics Data API"
#    - Click Enable
#
# 3. Create Service Account:
#    - Go to APIs & Services > Credentials
#    - Create Credentials > Service Account
#    - Download JSON key file
#
# 4. Grant Analytics Access:
#    - Go to Google Analytics Admin
#    - Property Settings > Property Access Management
#    - Add service account email with Viewer role
#
# 5. Install Required Package:
#    npm install @google-analytics/data
