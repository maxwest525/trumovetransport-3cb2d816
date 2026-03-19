# Growth Engine Architecture

## Lead Flow (Canonical)

```text
Traffic Source → Landing Page / Call Tracking → Attribution Capture
  → Webhook / Router → Convoso (Instant Call) → CRM Sync
  → Backup Follow-Up Logic
```

### Key Principles

- **Convoso** is the primary instant-call engine. Leads route here first for immediate dial attempts.
- **CRM** (GHL, Granot, or custom) is a sync target / system of record, not the primary destination.
- Each workflow should designate **one primary CRM**; others are optional secondary sync targets.
- GHL does not replace Convoso. It provides backup sequences and reporting.
- "Follow-up automation" means support logic around the instant-call flow, not passive CRM drip sequences.

### Lead Statuses (Convoso feedback loop)

- New Lead
- In Queue
- Attempted
- Connected
- Not Reached
- Escalated
- Duplicate
- Suppressed

### Backup Automation Recipes

1. New form lead → capture attribution → webhook to Convoso → instant call attempt → sync to CRM
2. Lead not reached after 60s → trigger SMS with quote link
3. No contact after 5 minutes → escalate to supervisor dashboard alert
4. Missed inbound call from paid source → create Convoso callback + alert
5. After-hours form submission → queue for next calling block + send auto-text
6. Duplicate lead detected → suppress in Convoso, tag in CRM
7. Source/campaign changes on re-submission → preserve original attribution in CRM
8. Lead not worked within 2 minutes → flash alert on Growth Dashboard

### After-Hours Logic (First-Class)

- Business hours rules per location/team
- Queue timing and next-call-block scheduling
- Auto-text behavior for after-hours submissions
- Morning queue priority ordering

## Upgrade Plan (Pending)

### Pass 1: Dashboard + Landing Pages + Leads + SEO Hub
### Pass 2: Ad Copy + Tracking + Automation + Reviews
### Pass 3: Competitors + Settings + Campaign Builder Enhancement + Shell Polish

See previous conversation for full details on each pass.
