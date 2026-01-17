<!--
================================================================================
SYNC IMPACT REPORT
================================================================================
Version Change: 1.0.0 → 1.1.0 (MINOR - Added missing API modules)

Modified Principles: None

Modified Sections:
- Technical Standards
  - Updated "API Modules to Integrate" table
  - Added 5 missing modules: Payment, Device & Venue, Rental, Address, Content
  - Adjusted module priorities based on backend API analysis
- Core Principles > V. Incremental Migration
  - Updated module list to include all backend modules

Added Sections: None

Removed Sections: None

Rationale:
- Backend code review revealed 5 implemented API modules not listed in constitution
- Device/Venue and Rental are core business functions and should be P2 priority
- Payment is a critical cross-cutting concern needed by multiple modules
- Address management is required for mall functionality
- Content APIs (banners, articles, feedback) support user experience features

Templates Requiring Updates:
- .specify/templates/plan-template.md ✅ No updates needed
- .specify/templates/spec-template.md ✅ No updates needed
- .specify/templates/tasks-template.md ✅ No updates needed
- .specify/templates/checklist-template.md ✅ No updates needed

Follow-up TODOs:
- Create P2 specs for Device & Venue module
- Create P2 specs for Rental module
- Create P2 specs for Payment module
- Fix API path mismatches in existing services (user.js, mall.js, hotel.js)
================================================================================
-->

# 杜美人用户端前端 Constitution

## Core Principles

### I. API-First Integration

All frontend features MUST integrate with the real backend API at `localhost:8000/api/v1`.

**Non-Negotiable Rules**:
- Every service function MUST call the real API endpoint, not mock data
- API endpoint paths MUST match the backend route definitions exactly
- Request/response data structures MUST conform to the backend API contracts
- Authentication tokens MUST be included for protected endpoints via `Authorization: Bearer <token>` header

**Rationale**: The backend API is production-ready and provides the authoritative data source. Mock data was a development convenience that MUST be replaced with real API calls.

### II. Type Safety & Contract Compliance

All API interactions MUST respect the data contracts defined by the backend.

**Non-Negotiable Rules**:
- Request payloads MUST include all required fields as defined by backend endpoints
- Response handling MUST account for the actual response structure (`{ code: 0|200, message: string, data: T }`)
- Error responses MUST be handled according to HTTP status codes (401, 403, 404, 500)
- Data transformations between API and UI MUST be explicit and documented

**Rationale**: Contract mismatches cause runtime errors and poor user experience. Strict adherence ensures reliability.

### III. Error Handling & User Experience

All API failures MUST be handled gracefully with appropriate user feedback.

**Non-Negotiable Rules**:
- Network errors MUST display user-friendly messages in Chinese
- 401 responses MUST redirect to login and clear stored credentials
- Loading states MUST be shown during API requests
- Empty states MUST be handled when API returns no data
- Rate-limited requests (429) MUST inform users to wait before retrying

**Rationale**: Users expect responsive feedback. Silent failures or cryptic errors degrade trust in the application.

### IV. Environment-Aware Configuration

API configuration MUST support multiple deployment environments.

**Non-Negotiable Rules**:
- Base URL MUST be configurable: development (`localhost:8000`), staging, production
- Environment configuration MUST NOT be hardcoded in service files
- Sensitive configuration (API keys, secrets) MUST NOT be committed to version control
- Mock mode SHOULD be toggleable for offline development when needed

**Rationale**: The application targets multiple platforms (H5, WeChat Mini Program, APP) and environments.

### V. Incremental Migration

Migration from mock to real API MUST be done module by module with verification.

**Non-Negotiable Rules**:
- Each module (auth, user, payment, device, venue, rental, hotel, mall, address, member, marketing, distribution, content) MUST be migrated and tested independently
- Existing UI behavior MUST be preserved during migration
- Mock data files MUST NOT be deleted until real API is verified working
- Each migration MUST be a separate, reviewable unit of work

**Rationale**: Incremental migration reduces risk and allows for quick rollback if issues arise.

## Technical Standards

**Frontend Stack**:
- Framework: UniApp 3.0 + Vue 3.x (Composition API)
- State Management: Pinia with persistence
- Build Tool: Vite
- Styling: SCSS with design system variables

**Backend API**:
- Base URL: `http://localhost:8000/api/v1`
- Authentication: JWT (access token + refresh token)
- Response Format: `{ code: 0|200, message: string, data: T }`
- Documentation: Swagger at `/swagger/index.html`

**API Modules to Integrate**:
| Frontend Module | Backend Endpoints | Priority |
|-----------------|-------------------|----------|
| Authentication | `/api/v1/auth/*` | P1 |
| User Profile | `/api/v1/user/*` | P1 |
| Payment | `/api/v1/payment/*` | P2 |
| Device & Venue | `/api/v1/device/*`, `/api/v1/venue/*` | P2 |
| Rental | `/api/v1/rental/*` | P2 |
| Hotel & Booking | `/api/v1/hotels/*`, `/api/v1/bookings/*` | P2 |
| Mall & Orders | `/api/v1/products/*`, `/api/v1/orders/*`, `/api/v1/cart/*` | P2 |
| Address | `/api/v1/addresses/*` | P2 |
| Member | `/api/v1/member/*` | P3 |
| Marketing | `/api/v1/marketing/*` | P3 |
| Distribution | `/api/v1/distribution/*` | P3 |
| Content | `/api/v1/banners`, `/api/v1/articles`, `/api/v1/feedbacks` | P3 |

**Module Descriptions**:
- **Authentication**: User login (SMS/WeChat), token management, logout
- **User Profile**: User info, wallet, transactions, member levels, real-name verification, points
- **Payment**: Unified payment service for all order types, refund management
- **Device & Venue**: Scan QR code, device details, venue search, nearby venues
- **Rental**: Device rental flow (create, pay, start, return, cancel)
- **Hotel & Booking**: Hotel search, room availability, booking management
- **Mall & Orders**: Product catalog, shopping cart, order lifecycle
- **Address**: Shipping address management (CRUD operations)
- **Member**: Membership packages, benefits, upgrade, points exchange
- **Marketing**: Coupons, campaigns, user coupon management
- **Distribution**: Distributor application, team management, commission, withdrawal
- **Content**: Banners, articles, user feedback

## Development Workflow

**Before Starting API Integration**:
1. Review backend Swagger documentation at `/swagger/index.html`
2. Identify all endpoints for the target module
3. Compare mock data structure with actual API response structure
4. Plan any necessary data transformations

**During Integration**:
1. Update base URL in `src/services/request.js` to `http://localhost:8000/api/v1`
2. Modify service functions to match backend endpoint paths
3. Adjust request/response handling for actual API contract
4. Test each endpoint with real backend running

**After Integration**:
1. Verify all CRUD operations work correctly
2. Test error scenarios (network failure, 401, 404)
3. Confirm UI displays data correctly
4. Document any API quirks or workarounds

## Governance

This constitution governs all development work on the user frontend API integration project.

**Amendment Process**:
- Amendments require documentation of the change rationale
- Breaking changes to principles require team review
- Version number MUST be updated following semantic versioning

**Compliance**:
- All code changes MUST comply with these principles
- Code reviews MUST verify principle adherence
- Deviations MUST be documented with justification

**Version**: 1.1.0 | **Ratified**: 2026-01-13 | **Last Amended**: 2026-01-17
