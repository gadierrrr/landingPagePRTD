import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => (
  <footer className="border-brand-navy/10 border-t bg-white">
    <div className="mx-auto grid max-w-6xl items-start gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
      <div>
        <div className="flex items-center gap-3">
          <div className="grid size-9 place-items-center rounded-lg bg-brand-blue text-lg text-white">★</div>
          <span className="text-xl font-extrabold tracking-tight text-brand-navy">PRTD</span>
        </div>
        <p className="text-brand-navy/80 mt-3">Committed to the travelers—and businesses—of Puerto Rico.</p>
        <div className="text-brand-navy/70 mt-4 flex gap-3">
          {['FB','IG','IN','YT'].map(x => (
            <span key={x} className="ring-brand-navy/20 grid size-9 place-items-center rounded-full ring-1">{x}</span>
          ))}
        </div>
      </div>
      <div>
        <h4 className="text-lg font-black">STAY IN THE KNOW!</h4>
        <p className="text-brand-navy/70 text-sm">Subscribe to our newsletter.</p>
        <form className="mt-3 flex gap-2">
          <input type="email" placeholder="Email Address" className="flex-1 rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-blue" />
          <button className="hover:bg-brand-blue/90 rounded-xl bg-brand-blue px-5 py-3 font-bold text-white shadow">Sign up</button>
        </form>
      </div>
      <div className="text-brand-navy/80 text-sm">
        <ul className="space-y-2">
          <li><a href="#deals" className="hover:text-brand-blue">Deals</a></li>
          <li><a href="#value" className="hover:text-brand-blue">What we do</a></li>
          <li><Link href="/partner" className="hover:text-brand-blue">Become a partner</Link></li>
          <li><a href="#faq" className="hover:text-brand-blue">FAQ</a></li>
        </ul>
      </div>
    </div>
    <div className="border-brand-navy/10 text-brand-navy/70 border-t py-4 text-center text-sm">© {new Date().getFullYear()} PRTD. All rights reserved. • Privacy • Terms</div>
  </footer>
);