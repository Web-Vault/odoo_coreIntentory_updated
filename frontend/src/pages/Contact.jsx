import React, { useEffect } from 'react';
import '../styles/Dashboard.css';
import GlobalNavbar from '../components/GlobalNavbar';

const Contact = () => {
  const toast = (title, sub) => {
    alert(`${title}: ${sub}`);
  };

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('active');
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="contact-page">
      <GlobalNavbar />
      
      <section className="contact-hero">
        <div className="hero-orb hero-orb1" style={{ animation: 'float 8s ease-in-out infinite' }}></div>
        <div className="hero-orb hero-orb2" style={{ animation: 'float 10s ease-in-out infinite reverse' }}></div>
        <div className="reveal">
          <div className="hero-pill" style={{ margin: '0 auto 20px', display: 'inline-flex' }}>
            <div className="hero-pill-dot"></div>
            <div className="hero-pill-txt">Get in Touch</div>
          </div>
          <h1 style={{ fontSize: 'clamp(36px, 4vw, 52px)', color: 'var(--foam)', marginBottom: '12px', position: 'relative', zIndex: 1 }}>
            Let's brew something<br /><br /><span style={{ color: 'var(--caramel)' }}>together.</span>
          </h1><br />
          <p style={{ fontSize: '16px', color: '#A08060', position: 'relative', zIndex: 1 }}>
            Have questions? Want a demo? Just want to chat about coffee and inventory? We're here.
          </p>
        </div>
      </section>

      <div style={{ background: 'var(--milk)', padding: '60px 80px' }}>
        <div className="reveal" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', maxWidth: '1000px', margin: '0 auto' }}>
          <div className="contact-form">
            <div className="form-title">Send us a message</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group"><label className="form-label">First Name</label><input className="form-input" placeholder="Arjun" /></div>
              <div className="form-group"><label className="form-label">Last Name</label><input className="form-input" placeholder="Mehta" /></div>
            </div>
            <div className="form-group"><label className="form-label">Email</label><input className="form-input" placeholder="arjun@cafe.com" type="email" /></div>
            <div className="form-group"><label className="form-label">Café / Company</label><input className="form-input" placeholder="Third Wave Café" /></div>
            <div className="form-group">
              <label className="form-label">Number of Branches</label>
              <select className="form-input form-select">
                <option>1 Branch</option>
                <option>2–5 Branches</option>
                <option>5–10 Branches</option>
                <option>10+ Branches</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Message</label>
              <textarea className="form-input form-textarea" placeholder="Tell us about your inventory challenges..."></textarea>
            </div>
            <button className="form-submit" onClick={() => toast('Message sent!', 'We\'ll get back to you within 24 hours ☕')}>
              Send Message ☕
            </button>
          </div>

          <div className="contact-info">
            <div className="ci-item"><div className="ci-icon">📧</div><div><div className="ci-title">Email Us</div><div className="ci-desc">hello@brewiq.in<br />support@brewiq.in</div></div></div>
            <div className="ci-item"><div className="ci-icon">📞</div><div><div className="ci-title">Call Us</div><div className="ci-desc">+91 98765 43210<br />Mon–Fri, 9am–6pm IST</div></div></div>
            <div className="ci-item"><div className="ci-icon">📍</div><div><div className="ci-title">Visit Us</div><div className="ci-desc">BrewIQ HQ, Bandra-Kurla Complex,<br />Mumbai, Maharashtra 400051</div></div></div>
            <div className="ci-item"><div className="ci-icon">💬</div><div><div className="ci-title">Live Chat</div><div className="ci-desc">Chat with our team directly in the app. Available 9am–9pm IST, 7 days a week.</div></div></div>
            <div className="map-placeholder">
              <div className="map-orb" style={{ width: '300px', height: '300px', background: 'var(--caramel)', top: '-100px', left: '-100px' }}></div>
              <div style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
                <div className="map-pin">📍</div>
                <div className="map-label">Mumbai, Maharashtra</div>
                <div style={{ color: '#785840', fontSize: '11px', marginTop: '4px' }}>Bandra-Kurla Complex</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer style={{ background: 'var(--espresso)', padding: '40px 80px', borderTop: '1px solid var(--roast)' }}>
        <div className="footer-bottom" style={{ border: 'none', padding: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="footer-copy" style={{ color: '#785840', fontSize: '12px' }}>© 2025 BrewIQ. Built for café operators who care about quality.</div>
          <div className="footer-copy" style={{ color: '#785840', fontSize: '12px' }}>Made with ☕ in India</div>
        </div>
      </footer>
    </div>
  );
};

export default Contact;
