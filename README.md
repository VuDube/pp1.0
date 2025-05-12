
# PAYPER Web Application

## Overview
PAYPER is a comprehensive digital payment, receipt, and invoice management solution designed specifically for South African users. The application supports multiple languages (English, isiZulu, Afrikaans, and Setswana) and provides a seamless financial management experience.

## Tech Stack
- Frontend: React 18.2.0 with Vite
- Styling: TailwindCSS with shadcn/ui components
- Authentication & Database: Supabase
- Payment Processing: Stripe
- Animations: Framer Motion
- Internationalization: i18next
- Future Integration: Google Cloud Vision API for OCR

## Key Features
- Multi-language support (en, zu, af, tn)
- Secure authentication system
- P2P payments
- Merchant payments via Stripe
- Digital receipt management
- Invoice creation and tracking
- Transaction history
- Financial tips
- Mobile-optimized UI

## Environment Variables
The application requires the following environment variables:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

## Supabase Configuration
The application uses the following Supabase resources:
- Authentication with email/password
- Database tables:
  - profiles
  - transactions
  - receipts
  - invoices
  - financial_tips
- Storage buckets for receipt/invoice images
- Edge Functions:
  - create-payment-intent

## Color Palette
- Primary Blue: #0074c2
- Secondary Green: #39b54a
- Background: White
- Text: Black
- UI Elements: Rounded corners (0.75rem)

## Future Integrations
The application is prepared for future integration with:
- Google Cloud Vision API for OCR
- Additional payment providers
- Enhanced analytics features

## Security Considerations
- All API keys are stored in environment variables
- Stripe payment processing uses client-side checkout
- Supabase RLS policies are implemented for data security
- Client-side input validation with server-side verification

## Performance Optimizations
- Image lazy loading
- Route-based code splitting
- Optimized animations
- Efficient state management
- Mobile-first responsive design

## Development Guidelines
1. Follow the established color scheme and UI patterns
2. Maintain language support across all features
3. Implement proper loading states and error handling
4. Use the ErrorBoundary component for error management
5. Follow mobile-first design principles
6. Maintain accessibility standards

## Getting Started
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run development server: `npm run dev`
5. Build for production: `npm run build`

## Deployment
The application is deployed on Hostinger and can be accessed through the provided domain.

## Support
For technical support or feature requests, please contact the development team.
