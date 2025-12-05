# Production Deployment Guide

## Domain Configuration

### Production Domain
```
https://check.ambitionvalley.nl
```

### Vercel Project
- **Project Name:** av-intergrations
- **Framework:** Next.js 16
- **Region:** Auto (closest to user)

---

## Environment Variables

Configure these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (server-side only) | Yes |
| `RESEND_API_KEY` | Resend API key for emails | Yes |
| `ADMIN_API_TOKEN` | Token for protected API endpoints | Yes |
| `NEXT_PUBLIC_BASE_URL` | Production URL for SEO | Yes |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics ID | Optional |

---

## API Endpoints

### Form Submissions
```
POST /api/submissions
```

**Request:**
```json
{
  "formId": "ambition-valley-form",
  "answers": {
    "<field-ref>": "<value>"
  },
  "sessionId": "unique-session-id",
  "utmSource": "optional",
  "utmMedium": "optional",
  "utmCampaign": "optional"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Formulier succesvol verzonden",
  "data": {
    "id": "uuid",
    "qualificationResult": "qualified|disqualified|partial"
  }
}
```

### Calculator Report Email
```
POST /api/report/send
```

**Request:**
```json
{
  "email": "user@example.com",
  "calculator": "sparen-vs-beleggen|pensioenbeleggen",
  "inputs": { ... },
  "results": { ... }
}
```

### Admin: List Submissions
```
GET /api/submissions
Authorization: Bearer <ADMIN_API_TOKEN>
```

---

## DNS Configuration

Add these DNS records in your domain registrar:

### Option A: Vercel DNS (Recommended)
```
Type: CNAME
Name: check
Value: cname.vercel-dns.com
```

### Option B: A Records
```
Type: A
Name: check
Value: 76.76.21.21
```

---

## Deployment

### Automatic (Recommended)
Push to `main` branch triggers automatic deployment.

### Manual CLI
```bash
vercel --prod
```

---

## Post-Deployment Checklist

- [ ] Verify DNS propagation: `dig check.ambitionvalley.nl`
- [ ] Test form submission flow
- [ ] Verify email delivery (check Resend dashboard)
- [ ] Check Supabase for new submissions
- [ ] Verify SSL certificate is active
- [ ] Test on mobile devices

---

## Monitoring

### Vercel
- **Logs:** Vercel Dashboard → Deployments → Logs
- **Analytics:** Vercel Dashboard → Analytics

### Supabase
- **Database:** Supabase Dashboard → Table Editor → form_submissions
- **Logs:** Supabase Dashboard → Logs

### Resend
- **Email Logs:** Resend Dashboard → Emails
- **Delivery Status:** Check for bounces/complaints

---

## Troubleshooting

### Form not submitting
1. Check browser console for errors
2. Verify CSRF token is being set
3. Check Vercel function logs

### Email not sending
1. Verify `RESEND_API_KEY` is set
2. Check Resend dashboard for errors
3. Verify sender domain is configured

### Database errors
1. Check Supabase connection
2. Verify RLS policies allow inserts
3. Check service role key permissions

---

## Security

### Deployment Protection
Vercel deployment protection is enabled for preview deployments. Production domain bypasses this.

### Rate Limiting
- Form submissions: 10 requests per minute per IP
- Report emails: 5 requests per hour per email

### CSRF Protection
Double-submit cookie pattern is used for form submissions.

---

## Scripts

### Test Form Flow
```bash
# Test against production
API_BASE_URL=https://check.ambitionvalley.nl npx tsx scripts/test-form-submission.ts

# List recent submissions
npx tsx scripts/test-form-submission.ts list

# Direct database insert (testing)
npx tsx scripts/test-form-submission.ts direct
```

### Export Typeform
```bash
TYPEFORM_API_TOKEN=<token> npx tsx scripts/export-typeform.ts <form-id>
```
