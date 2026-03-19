

## Problem

E-sign documents are **not persisted to the database** and have **no link to leads**. Specifically:

1. `AgentESignTab` stores document records in React state only — lost on page refresh
2. `esign_audit_trail` has no `lead_id` column, so audit events can't be traced back to a lead/customer
3. `capture-esign-event` edge function doesn't accept or store `lead_id`
4. When viewing a customer's E-Sign tab, there's no way to load previously sent documents

## Solution

### 1. Create `esign_documents` table (migration)

New table to persist document lifecycle, linked to leads:

```sql
CREATE TABLE public.esign_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  ref_number text NOT NULL,
  status text NOT NULL DEFAULT 'sent',
  delivery_method text NOT NULL DEFAULT 'email',
  sent_at timestamptz DEFAULT now(),
  opened_at timestamptz,
  completed_at timestamptz,
  sent_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.esign_documents ENABLE ROW LEVEL SECURITY;
```

RLS policies mirroring lead access patterns (agents see own leads' documents, managers/owners see all).

### 2. Add `lead_id` to `esign_audit_trail` (migration)

```sql
ALTER TABLE public.esign_audit_trail ADD COLUMN lead_id uuid REFERENCES public.leads(id);
```

### 3. Update `capture-esign-event` edge function

Accept optional `leadId` in request body and store it in `esign_audit_trail.lead_id`.

### 4. Update `AgentESignTab` component

- On mount, query `esign_documents` filtered by `leadId` to load existing documents
- On send, insert a new row into `esign_documents` with `lead_id`, `ref_number`, `status`, etc.
- Pass `leadId` to the `capture-esign-event` calls and the `send-esign-document` flow
- Remove reliance on local-only state for document records

### 5. Update `ESignViewPage`

- Accept `leadId` as a search param
- Pass `leadId` through to `logAuditEvent` so audit trail entries are linked
- On document completion, update the corresponding `esign_documents` row status to `completed`

### Files changed
- **New migration**: Create `esign_documents` table + add `lead_id` to `esign_audit_trail`
- `supabase/functions/capture-esign-event/index.ts` — accept and store `leadId`
- `src/components/agent/AgentESignTab.tsx` — persist/load documents from DB
- `src/pages/ESignViewPage.tsx` — pass `leadId` through audit logging and update status on completion

