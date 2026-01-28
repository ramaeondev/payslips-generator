# Supabase Setup Instructions

## Prerequisites

- Docker and Docker Compose installed
- SSH access to your server: `root@157.245.105.249`

## Initial Setup

1. **Connect to your server:**
   ```bash
   ssh -i ~/.ssh/devpad-digiocean root@157.245.105.249
   ```

2. **Install Docker (if not already installed):**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   ```

3. **Clone Supabase:**
   ```bash
   git clone --depth 1 https://github.com/supabase/supabase
   cd supabase/docker
   ```

4. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

5. **Configure environment variables in .env:**
   - Set `POSTGRES_PASSWORD`
   - Set `JWT_SECRET`
   - Set `ANON_KEY` and `SERVICE_ROLE_KEY`
   - Set `SITE_URL` to your domain

6. **Start Supabase:**
   ```bash
   docker-compose up -d
   ```

## Run Migrations

1. **Install Supabase CLI:**
   ```bash
   npm install -g supabase
   ```

2. **Link to your project:**
   ```bash
   supabase link --project-ref your-project-ref
   ```

3. **Run migrations:**
   ```bash
   supabase db push
   ```

   Or manually via psql:
   ```bash
   # Copy the migration file to server
   scp -i ~/.ssh/devpad-digiocean migrations/001_create_organizations.sql root@157.245.105.249:/tmp/

   # SSH to server
   ssh -i ~/.ssh/devpad-digiocean root@157.245.105.249

   # Run migration
   docker exec -i supabase-db psql -U postgres -d postgres < /tmp/001_create_organizations.sql
   ```

## Verify Setup

1. **Check if containers are running:**
   ```bash
   docker ps
   ```

2. **Access Supabase Studio:**
   ```
   http://157.245.105.249:8000
   ```

3. **Test API endpoint:**
   ```bash
   curl http://157.245.105.249:8000/rest/v1/organizations
   ```

## Create Storage Buckets

The migration automatically creates the `organization-logos` bucket. To verify:

1. Go to Supabase Studio
2. Navigate to Storage
3. Confirm `organization-logos` bucket exists

## Security Notes

- Change default passwords in `.env`
- Set up firewall rules to restrict access
- Enable SSL/TLS for production
- Regularly backup your database

## Useful Commands

```bash
# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop services
docker-compose down

# Backup database
docker exec supabase-db pg_dump -U postgres postgres > backup.sql

# Restore database
docker exec -i supabase-db psql -U postgres postgres < backup.sql
```
