import React, { useState } from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  const [footerFormStatus, setFooterFormStatus] = useState<string>("");
  const [footerFormLoading, setFooterFormLoading] = useState(false);

  const handleFooterFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFooterFormLoading(true);
    setFooterFormStatus("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const honeypot = formData.get("company") as string;

    // Check honeypot
    if (honeypot) {
      setFooterFormLoading(false);
      return;
    }

    // Client-side email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      setFooterFormStatus("Please enter a valid email address.");
      setFooterFormLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest"
        },
        body: JSON.stringify({
          fullName: "Subscriber",
          email,
          interest: "home_footer",
          consent: true
        })
      });

      if (response.ok) {
        setFooterFormStatus("Thanks—check your inbox!");
        (e.target as HTMLFormElement).reset();
        // Analytics
        if (typeof window !== "undefined" && (window as { dataLayer?: unknown[] }).dataLayer) {
          ((window as unknown) as { dataLayer: unknown[] }).dataLayer.push({
            event: "email_signup",
            location: "footer"
          });
        }
      } else {
        setFooterFormStatus("Something went wrong. Please try again.");
      }
    } catch (error) {
      setFooterFormStatus("Network error. Please check your connection and try again.");
    } finally {
      setFooterFormLoading(false);
    }
  };

  return (
  <footer className="border-brand-navy/10 border-t bg-white">
    <div className="mx-auto grid max-w-6xl items-start gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
      <div>
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-lg bg-brand-blue text-lg text-white">★</div>
          <span className="text-xl font-extrabold tracking-tight text-brand-navy">PRTD</span>
        </div>
        <p className="text-brand-navy/80 mt-3">Committed to the travelers—and businesses—of Puerto Rico.</p>
        <div className="text-brand-navy/70 mt-4 flex gap-3">
          <a 
            href="https://www.instagram.com/puertoricotraveldeals" 
            target="_blank" 
            rel="noopener noreferrer"
            className="ring-brand-navy/20 hover:bg-brand-navy/10 grid size-9 place-items-center rounded-full ring-1"
          >
            IG
          </a>
          {['FB','IN','YT'].map(x => (
            <span key={x} className="ring-brand-navy/20 grid size-9 place-items-center rounded-full ring-1">{x}</span>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-lg font-black">STAY IN THE KNOW!</h4>
        <p className="text-brand-navy/70 text-sm">Subscribe to our newsletter.</p>
        <form className="mt-3" onSubmit={handleFooterFormSubmit}>
          <div className="flex gap-2">
            <input 
              type="email" 
              name="email"
              placeholder="Email Address" 
              required
              disabled={footerFormLoading}
              className="flex-1 rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue"
              aria-label="Email address"
            />
            <button 
              type="submit"
              disabled={footerFormLoading}
              className="hover:bg-brand-blue/90 rounded-xl bg-brand-blue px-5 py-3 font-bold text-white shadow disabled:cursor-not-allowed disabled:opacity-50"
            >
              {footerFormLoading ? "..." : "Sign up"}
            </button>
          </div>
          {/* Honeypot field */}
          <input
            type="text"
            name="company"
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
          />
          {footerFormStatus && (
            <div aria-live="polite" className="text-brand-navy/70 mt-2 text-sm">
              {footerFormStatus}
            </div>
          )}
        </form>
      </div>
      <div className="text-brand-navy/80 text-sm">
        <ul className="space-y-2">
          <li><Link href="/deals" className="hover:text-brand-blue">Deals</Link></li>
          <li><Link href="/about" className="hover:text-brand-blue">About Us</Link></li>
          <li><Link href="/partner" className="hover:text-brand-blue">Submit a Deal</Link></li>
        </ul>
      </div>
    </div>
    <div className="border-brand-navy/10 text-brand-navy/70 border-t p-4 text-center text-sm sm:px-6">
      <p className="mb-2">
        <strong>Affiliate Disclosure:</strong> We may earn commissions from bookings made through our partner links. This helps us provide free access to curated deals.
      </p>
      <p>© {new Date().getFullYear()} PRTD. All rights reserved. • <a href="mailto:legal@puertoricotraveldeals.com" className="hover:text-brand-blue">Privacy</a> • <a href="mailto:legal@puertoricotraveldeals.com" className="hover:text-brand-blue">Terms</a></p>
    </div>
  </footer>
  );
};