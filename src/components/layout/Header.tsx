"use client"

import * as React from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme/ThemeToggle"
import { ToolsMegaMenu } from "@/components/nav/ToolsMegaMenu"
import { getClientConfig } from "@/config/env"

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  const config = getClientConfig()

  return (
    <>
      {/* Skip to content link for accessibility */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-xl font-bold">{config.siteName}</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <ToolsMegaMenu />
              <Link
                href="/pricing"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Pricing
              </Link>
              <Link
                href="/blog"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Blog
              </Link>
              <Link
                href="/account"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Account
              </Link>
            </nav>

            {/* Right side actions */}
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <div className="container mx-auto px-4 py-4 space-y-4">
              <div className="space-y-2">
                <Link
                  href="/tools"
                  className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Tools
                </Link>
                <Link
                  href="/pricing"
                  className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  href="/blog"
                  className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Blog
                </Link>
                <Link
                  href="/account"
                  className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Account
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
