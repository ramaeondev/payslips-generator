# Enable Email Confirmation in Supabase

## Option 1: Via Supabase Studio (Recommended)

1. Access Supabase Studio: `http://157.245.105.249:8000`
2. Go to **Authentication** → **Settings**
3. Find **Email Confirmation**
4. Toggle **Enable email confirmations** to ON
5. Configure SMTP settings for sending emails

## Option 2: Via Configuration File

Edit your Supabase `.env` or `kong.yml`:

```bash
# SSH to server
ssh -i ~/.ssh/devpad-digiocean root@157.245.105.249

# Navigate to Supabase directory
cd /path/to/supabase/docker

# Edit .env file
nano .env
```

Add or update these settings:

```env
# Email confirmation settings
GOTRUE_MAILER_AUTOCONFIRM=false
GOTRUE_SMTP_HOST=smtp.gmail.com
GOTRUE_SMTP_PORT=587
GOTRUE_SMTP_USER=your-email@gmail.com
GOTRUE_SMTP_PASS=your-app-password
GOTRUE_SMTP_ADMIN_EMAIL=your-email@gmail.com
GOTRUE_SITE_URL=https://your-frontend-url.com
```

Then restart Supabase:
```bash
docker-compose down
docker-compose up -d
```

## Option 3: Update via SQL (Temporary - for existing users)

```sql
-- Enable email confirmation requirement
UPDATE auth.config 
SET email_confirmation_required = true;
```

## Configure SMTP for Email Sending

### Using Gmail:
1. Enable 2FA on your Gmail account
2. Generate an App Password
3. Use these settings:
   - Host: `smtp.gmail.com`
   - Port: `587`
   - User: Your Gmail address
   - Pass: The app password (not your regular password)

### Using SendGrid/Mailgun/etc:
Update the SMTP settings with your provider's credentials.

## Test Email Confirmation

After enabling, new signups should:
1. Create user with `email_confirmed_at = NULL`
2. Send confirmation email
3. User clicks link in email
4. `email_confirmed_at` gets populated
5. User can login

## Notes

- **Existing users** without confirmed emails won't be able to login after enabling this
- You may want to manually confirm existing users:
  ```sql
  UPDATE auth.users 
  SET email_confirmed_at = NOW() 
  WHERE email_confirmed_at IS NULL;
  ```
