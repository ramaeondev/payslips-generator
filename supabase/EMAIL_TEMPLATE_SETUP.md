# Email Template Setup for Supabase

## 1. Access Supabase Studio

```bash
http://157.245.105.249:8000
```

## 2. Configure Email Template

1. Go to **Authentication** → **Email Templates**
2. Select **Confirm signup** template
3. Replace with the custom template from `email-templates/confirmation.html`

## 3. Available Template Variables

Supabase provides these variables for the confirmation email:

- `{{ .ConfirmationURL }}` - The confirmation link
- `{{ .SiteURL }}` - Your app URL
- `{{ .Email }}` - User's email address
- `{{ .Token }}` - Confirmation token
- `{{ .TokenHash }}` - Hashed token

## 4. Template Location

Custom template: `/supabase/email-templates/confirmation.html`

## 5. Update via API (Alternative)

You can also update templates via the Supabase REST API:

```bash
curl -X PUT 'http://157.245.105.249:8000/auth/v1/admin/email-templates/confirmation' \
  -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "template": "<html>...</html>"
  }'
```

## 6. Test the Flow

1. Sign up a new user
2. Check that they receive the confirmation email
3. Click the confirmation link
4. Verify `email_confirmed_at` is set in the database
5. User can now login

## 7. Disable Auto-Confirm

Make sure this is set in your `.env`:

```env
GOTRUE_MAILER_AUTOCONFIRM=false
```

## 8. Set Site URL

Update the site URL for proper redirect after confirmation:

```env
GOTRUE_SITE_URL=https://your-domain.com
# Or for development
GOTRUE_SITE_URL=http://localhost:4200
```

The confirmation link will redirect users to: `${GOTRUE_SITE_URL}/auth/confirm`
