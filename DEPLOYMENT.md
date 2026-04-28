# Sentinel AI - Deployment Guide

## Overview

Sentinel AI is a production-ready web application built with React, Express, tRPC, and MySQL. This guide covers deployment, configuration, and operations.

## Pre-Deployment Checklist

- [x] All unit tests passing (18/18)
- [x] Environment variables configured
- [x] Database schema migrated
- [x] OAuth credentials set up (Manus OAuth)
- [x] LLM API access verified
- [x] Responsive design tested

## Deployment Platforms

### Option 1: Vercel (Recommended)

Vercel is the easiest option for deploying Sentinel AI with automatic scaling and zero-config deployments.

**Steps:**

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `DATABASE_URL` - MySQL connection string
   - `JWT_SECRET` - Session signing secret
   - `VITE_APP_ID` - Manus OAuth app ID
   - `OAUTH_SERVER_URL` - Manus OAuth server URL
   - `VITE_OAUTH_PORTAL_URL` - Manus login portal URL
   - `BUILT_IN_FORGE_API_URL` - Manus API URL
   - `BUILT_IN_FORGE_API_KEY` - Manus API key
   - `VITE_FRONTEND_FORGE_API_KEY` - Frontend API key
   - `VITE_FRONTEND_FORGE_API_URL` - Frontend API URL

3. Deploy: `git push` to main branch

4. Vercel automatically builds and deploys

### Option 2: Railway

Railway provides simple deployment with built-in database support.

**Steps:**

1. Connect GitHub repository to Railway
2. Create MySQL database plugin
3. Set environment variables (same as above)
4. Deploy automatically on push

### Option 3: Self-Hosted (Docker)

For maximum control, deploy using Docker.

**Steps:**

1. Build Docker image:
   ```bash
   docker build -t sentinel-ai .
   ```

2. Run container:
   ```bash
   docker run -e DATABASE_URL=mysql://... -p 3000:3000 sentinel-ai
   ```

3. Configure reverse proxy (Nginx/Apache) for HTTPS

## Environment Variables

| Variable | Purpose | Example |
|---|---|---|
| `DATABASE_URL` | MySQL connection | `mysql://user:pass@host/db` |
| `JWT_SECRET` | Session signing | `your-secret-key-here` |
| `VITE_APP_ID` | OAuth app ID | `sentinel-ai-prod` |
| `OAUTH_SERVER_URL` | OAuth server | `https://api.manus.im` |
| `BUILT_IN_FORGE_API_KEY` | LLM API key | `sk-...` |

## Database Setup

1. Create MySQL database:
   ```sql
   CREATE DATABASE sentinel_ai;
   ```

2. Run migrations:
   ```bash
   pnpm drizzle-kit migrate
   ```

3. Verify tables created:
   ```sql
   SHOW TABLES;
   ```

## Post-Deployment

### Health Checks

Monitor these endpoints:

- `/api/health` - Server health
- `/api/trpc/auth.me` - Authentication status
- `/api/trpc/dashboard.getMetrics` - Data access

### Monitoring

Set up monitoring for:

- Server uptime and response times
- Database connection health
- Error rates and stack traces
- User engagement metrics

### Scaling

For high traffic:

1. Enable database connection pooling
2. Set up CDN for static assets
3. Use load balancer for multiple instances
4. Cache frequently accessed data

## Troubleshooting

### Database Connection Errors

**Error**: `Cannot connect to database`

**Solution**:
1. Verify `DATABASE_URL` is correct
2. Check database server is running
3. Verify firewall allows connection
4. Test connection: `mysql -u user -p -h host`

### OAuth Failures

**Error**: `OAuth callback failed`

**Solution**:
1. Verify `VITE_APP_ID` and `OAUTH_SERVER_URL` are correct
2. Check redirect URI is registered in OAuth provider
3. Verify `JWT_SECRET` is set

### LLM API Errors

**Error**: `Failed to generate intervention message`

**Solution**:
1. Verify `BUILT_IN_FORGE_API_KEY` is valid
2. Check API rate limits
3. Monitor API usage dashboard

## Rollback

If deployment fails:

1. **Vercel**: Automatic rollback to previous deployment
2. **Railway**: Revert to previous commit
3. **Docker**: Restart previous container version

## Performance Optimization

### Frontend

- Enable gzip compression
- Minify CSS/JavaScript
- Cache static assets (1 year)
- Use CDN for images

### Backend

- Enable database query caching
- Use connection pooling
- Implement rate limiting
- Cache LLM responses (24 hours)

### Database

- Add indexes on frequently queried columns
- Archive old intervention records
- Optimize query performance

## Security

### HTTPS

- Use SSL/TLS certificates (Let's Encrypt)
- Redirect HTTP to HTTPS
- Set HSTS headers

### Data Protection

- Encrypt sensitive data at rest
- Use secure session cookies (HttpOnly, Secure, SameSite)
- Implement rate limiting on auth endpoints
- Regular security audits

### Secrets Management

- Never commit secrets to git
- Use environment variables for all secrets
- Rotate API keys quarterly
- Monitor secret access logs

## Monitoring & Analytics

### Key Metrics

- Daily active users
- Intervention trigger rate
- User retention (7-day, 30-day)
- Average response time
- Error rate

### Alerting

Set up alerts for:

- Server downtime
- High error rates (>5%)
- Database connection failures
- API rate limit exceeded

## Support & Maintenance

### Regular Tasks

- Weekly: Review error logs
- Monthly: Check database performance
- Quarterly: Security audit
- Annually: Dependency updates

### Contact

For deployment issues, contact the development team or file an issue on GitHub.

---

**Last Updated**: April 28, 2026
**Version**: 1.0
**Status**: Production Ready
