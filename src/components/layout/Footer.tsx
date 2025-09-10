import Link from "next/link"
import { getClientConfig } from "@/config/env"

export function Footer() {
  const config = getClientConfig()

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="font-semibold">{config.siteName}</h3>
            <p className="text-sm text-muted-foreground">
              Fast, private, in-browser PDF and text tools. Your files never leave your device.
            </p>
          </div>

          {/* Tools */}
          <div className="space-y-4">
            <h4 className="font-semibold">Tools</h4>
            <div className="space-y-2">
              <Link
                href="/tools/pdf-merge"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Merge PDF
              </Link>
              <Link
                href="/tools/pdf-split"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Split PDF
              </Link>
              <Link
                href="/tools/pdf-compress"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Compress PDF
              </Link>
              <Link
                href="/tools/word-counter"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Word Counter
              </Link>
            </div>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="font-semibold">Company</h4>
            <div className="space-y-2">
              <Link
                href="/pricing"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/blog"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Blog
              </Link>
              <Link
                href="/about"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                About
              </Link>
            </div>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h4 className="font-semibold">Legal</h4>
            <div className="space-y-2">
              <Link
                href="/privacy"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/cookies"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Cookie Policy
              </Link>
              <Link
                href="/imprint"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Imprint
              </Link>
              <Link
                href="/sitemap"
                className="block text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Sitemap
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              &copy; 2024 {config.siteName}. All rights reserved.
            </p>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Made with ❤️ for privacy
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
