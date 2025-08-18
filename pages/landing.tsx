import React, { useState } from "react";
import { LandingHeader } from "@/ui/landing/LandingHeader";
import { LandingHero } from "@/ui/landing/LandingHero";

// Puerto Rico Flag palette
// PR Blue: #0050A4  | PR Red: #ED1C24  | Sand (bg): #FFF7EA | Navy: #0B2B54
// Whites and tints for contrast; large type + bold CTAs inspired by provided screenshots.

export default function PRTDPRFlagLanding() {
  const [joined, setJoined] = useState(false);
  const [partnered, setPartnered] = useState(false);

  const onJoin = (e) => { e.preventDefault(); setJoined(true); };
  const onPartner = (e) => { e.preventDefault(); setPartnered(true); };

  return (
  <div className="min-h-screen w-full bg-brand-sand text-brand-navy">
      {/* Top Announcement Ribbon */}
  <div className="w-full bg-brand-red text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-2 flex items-center justify-between text-sm font-semibold tracking-wide">
          <span className="uppercase">Launch week is coming to Puerto Rico 🇵🇷</span>
          <a href="#stories" className="inline-flex items-center gap-2 bg-white/15 rounded-full px-3 py-1 ring-1 ring-white/30 hover:bg-white/25">Ver stories ➜</a>
        </div>
      </div>

  {/* Header / Nav */}
  <LandingHeader />

  {/* Hero Carousel-style Panel */}
  <LandingHero />

      {/* NEW DEALS CTA */}
  <section id="deals" className="bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
          <div className="rounded-3xl bg-brand-blue/10 ring-1 ring-brand-blue/20 p-6 sm:p-8">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <h2 className="text-3xl sm:text-4xl font-black text-brand-navy">NEW DEALS COMING</h2>
              <a href="#waitlist" className="inline-flex items-center gap-3 rounded-full bg-brand-navy text-white px-5 py-3 font-bold shadow hover:bg-brand-navy/90">
                Explore early access <span>➜</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Split Banner: Connect + Mission (inspired by screenshots) */}
      <section className="">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 grid md:grid-cols-2 gap-0">
          <div className="bg-brand-red text-white p-10 md:rounded-l-3xl md:rounded-r-none rounded-3xl">
            <h3 className="text-4xl font-black leading-tight">CONNECT WITH DEALS IN PUERTO RICO</h3>
          </div>
          <div className="bg-brand-navy text-white p-10 md:rounded-r-3xl md:rounded-l-none rounded-3xl">
            <p className="text-xl leading-relaxed">PRTD connects travelers with the best local offers while supporting Puerto Rico businesses. We believe travel savings and local impact can go together.</p>
          </div>
        </div>
      </section>

      {/* What we can do for you */}
      <section id="value" className="bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
          <h3 className="text-3xl sm:text-4xl font-black text-center">WHAT WE CAN DO FOR YOU</h3>
          <div className="mt-6 grid md:grid-cols-2 gap-8">
            {/* Travelers */}
            <div className="rounded-3xl bg-brand-blue/5 ring-1 ring-brand-blue/20 p-6 sm:p-8">
              <h4 className="text-3xl font-black text-brand-navy">TRAVELERS</h4>
              <ul className="mt-4 space-y-3 text-lg text-brand-navy">
                <li>• Join the waitlist and tell us your trip window</li>
                <li>• Get first dibs on launch‑week coupons</li>
                <li>• Transparent prices (taxes & fees up front)</li>
                <li>• Trusted partners and flexible vouchers</li>
              </ul>
              <a href="#waitlist" className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-navy text-white px-6 py-3 font-bold shadow hover:bg-brand-navy/90">Join the Waitlist ➜</a>
            </div>
            {/* Businesses */}
            <div className="rounded-3xl bg-brand-red/5 ring-1 ring-brand-red/20 p-6 sm:p-8">
              <h4 className="text-3xl font-black text-brand-navy">BUSINESSES</h4>
              <ul className="mt-4 space-y-3 text-lg text-brand-navy">
                <li>• Meet new customers without upfront ad spend</li>
                <li>• Launch‑week marketing boost</li>
                <li>• Vendor dashboard to track redemptions</li>
                <li>• Predictable payouts</li>
              </ul>
              <a href="#partners" className="mt-6 inline-flex items-center gap-2 rounded-full bg-brand-red text-white px-6 py-3 font-bold shadow hover:bg-brand-red/90">Become a Partner ➜</a>
            </div>
          </div>
        </div>
      </section>

      {/* Forms: Waitlist + Partner intake */}
      <section id="waitlist" className="bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12 grid lg:grid-cols-2 gap-8 items-start">
          {/* Waitlist */}
          <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-xl ring-1 ring-black/5">
            <h4 className="text-2xl font-black text-brand-navy">Join the Waitlist</h4>
            <p className="text-brand-navy/80 mt-2">Be first to claim limited launch deals. We’ll email you when we go live.</p>
            {!joined ? (
              <form onSubmit={onJoin} className="mt-5 grid gap-4">
                <input required name="name" placeholder="Full name" className="rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue" />
                <input required type="email" name="email" placeholder="Email" className="rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue" />
                <select name="window" className="rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue">
                  <option>Not sure yet</option>
                  <option>This month</option>
                  <option>Next 1–3 months</option>
                  <option>3–6 months</option>
                </select>
                <label className="text-sm inline-flex items-start gap-2">
                  <input type="checkbox" required className="mt-1" />
                  I agree to receive emails about PRTD and accept the Privacy Policy.
                </label>
                <button type="submit" className="rounded-xl bg-brand-red text-white px-6 py-3 font-bold shadow hover:bg-brand-red/90">Sign me up</button>
              </form>
            ) : (
              <div className="mt-4 rounded-xl bg-emerald-50 text-emerald-800 px-4 py-3">Thank you! You’re on the list.</div>
            )}
          </div>

          {/* Partner Intake */}
          <div id="partners" className="rounded-3xl bg-white p-6 sm:p-8 shadow-xl ring-1 ring-black/5">
            <h4 className="text-2xl font-black text-brand-navy">Become a Partner</h4>
            <p className="text-brand-navy/80 mt-2">List a launch deal; we’ll help bring you new travelers with zero upfront cost.</p>
            {!partnered ? (
              <form onSubmit={onPartner} className="mt-5 grid gap-4">
                <input required name="company" placeholder="Business name" className="rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-red" />
                <input required name="contact" placeholder="Point of contact" className="rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-red" />
                <input required type="email" name="email" placeholder="Business email" className="rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-red" />
                <select name="category" className="rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-red">
                  <option>Hotel</option>
                  <option>Restaurant</option>
                  <option>Tour / Experience</option>
                  <option>Other</option>
                </select>
                <textarea name="notes" rows={3} placeholder="Describe your launch deal…" className="rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-red" />
                <button type="submit" className="rounded-xl bg-brand-navy text-white px-6 py-3 font-bold shadow hover:bg-brand-navy/90">Contact me</button>
              </form>
            ) : (
              <div className="mt-4 rounded-xl bg-emerald-50 text-emerald-800 px-4 py-3">Thanks! We’ll reach out with onboarding details.</div>
            )}
          </div>
        </div>
      </section>

      {/* Partners Logos */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
          <h3 className="text-3xl sm:text-4xl font-black text-center">OUR PARTNERS</h3>
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-6 items-center">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-brand-navy/5 ring-1 ring-brand-navy/10 grid place-items-center text-brand-navy/60 font-bold">Logo</div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <a href="#partners" className="inline-flex items-center gap-2 rounded-full bg-brand-blue text-white px-6 py-3 font-bold shadow hover:bg-brand-blue/90">View all ➜</a>
          </div>
        </div>
      </section>

      {/* Newsletter + Footer */}
  <footer className="border-t border-brand-navy/10 bg-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 grid md:grid-cols-3 gap-8 items-start">
          <div>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-brand-blue grid place-items-center text-white text-lg">★</div>
              <span className="font-extrabold tracking-tight text-brand-navy text-xl">PRTD</span>
            </div>
            <p className="mt-3 text-brand-navy/80">Committed to the travelers—and businesses—of Puerto Rico.</p>
            <div className="mt-4 flex gap-3 text-brand-navy/70">
              {['FB','IG','IN','YT'].map(x => (
                <span key={x} className="h-9 w-9 grid place-items-center rounded-full ring-1 ring-brand-navy/20">{x}</span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-black text-lg">STAY IN THE KNOW!</h4>
            <p className="text-sm text-brand-navy/70">Subscribe to our newsletter.</p>
            <form className="mt-3 flex gap-2">
              <input type="email" placeholder="Email Address" className="flex-1 rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue" />
              <button className="rounded-xl bg-brand-blue text-white px-5 py-3 font-bold shadow hover:bg-brand-blue/90">Sign up</button>
            </form>
          </div>
          <div className="text-sm text-brand-navy/80">
            <ul className="space-y-2">
              <li><a href="#deals" className="hover:text-brand-blue">Deals</a></li>
              <li><a href="#value" className="hover:text-brand-blue">What we do</a></li>
              <li><a href="#partners" className="hover:text-brand-blue">Become a partner</a></li>
              <li><a href="#faq" className="hover:text-brand-blue">FAQ</a></li>
            </ul>
          </div>
        </div>
  <div className="border-t border-brand-navy/10 text-center text-sm text-brand-navy/70 py-4">© {new Date().getFullYear()} PRTD. All rights reserved. • Privacy • Terms</div>
      </footer>
    </div>
  );
}
