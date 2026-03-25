

## Plan: Add Per-Page Title Tags

Add a `useEffect` hook to each page component to set `document.title` on mount.

### Pages and Titles

| Route | Title |
|-------|-------|
| `/` | AI-Powered Moving Estimates \| TruMove |
| `/faq` | FAQ: Answers to Your Moving Questions \| TruMove |
| `/about` | About TruMove: Interstate Moves with AI \| TruMove Inc. |
| `/customer-service` | Customer Service & Support \| TruMove Inc. |
| `/track` | Track Your Shipment with Live GPS Tracking \| TruMove |
| `/vetting` | Vetting Moving Carriers \| TruMove |
| `/book` | Moving Estimates & Consultations \| TruMove |
| `/auto-transport` | Auto Transport \| TruMove |
| `/online-estimate` | AI-Powered Moving Estimates \| TruMove |
| `/privacy` | Privacy Policy: Your Data & TruMove |
| `/terms` | Terms & Conditions \| TruMove - AI-Powered Moving Estimates |
| `/scan-room` | AI-Powered Inventory Scanner \| TruMove |
| `/carrier-vetting` | Carrier Vetting: Ensuring Safe Moving Services \| TruMove |

### Implementation

Each page already has a `useEffect(() => { window.scrollTo(0, 0); }, [])`. We'll add `document.title = "..."` inside that same effect across all 13 pages. No new dependencies needed.

**Files to edit** (13 files):
- `src/pages/Index.tsx`
- `src/pages/FAQ.tsx`
- `src/pages/About.tsx`
- `src/pages/CustomerService.tsx`
- `src/pages/LiveTracking.tsx`
- `src/pages/CarrierVetting.tsx`
- `src/pages/Book.tsx`
- `src/pages/AutoTransport.tsx`
- `src/pages/OnlineEstimate.tsx`
- `src/pages/Privacy.tsx`
- `src/pages/Terms.tsx`
- `src/pages/ScanRoom.tsx`
- `src/pages/VettingDashboard.tsx` (shares `/carrier-vetting` route)

