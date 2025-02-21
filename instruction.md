# CodeToFlows Project Documentation

## Project Overview

CodeToFlows is a web application that converts code and technical descriptions into visual diagrams using AI. It currently supports:

- Code to Flowcharts
- SQL to ER Diagrams
- System Architecture Diagrams

## Project Structure

### Core Components

app/
├── api/ # API route handlers
│ ├── process/ # Code to flowchart conversion
│ ├── er-process/ # SQL to ER diagram conversion
│ └── architecture-process/ # Architecture diagram generation
├── components/ # Shared components
│ ├── Header.tsx # Main navigation header
│ └── FlowchartViewer.tsx # Base diagram viewer component
├── er-diagram/ # ER diagram specific components
│ └── components/
│ └── ERDiagramViewer.tsx
├── architecture/ # Architecture diagram components
│ └── components/
│ └── ArchitectureViewer.tsx
└── layout.tsx # Root layout with fonts and metadata

### Key Files and Their Purposes

1. **Viewer Components**

   - `FlowchartViewer.tsx`: Base viewer with zoom, download, and copy functionality
   - `ERDiagramViewer.tsx`: ER diagram specific viewer
   - `ArchitectureViewer.tsx`: Architecture diagram specific viewer

2. **API Routes**

   - `process/route.ts`: Handles code to flowchart conversion
   - `er-process/route.ts`: Handles SQL to ER diagram conversion
   - `architecture-process/route.ts`: Handles architecture diagram generation

3. **Database Integration**
   - `lib/supabase.ts`: Supabase client and database operations

## Planned Features

### 1. Authentication System

- Implement user authentication using Supabase Auth
- Add sign-up/login modal similar to api key modal
- Store user data in Supabase
- By default user will have 5 free credits once they sign up and can purchase more credits to generate more diagrams.
- The credits are eligible for all the diagrams.
- There is no subscription based system. User can purchase more credits anytime which has no expiry date.
- So provide table query accordingly.
- Current styling, functionaly should not change.

### 2. Credit System

- Remove custom API key functionality
- Implement credit-based usage system
- Credits can be purchased via Stripe
- Each diagram generation costs 1 credits

interface CreditTransaction {
id: string;
user_id: string;
amount: number;
type: 'purchase' | 'usage';
created_at: string;
}

### 3. Stripe Integration

- Implement Stripe payment processing
- Create credit pack products
- Handle webhook notifications

// Planned credit pack products
const creditPacks = [
{ id: 'basic-pack', credits: 25, price: 4.99 },
{ id: 'hobby-pack', credits: 50, price: 9.99 },
{ id: 'premium-pack', credits: 100, price: 19.99 }
];

## Implementation Notes

### Authentication Flow

1. User clicks "Sign In" button
2. Auth modal opens with email/password or social options
3. On successful auth, store session in Supabase
4. Update UI to show user's credit balance

### Credit System Flow

1. Check user's credit balance before generating diagram
2. Deduct credits after successful generation
3. Show credit balance in UI
4. Prompt to purchase when credits are low

### Payment Flow

1. User selects credit pack
2. Open Stripe Checkout
3. On successful payment:
   - Update user's credit balance
   - Record transaction
   - Show success message

## Styling Guidelines

- Primary colors:
  - Background: #fbf9f6
  - Text: #001e2b
  - Accent: #00ed64
- Font families:
  - Plus Jakarta Sans (primary)
  - Bricolage Grotesque (headings)
- Border radius: rounded-lg (8px)
- Spacing: p-4 md:p-8 (16px/32px)

### 4. Email System with Resend

- Implement email verification flow using Resend
- Create beautiful email templates matching website design
- Types of emails:
  1. Account Verification
     - Send on signup
     - No expiry for verification link
     - Must verify to use diagram generation
     - Include brand logo, colors, and styling
  2. Purchase Confirmation - Send after successful credit purchase - Include purchase details and new credit balance - Match website's visual identity
     Email Template Guidelines:
- Use Plus Jakarta Sans for body text
- Use Bricolage Grotesque for headings
- Colors: #001e2b (text), #00ed64 (accent), #fbf9f6 (background)
- Include CodeToFlows logo and branding
- Responsive design for all email clients

### 5. Admin Dashboard

Interface sections:

1. User Management

   - List all registered users
   - Show verification status
   - Email verification timestamps
   - Credit balance
   - Account status (active/banned)
   - Actions: ban/unban, edit credits

2. Payment Analytics

   - Transaction history
   - Revenue metrics
   - Credit pack purchase breakdown
   - Filter by date ranges

3. Credit Management
   - Assign credits to users
   - Adjust credit balances
   - View credit usage history
   - Bulk credit operations

Design Guidelines:

- Match main site's aesthetic
- Same color scheme and typography
- Consistent component styling
- Responsive layout
- Clear data visualization

## Implementation Notes

### Email Flow

1. Signup Process:
   interface EmailVerification {
   user_id: string;
   email: string;
   verification_token: string;
   created_at: string;
   }
2. Email Template Structure:
   interface EmailTemplate {
   type: 'verification' | 'purchase';
   subject: string;
   preheader?: string;
   content: {
   heading: string;
   body: string;
   ctaText?: string;
   ctaUrl?: string;
   };
   }

### Admin Dashboard Flow

1. Authentication:

interface AdminUser {
id: string;
email: string;
role: 'admin' | 'super_admin';
permissions: string[];
}

2. User Management:
   interface UserManagement {
   user_id: string;
   email: string;
   is_verified: boolean;
   credits: number;
   status: 'active' | 'banned';
   created_at: string;
   verification_date?: string;
   }
3. Transaction Tracking:
   interface AdminTransaction {
   id: string;
   user_id: string;
   amount: number;
   type: 'purchase' | 'usage' | 'admin_adjustment';
   created_at: string;
   admin_id?: string;
   notes?: string;
   }

## Security Considerations

### Email Security

- Validate email addresses
- Secure verification tokens
- Rate limit verification attempts
- Monitor for abuse

### Admin Security

- Role-based access control
- Action logging
- IP restriction options
- Two-factor authentication
- Session management

## Performance Considerations

### Email System

- Queue email sending
- Handle bounce/failure
- Track email metrics
- Template caching

### Admin Dashboard

- Paginated data loading
- Efficient search/filter
- Cached analytics
- Optimized database queries

## Error Handling

- Authentication errors: Show in modal
- Credit balance errors: Prompt to purchase
- Payment errors: Show error message and retry option
- Generation errors: Show friendly error message with retry option

## Performance Considerations

- Cache generated diagrams in Supabase
- Implement rate limiting based on user tier
- Optimize SVG generation and rendering
- Use proper loading states during operations

## Security Considerations

- Implement CSRF protection
- Secure credit transactions
- Validate user permissions
- Sanitize input/output
- Protect API endpoints
