import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';
import GlobalNavbar from '../components/GlobalNavbar';

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          // Once animated, we can unobserve if we want it to stay
          // observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.reveal, .reveal-scale');
    revealElements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="home-page">
      <GlobalNavbar />
      
      {/* HERO */}
      <section className="hero">
        <div className="hero-orb hero-orb1" style={{ animation: 'float 8s ease-in-out infinite' }}></div>
        <div className="hero-orb hero-orb2" style={{ animation: 'float 10s ease-in-out infinite reverse' }}></div>
        <div>
          <div className="hero-pill" style={{ animation: 'fadeUp .6s ease' }}>
            <div className="hero-pill-dot"></div>
            <div className="hero-pill-txt">AI-Powered Inventory Intelligence</div>
          </div>
          <h1 style={{ animation: 'fadeUp .7s .1s ease both' }}>From bean to cup,<br /><span>nothing wasted.</span></h1>
          <p className="hero-sub" style={{ animation: 'fadeUp .7s .2s ease both' }}>
            BrewIQ is the AI-first inventory management system built for modern café chains — 
            predicting demand, preventing waste, and automating reorders before you run out.
          </p>
          <div className="hero-btns" style={{ animation: 'fadeUp .7s .3s ease both' }}>
            <button className="btn-primary" onClick={() => navigate('/login')}>Open Inventory App</button>
            <button className="btn-secondary" onClick={() => document.getElementById('features-section').scrollIntoView({ behavior: 'smooth' })}>
              See Features ↓
            </button>
          </div>
          <div className="hero-stats" style={{ animation: 'fadeUp .7s .4s ease both' }}>
            <div className="hero-stat"><div className="hero-stat-num">94.2%</div><div className="hero-stat-label">AI forecast accuracy</div></div>
            <div className="hero-stat"><div className="hero-stat-num">₹28.6K</div><div className="hero-stat-label">Waste prevented / month</div></div>
            <div className="hero-stat"><div className="hero-stat-num">3 min</div><div className="hero-stat-label">Avg reorder time</div></div>
          </div>
        </div>
        <div className="hero-visual" style={{ animation: 'scaleIn .9s .2s ease both' }}>
          <div className="hero-card">
            <div className="hero-card-header">
              <div className="hero-card-dot"></div>
              <div className="hero-card-title" style={{ color: 'var(--latte)' }}>BrewIQ AI · Live Insights</div>
            </div>
            {[
              { name: 'Arabica Beans · Mumbai', progress: 8, color: '#F87171', badge: 'Critical', bClass: 'hm-red' },
              { name: 'Whole Milk · Pune', progress: 65, color: '#6DBF8C', badge: 'Good', bClass: 'hm-green' },
              { name: 'Oat Milk · Pune', progress: 20, color: '#F59E0B', badge: 'Low', bClass: 'hm-amber' },
              { name: 'Vanilla Syrup · Delhi', progress: 10, color: '#F87171', badge: 'Critical', bClass: 'hm-red' },
              { name: 'Robusta Beans · Delhi', progress: 80, color: '#6DBF8C', badge: 'OK', bClass: 'hm-green' },
            ].map((m, i) => (
              <div className="hero-metric" key={i}>
                <span className="hm-name">{m.name}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="mini-bar-bg">
                    <div className="mini-bar-f" style={{ width: `${m.progress}%`, background: m.color, height: '100%', borderRadius: '3px' }}></div>
                  </div>
                  <span className={`hm-badge ${m.bClass}`}>{m.badge}</span>
                </div>
              </div>
            ))}
            <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(232,213,176,.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: '#785840', fontSize: '11px' }}>AI auto-ordered Arabica</span>
              <span className="hm-badge hm-green">✓ Done</span>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="features reveal" id="features-section">
        <div className="section-label">Features</div>
        <h2 className="section-title">Everything your café needs,<br />powered by AI.</h2>
        <p className="section-sub">From real-time stock tracking to AI-driven demand forecasting — BrewIQ handles the complexity so your team can focus on crafting the perfect cup.</p>
        <div className="features-grid">
          {[
            { icon: '🧠', title: 'AI Demand Forecast', desc: 'Predict how much milk, coffee beans, and syrups you\'ll need based on weather, weekday patterns, local events and past sales.', tag: '94.2% accuracy', border: 'var(--caramel)' },
            { icon: '♻️', title: 'Waste Prevention', desc: 'AI flags items about to expire and suggests markdowns, menu specials, or transfers to branches with higher demand before it\'s too late.', tag: '₹28.6K saved/month', border: 'var(--matcha)' },
            { icon: '🔄', title: 'Auto Replenishment', desc: 'Set min-max rules and let BrewIQ automatically raise purchase orders to suppliers before you stock out — zero manual intervention needed.', tag: '18 auto-orders this month', border: 'var(--berry)' },
            { icon: '🏪', title: 'Multi-Branch Management', desc: 'Manage Mumbai, Pune, Delhi and every future branch from a single dashboard. Transfer stock between branches in two clicks.', tag: '3 branches live', border: 'var(--sky)' },
            { icon: '🚨', title: 'Anomaly Detection', desc: 'BrewIQ\'s AI detects unusual stock drops, theft risks, spoilage patterns, and over-ordering — and alerts your team instantly.', tag: 'Real-time alerts', border: 'var(--cinnamon)' },
            { icon: '💬', title: 'Natural Language AI Chat', desc: 'Ask "What will we run out of this weekend?" or "Which branch has the most waste?" and get instant, data-driven answers.', tag: 'GPT-powered', border: 'var(--mocha)' }
          ].map((f, i) => (
            <div className="feat-card" key={i} style={{ borderTop: `3px solid ${f.border}` }}>
              <div className="feat-icon">{f.icon}</div>
              <h3 className="feat-title">{f.title}</h3>
              <p className="feat-desc">{f.desc}</p>
              <div className="feat-tag">{f.tag}</div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how reveal">
        <div className="how-orb how-orb1"></div>
        <div className="how-orb how-orb2"></div>
        <div className="how-label">How it works</div>
        <h2 className="how-title">Up and running in 4 steps.</h2>
        <div className="how-steps">
          {[
            { num: 1, title: 'Connect Your Branches', desc: 'Add your café locations, set capacity, assign managers and configure supplier contacts.' },
            { num: 2, title: 'Import Ingredients', desc: 'Upload your ingredient catalog with units, reorder levels, and expiry rules. BrewIQ learns your menu structure.' },
            { num: 3, title: 'AI Learns Your Patterns', desc: 'After 7 days, the AI model calibrates demand forecasts using your sales data, footfall, and seasonal patterns.' },
            { num: 4, title: 'Sit Back & Brew', desc: 'BrewIQ handles reorders, waste alerts, and transfers automatically. You focus on the coffee.' }
          ].map((s, i) => (
            <div className="how-step" key={i}>
              <div className="how-step-num">{s.num}</div>
              <div className="how-step-title">{s.title}</div>
              <p className="how-step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* AI INTELLIGENCE */}
      <section className="ai-section reveal">
        <div>
          <div className="section-label">AI Intelligence</div>
          <h2 className="section-title">Your smartest employee doesn't sleep.</h2>
          <p className="section-sub" style={{ margin: 0, textAlign: 'left' }}>BrewIQ's AI engine runs 24/7, monitoring every ingredient across every branch — predicting, preventing, and acting.</p>
          <div className="ai-feature-list">
            {[
              { icon: '🌿', title: 'Demand Spike Prediction', desc: 'Know 7 days ahead when you\'ll need 35% more cold brew or double the croissants.', cls: 'g' },
              { icon: '🍂', title: 'Smart Expiry Management', desc: 'AI calculates optimal discount timing so perishables sell before they expire, not after.', cls: 'a' },
              { icon: '🍒', title: 'Theft & Spoilage Detection', desc: 'Unexplained stock drops trigger instant anomaly alerts with root cause suggestions.', cls: 'b' },
              { icon: '☁️', title: 'Weather-Aware Forecasting', desc: 'Heat wave coming? AI pre-orders extra iced tea and cold brew before your team even notices.', cls: 's' }
            ].map((af, i) => (
              <div className="ai-feat" key={i}>
                <div className={`ai-feat-icon ${af.cls}`}>{af.icon}</div>
                <div>
                  <div className="ai-feat-title">{af.title}</div>
                  <div className="ai-feat-desc">{af.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="ai-visual reveal-scale">
          <div className="ai-visual-orb" style={{ width: '300px', height: '300px', background: 'var(--caramel)', top: '-100px', right: '-100px' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--matcha)', animation: 'blink 1.8s infinite' }}></div>
            <span style={{ color: 'var(--latte)', fontSize: '12px', fontWeight: '700' }}>BrewIQ AI Chat</span>
          </div>
          <div className="ai-chat-msg"><div className="ai-msg-ai"><div className="ai-msg-ai-txt">Hello! I'm monitoring 48 ingredients across 3 branches right now. What would you like to know?</div></div></div>
          <div className="ai-chat-msg" style={{ animationDelay: '.3s' }}><div className="ai-msg-u"><div className="ai-msg-u-txt">What will we run out of this weekend?</div></div></div>
          <div className="ai-chat-msg" style={{ animationDelay: '.6s' }}><div className="ai-msg-ai"><div className="ai-msg-ai-txt">High risk items: Oat Milk at Pune (4L left, need 12L), Vanilla Syrup at Delhi (1 bottle, need 3), Croissants at Mumbai (6 pcs, forecast 40+). I've queued replenishment orders — approve with one click?</div></div></div>
          <div style={{ display: 'flex', gap: '6px', marginTop: '14px', flexWrap: 'wrap' }}>
            <div className="chip">Arabica stock?</div>
            <div className="chip">Weekend risk?</div>
            <div className="chip">Waste alerts?</div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="pricing reveal">
        <div style={{ textAlign: 'center' }}>
          <div className="section-label">Pricing</div>
          <h2 className="section-title">Simple, transparent pricing.</h2>
          <p className="section-sub" style={{ margin: '0 auto' }}>Start free, scale as you grow. No hidden fees, no long-term contracts.</p>
        </div>
        <div className="pricing-grid">
          <div className="price-card">
            <div className="price-plan">Starter</div>
            <div><span className="price-amount">₹0</span><span className="price-period">/month</span></div>
            <p className="price-desc">Perfect for single-location cafés just getting started with inventory management.</p>
            <div className="price-divider"></div>
            <ul className="price-features">
              <li>1 Branch</li><li>Up to 50 ingredients</li><li>Basic stock tracking</li><li>Manual reorder alerts</li><li>Email support</li>
            </ul>
            <button className="price-btn">Get started free</button>
          </div>
          <div className="price-card featured">
            <div className="price-badge">Most Popular</div>
            <div className="price-plan">Growth</div>
            <div><span className="price-amount">₹4,999</span><span className="price-period">/month</span></div>
            <p className="price-desc">For growing café chains with multiple branches and real AI needs.</p>
            <div className="price-divider"></div>
            <ul className="price-features">
              <li>Up to 5 Branches</li><li>Unlimited ingredients</li><li>AI demand forecasting</li><li>Auto-replenishment</li><li>Waste prevention AI</li><li>Priority support</li>
            </ul>
            <button className="price-btn">Start 14-day trial</button>
          </div>
          <div className="price-card">
            <div className="price-plan">Enterprise</div>
            <div><span className="price-amount">Custom</span></div>
            <p className="price-desc">For large chains with 10+ branches, custom integrations and dedicated support.</p>
            <div className="price-divider"></div>
            <ul className="price-features">
              <li>Unlimited branches</li><li>Custom AI models</li><li>ERP / POS integration</li><li>Dedicated success manager</li><li>SLA guarantee</li>
            </ul>
            <button className="price-btn" onClick={() => navigate('/contact')}>Talk to sales →</button>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials reveal">
        <div style={{ textAlign: 'center' }}>
          <div className="how-label">Testimonials</div>
          <h2 className="how-title" style={{ color: 'var(--foam)', marginBottom: 0 }}>Loved by café operators.</h2>
        </div>
        <div className="testi-grid">
          {[
            { name: 'Rahul Patel', role: 'Owner · Third Wave Café, Mumbai', avatar: 'RP', color: 'var(--caramel)', text: '"BrewIQ cut our monthly waste by 40%. The AI predicted we\'d need extra cold brew before a heat wave we didn\'t even know was coming. Incredible."' },
            { name: 'Sneha Kapoor', role: 'Operations Head · Brew & Co., Pune', avatar: 'SK', color: 'var(--matcha)', text: '"We manage 4 branches and BrewIQ keeps everything in sync. The auto-reorder alone saved us 8 hours of manual work every week."' },
            { name: 'Arjun Mehta', role: 'Founder · Bean Theory, Delhi', avatar: 'AM', color: 'var(--berry)', text: '"The AI chat is a game changer. I just ask "what\'s low at Delhi?" and instantly know what to order. Feels like having a data analyst on call 24/7."' }
          ].map((t, i) => (
            <div className="testi-card" key={i}>
              <div className="testi-quote">"</div>
              <p className="testi-text">{t.text}</p>
              <div className="testi-author">
                <div className="testi-avatar" style={{ background: t.color }}>{t.avatar}</div>
                <div>
                  <div className="testi-name">{t.name}</div>
                  <div className="testi-role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section reveal">
        <h2 className="cta-title">Ready to brew smarter?</h2>
        <p className="cta-sub">Join café operators across India who've cut waste, eliminated stockouts, and freed their teams to focus on what matters — the coffee.</p>
        <div className="cta-btns">
          <button className="btn-primary" onClick={() => navigate('/login')}>Open Inventory App</button>
          <button className="btn-secondary" style={{ color: 'var(--mocha)', borderColor: 'var(--border)' }} onClick={() => navigate('/contact')}>Talk to us</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-grid">
          <div><div className="footer-brand" style={{ color: 'var(--latte)' }}>☕ BrewIQ</div><p className="footer-desc">AI-powered inventory intelligence for modern café chains. From bean to cup — nothing wasted.</p></div>
          <div><div className="footer-col-title">Product</div><div className="footer-link" onClick={() => navigate('/dashboard')}>Inventory App</div><div className="footer-link">Features</div><div className="footer-link">Pricing</div><div className="footer-link">Changelog</div></div>
          <div><div className="footer-col-title">Company</div><div className="footer-link" onClick={() => navigate('/about')}>About Us</div><div className="footer-link">Blog</div><div className="footer-link">Careers</div><div className="footer-link" onClick={() => navigate('/contact')}>Contact</div></div>
          <div><div className="footer-col-title">Support</div><div className="footer-link">Documentation</div><div className="footer-link">API Reference</div><div className="footer-link">Community</div><div className="footer-link">Status</div></div>
        </div>
        <div className="footer-bottom" style={{ borderTop: '1px solid var(--roast)' }}>
          <div className="footer-copy">© 2025 BrewIQ. Built for café operators who care about quality.</div>
          <div className="footer-copy">Made with ☕ in India</div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
