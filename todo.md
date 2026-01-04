# Project TODO - redflagcontracts

## Core Features
- [x] Home page (/) with hero section (headline, subheadline, large textarea)
- [x] "Analyze contract" button that calls OpenAI API
- [x] Preview system showing only first 2 bullet points with blurred remaining content
- [x] Stripe Checkout integration for $9 one-time payment
- [x] Post-payment redirect logic (?success=true) to show full analysis
- [x] Terms page (/terms) with simple terms
- [x] Privacy page (/privacy) with simple privacy policy
- [x] SEO-friendly meta tags with specific title and description
- [x] Footer with links to /terms and /privacy
- [x] Visible disclaimer about not providing legal advice
- [x] Clean, minimal, professional UI with neutral colors

## Technical Implementation
- [x] tRPC procedure for OpenAI contract analysis
- [x] tRPC procedure for Stripe Checkout session creation
- [x] Stripe webhook handling for payment success
- [x] Proper HTML semantic tags for SEO
- [x] Responsive design for all screen sizes

## New Features
- [x] Upload PDF file option for contract analysis
- [x] Extract text from PDF on server side
- [x] Update UI with file upload component
