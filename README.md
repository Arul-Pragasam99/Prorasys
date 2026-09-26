# Prorasys

Prorasys is a trust-aware shopping website. It brings product browsing, customer reviews, trust signals, and recommendations together so shoppers can compare products and make more informed decisions. It includes customer account, cart, wishlist, checkout/order, and administrator workflows.

Live site: https://prorasys.vercel.app

## What the website does

- Browse and search a Firestore-backed product catalog.
- View product details, ratings, reviews, and trust information.
- Sign in or register with Firebase Authentication.
- Save products to a wishlist, manage a cart, and create orders.
- View personalized recommendations and product rankings.
- Use admin pages to manage products, review moderation, users, orders, and analytics.

The project includes AI-related sentiment, recommendation, and trust-score services. If trained model artifacts are unavailable or fail validation, the Python service uses fallback behavior where implemented. A running service does not by itself guarantee that every model is trained or accurate; `/api/ai/status` reports trained-model readiness and fallback availability.

## Technology

- **Web app:** Next.js 16 App Router, React 18, TypeScript
- **Styles:** Tailwind CSS
- **Authentication and data:** Firebase Authentication and Cloud Firestore
- **Python API:** FastAPI, served locally by Uvicorn and deployed on Vercel as a Python function
- **AI/ML:** scikit-learn, NumPy, pandas, NLTK stopwords (with a fallback when data is unavailable)
- **Deployment:** Vercel; `vercel.json` routes `/api/python/*` to the FastAPI app

## Theme colors

The light and dark themes use the following CSS variables from `project/src/app/globals.css`:

| Token | Light | Dark |
| --- | --- | --- |
| Primary | <span style="color:#0F6E56">&#9632;</span> `#0F6E56` | <span style="color:#5DCAA5">&#9632;</span> `#5DCAA5` |
| Primary light | <span style="color:#5DCAA5">&#9632;</span> `#5DCAA5` | <span style="color:#0F6E56">&#9632;</span> `#0F6E56` |
| Secondary | <span style="color:#185FA5">&#9632;</span> `#185FA5` | <span style="color:#85B7EB">&#9632;</span> `#85B7EB` |
| Secondary light | <span style="color:#85B7EB">&#9632;</span> `#85B7EB` | <span style="color:#185FA5">&#9632;</span> `#185FA5` |
| Accent | <span style="color:#D85A30">&#9632;</span> `#D85A30` | <span style="color:#F0997B">&#9632;</span> `#F0997B` |
| Accent light | <span style="color:#F0997B">&#9632;</span> `#F0997B` | <span style="color:#D85A30">&#9632;</span> `#D85A30` |
| Success | <span style="color:#639922">&#9632;</span> `#639922` | <span style="color:#97C459">&#9632;</span> `#97C459` |
| Success light | <span style="color:#97C459">&#9632;</span> `#97C459` | <span style="color:#639922">&#9632;</span> `#639922` |
| Warning | <span style="color:#BA7517">&#9632;</span> `#BA7517` | <span style="color:#EF9F27">&#9632;</span> `#EF9F27` |
| Warning light | <span style="color:#EF9F27">&#9632;</span> `#EF9F27` | <span style="color:#BA7517">&#9632;</span> `#BA7517` |
| Danger | <span style="color:#A32D2D">&#9632;</span> `#A32D2D` | <span style="color:#F09595">&#9632;</span> `#F09595` |
| Danger light | <span style="color:#F09595">&#9632;</span> `#F09595` | <span style="color:#A32D2D">&#9632;</span> `#A32D2D` |
| Surface | <span style="color:#FFFFFF">&#9632;</span> `#FFFFFF` | <span style="color:#000000">&#9632;</span> `#000000` |
| Card | <span style="color:#F7F9F8">&#9632;</span> `#F7F9F8` | <span style="color:#111111">&#9632;</span> `#111111` |
| Primary text | <span style="color:#1A1A18">&#9632;</span> `#1A1A18` | <span style="color:#F1EFE8">&#9632;</span> `#F1EFE8` |
| Secondary text | <span style="color:#5F5E5A">&#9632;</span> `#5F5E5A` | <span style="color:#B4B2A9">&#9632;</span> `#B4B2A9` |
| Border | <span style="color:#D3D1C7">&#9632;</span> `#D3D1C7` | <span style="color:#2D2D2D">&#9632;</span> `#2D2D2D` |

## Repository layout

```text
project/
  src/app/             Next.js pages and API routes
  src/components/      Shared storefront, auth, and admin components
  src/lib/             Firebase clients, auth, cart, orders, and API security
  api/python.py        Vercel entry point for FastAPI
  python-backend/      FastAPI service and model implementations
  public/              PWA manifest, icons, and static assets
  firestore.rules      Firestore access rules
  requirements.txt     Python dependencies used by Vercel
```

## Prerequisites

- Node.js and npm
- Python 3.11 or 3.12 and pip
- A Firebase project with Authentication and Cloud Firestore enabled

## Local setup

Commands below use PowerShell on Windows. From the repository root:

```powershell
cd project
npm install
py -3.12 -m venv python-backend/.venv
python-backend/.venv/Scripts/Activate.ps1
python -m pip install -r python-backend/requirements.txt
```

Before running the application, create a Firebase project with Authentication and Cloud Firestore enabled, configure Firebase for the web app and Python service, and install the dependencies above. Keep all credentials private and configure them through secure local or hosting settings.

## Run locally

With the Python virtual environment activated and Firebase configured, run from `project/`:

```powershell
npm run dev:all
```

This starts Next.js at `http://localhost:3000` and the Python service at `http://localhost:8000`. To run them separately, use `npm run dev` for Next.js and `npm run python:dev` for Python. The Python service uses port 8000 by default.

## Using the site

1. Open `http://localhost:3000` and register/sign in as a customer.
2. Browse products, open product details, and add products to the cart or wishlist.
3. Use checkout to create an order. Payment gateway processing is not configured by this repository.
4. Reviews are available to signed-in customers; the product page checks delivered orders for purchase eligibility.
5. Administrator pages require an account whose Firestore user profile has been provisioned with the `admin` role. Public signup should not be used to grant admin access.

## Routes and health checks

Web pages include `/`, `/products`, `/products/[productId]`, `/recommendations`, `/cart`, `/checkout`, `/orders`, `/profile`, `/login`, and `/admin` pages.

Useful API routes:

- `GET /api/health` checks the Next.js app.
- `GET /api/ai/status` checks whether Next.js can reach Python and reports model/fallback readiness.
- `GET /api/products` and `GET /api/rankings` read catalog and ranking data.
- `POST /api/ai/recommendations` requires a signed-in Firebase user.
- `POST /api/ai/analyze` requires a signed-in user and processes/saves a review; avoid casual production tests because it writes data.
- Direct Python routes are mounted at `/api/python/*` and require `X-API-Key`; a browser request without that header should return `401`.

Verify the production build from `project/` with:

```powershell
npm run build
```

## Vercel deployment

The repository config deploys the Next.js app and `api/python.py` as a Python function. Configure Firebase access and the private service-to-service credential through Vercel's secure project settings, then redeploy. The AI routes use the deployed Python function at `/api/python`.

## Model artifacts and limitations

The service can use validated trained models when they are supplied with the production deployment. Otherwise, sentiment uses a rule-based fallback, recommendations use a content-based fallback, and trust scoring uses a heuristic. Vercel function storage is temporary, so training output must be stored and deployed through a deliberate artifact process.

Rate limits in the current application are process-local. For multi-instance or high-traffic production use, move rate limiting to a shared store or gateway.
