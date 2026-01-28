# Testing Organization Creation

## ❌ OLD WAY (Direct Insert - Blocked by RLS)
```bash
curl -X POST 'https://api-prod.therama.dev/rest/v1/organizations' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "eon solutions inc",
    "slug": "eon-solutions-inc"
  }'
```

## ✅ NEW WAY (Using RPC Function - Works Without Auth)
```bash
curl -X POST 'https://api-prod.therama.dev/rest/v1/rpc/create_organization_with_user' \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "p_user_id": "00000000-0000-0000-0000-000000000000",
    "p_org_name": "eon solutions inc",
    "p_org_slug": "eon-solutions-inc"
  }'
```

## Key Differences:
1. **Endpoint**: `/rest/v1/rpc/create_organization_with_user` instead of `/rest/v1/organizations`
2. **Parameters**: Must use `p_user_id`, `p_org_name`, `p_org_slug` (function parameter names)
3. **No Auth Required**: Function has elevated privileges

## In Your App (Automatic)
The signup flow in your Angular app already uses the function correctly:
- User signs up → gets user ID
- App calls `orgService.createOrganization(userId, orgName)`
- Service calls the RPC function automatically
- No manual API calls needed!
