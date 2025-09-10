# Webspind

**Webspind** (webspind.com) is a website that lets people use PDF and text tools directly in their browser—things like merge PDFs, split pages, compress, OCR scans to make them searchable, export PDFs to images, add page numbers/watermarks, and a few quick text utilities (word counter, case converter, "Is this text AI?" check).

## Key Features

- **Speed & Privacy**: Wherever possible, files are processed locally in the user's browser (no upload to a server)
- **Credit System**: Users get 3 free credits per day. Processing/preview is free; downloading the finished file costs 1 credit
- **Findability**: Each tool lives on its own page with its own URL, content, and SEO so people can find tools on Google (e.g., `/tools/pdf-merge`)

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Package Manager**: pnpm
- **Linting**: ESLint with Next.js config

## Getting Started

### Prerequisites

- Node.js 20 or later
- pnpm (install with `npm install -g pnpm`)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd website
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual values if needed
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Available Scripts

- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build the application for production
- `pnpm start` - Start the production server
- `pnpm lint` - Run ESLint
- `pnpm typecheck` - Run TypeScript type checking

## Project Structure

```
website/
├── .github/workflows/     # GitHub CI/CD workflows
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # Reusable React components
│   ├── config/           # Configuration and environment setup
│   └── lib/              # Utility functions and configurations
├── public/               # Static assets
├── .env.example          # Environment variables template
├── package.json          # Dependencies and scripts
├── tailwind.config.js    # Tailwind CSS configuration
├── tsconfig.json         # TypeScript configuration
└── README.md            # This file
```

## Configuration

The project uses a centralized configuration system located in `src/config/env.ts`:

- **Environment Variables**: Copy `.env.example` to `.env.local` and customize as needed
- **Type Safety**: All configuration is fully typed with TypeScript
- **Validation**: Missing or invalid environment variables show helpful warnings in development
- **Security**: Server-only variables are never exposed to the browser

### Available Environment Variables

- `NEXT_PUBLIC_SITE_NAME` - Site name (exposed to browser)
- `NEXT_PUBLIC_TIMEZONE` - Default timezone (exposed to browser)  
- `NEXT_PUBLIC_PAYMENTS_ENABLED` - Enable/disable payment features (exposed to browser)
- `JWT_SECRET` - Secret for JWT token creation (server-only)
- `DATABASE_URL` - Database connection string (server-only)

## Development

This project uses:
- **Next.js App Router** for file-based routing
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **ESLint** for code quality

## CI/CD

The project includes GitHub Actions workflow that runs on every push and pull request:
- Installs dependencies with pnpm
- Runs TypeScript type checking
- Builds the application
- Ensures code quality with ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `pnpm typecheck` and `pnpm build` to ensure everything works
5. Submit a pull request

## License

This project is private and proprietary.