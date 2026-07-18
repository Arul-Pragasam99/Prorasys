# Prorasys Commerce Rebuild

## Project description

Prorasys is an e-commerce platform developed as a modern replacement for an older Flask and MySQL-based system. The project focuses on delivering a user-friendly online shopping experience with product browsing, reviews, cart management, wishlist support, authentication, and an administrative overview. The application is designed to preserve the core business idea of the original system while improving usability, maintainability, and deployment readiness through a modern Next.js and Firebase-based architecture.

The platform is intended to support both customers and administrators by providing a simple storefront experience for shoppers and a structured management view for product and review oversight. It also lays the groundwork for future enhancements such as trust-based review scoring, personalized recommendations, and more complete order and user management workflows.

## Project summary

This repository contains a modern e-commerce storefront rebuilt from the original Flask + MySQL application. The current implementation uses Next.js, TypeScript, Tailwind CSS, and Firebase to provide a more realistic shopping experience with a customer-facing storefront, product catalog, product detail pages, cart and wishlist flows, and an admin-style overview screen.

The goal of this project is to preserve the older system’s product/review/trust concepts while presenting them in a more maintainable, modern web application structure that can be deployed and extended easily.

## What this app includes

- Home page with featured products and category highlights
- Product catalog and product detail pages
- Add-to-cart and save-for-later interactions
- Customer login flow with Firebase-backed authentication state
- Persistent cart and wishlist data stored through Firebase services
- Admin overview page for moderation-style management views
- Product review and ranking endpoints for future trust-scoring features
- Responsive UI that works across desktop and mobile layouts

## Tech stack

- Frontend: Next.js 15 with App Router
- Language: TypeScript
- Styling: Tailwind CSS
- Backend/data: Firebase Firestore and Firebase Authentication
- UI helpers: Radix dialog, Framer Motion, Recharts, React Hook Form
- Package manager: npm

## Project structure

- app/: Next.js route pages and layouts
  - src/app/page.tsx: landing/home page
  - src/app/products/page.tsx: catalog page
  - src/app/products/[productId]/page.tsx: product detail page
  - src/app/login/page.tsx: login experience
  - src/app/cart/page.tsx: cart and wishlist interface
  - src/app/admin/page.tsx: admin overview screen
- components/: reusable UI modules
  - src/components/commerce/: storefront header, product cards, cart panel, auth status
  - src/components/auth/: login/auth UI components
  - src/components/admin/: admin dashboard presentation
- lib/: shared logic and service helpers
  - src/lib/firebase.ts: Firebase client initialization
  - src/lib/auth-service.ts: authentication helpers
  - src/lib/cart-service.ts: cart and wishlist persistence helpers
  - src/lib/product-service.ts: product and review access logic
  - src/lib/store-data.ts and src/lib/mock-data.ts: fallback demo data
- public/static assets are organized under the app’s static folders and can be reused for branding or images

## Prerequisites

Make sure the following are installed:

- Node.js 18 or newer
- npm
- A Firebase project with Firestore enabled and Authentication enabled

## Installation

1. Open the project folder:
   - cd d:\Prorasys\project
2. Install dependencies:
   - npm install
3. Create a local environment file:
   - Create a file named .env in the project root
4. Add your Firebase configuration values to .env

Example structure:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

## Running locally

Start the development server:

```bash
npm run dev
```

Then open the app in your browser at:

- http://localhost:3000

## Build and verification

To verify the production build:

```bash
npm run build
```

The current project has been verified to build successfully with the existing structure.

## Main application routes

- /: landing page
- /products: product catalog
- /products/[productId]: product detail page
- /recommendations: recommendations or related-items experience
- /login: sign-in experience
- /cart: cart and wishlist overview
- /admin: admin overview screen

## API routes

The app also includes backend-style route handlers for data access:

- /api/health: health check endpoint
- /api/products: product listing API
- /api/products/[productId]: product detail API
- /api/reviews: review API
- /api/rankings: ranking or trust-style API

## Firebase integration notes

The current app uses Firebase for:

- Authentication state for sign-in/sign-out
- Firestore-backed cart and wishlist persistence
- Product and review data retrieval

If Firebase credentials are missing or invalid, the app will fall back to local demo data in some flows, but full persistence will not work until the environment variables are configured correctly.

## Data and content notes

The storefront uses a mix of:

- static or seeded demo content for UI rendering
- Firebase-backed content for live product and review data
- reusable components to keep the UI modular and straightforward to edit

This makes it easier to evolve the experience from a demo build into a fuller e-commerce product.

## Development workflow

Typical workflow for future edits:

1. Update or create components under src/components/
2. Add or adjust page-level routes under src/app/
3. Put shared logic and Firebase integrations in src/lib/
4. Verify the app with npm run build
5. Test the UI locally in the browser

## Deployment notes

For deployment, the app can be hosted on any platform that supports Next.js applications, such as:

- Vercel
- Netlify
- Render
- AWS / Azure / Docker-based hosting

Before deploying, make sure:

- the Firebase environment variables are set in the deployment environment
- the project builds successfully with npm run build
- authentication and Firestore rules are configured correctly in Firebase

## Future expansion ideas

The current app is already structured for future growth. Good next steps include:

- full checkout and order history flows
- admin CRUD pages for products and users
- real review moderation tools
- trust-score and recommendation enhancements
- richer product filters and search

## Quick reference

Useful commands:

```bash
npm install
npm run dev
npm run build
```

If you ever need to continue work from this repository later, this README should be enough to understand the project structure, setup steps, and current feature set.
