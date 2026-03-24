import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';
import '../styles/Landing.css';
import GlobalNavbar from '../components/GlobalNavbar';

const About = () => {
  const navigate = useNavigate();

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
    <div className="about-page">
      <GlobalNavbar />
      
      <section className="about-hero">
        <div className="hero-orb hero-orb1" style={{ animation: 'float 8s ease-in-out infinite' }}></div>
        <div className="reveal">
          <div className="hero-pill"><div className="hero-pill-dot"></div><div className="hero-pill-txt">Our Story</div></div>
          <h1 style={{ fontSize: 'clamp(36px, 4vw, 56px)', color: 'var(--foam)', marginBottom: '16px' }}>
            Built by café lovers,<br /><br /><span style={{ color: 'var(--caramel)' }}>for café operators.</span>
          </h1>
          <p style={{ fontSize: '16px', color: '#A08060', lineHeight: '1.7', maxWidth: '460px' }}>
            BrewIQ was born out of frustration — watching great cafés lose thousands every month to spoiled milk, 
            empty coffee jars, and manual spreadsheets. We built the AI system we wished existed.
          </p>
        </div>
        <div className="reveal" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div style={{ background: 'rgba(255,250,243,.06)', border: '1px solid rgba(232,213,176,.12)', borderRadius: '14px', padding: '24px' }}>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '36px', color: 'var(--caramel)', fontWeight: '700' }}>2023</div>
            <div style={{ color: '#A08060', fontSize: '13px', marginTop: '4px' }}>Founded in Mumbai</div>
          </div>
          <div style={{ background: 'rgba(255,250,243,.06)', border: '1px solid rgba(232,213,176,.12)', borderRadius: '14px', padding: '24px' }}>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '36px', color: 'var(--matcha)', fontWeight: '700' }}>50+</div>
            <div style={{ color: '#A08060', fontSize: '13px', marginTop: '4px' }}>Cafés using BrewIQ</div>
          </div>
          <div style={{ background: 'rgba(255,250,243,.06)', border: '1px solid rgba(232,213,176,.12)', borderRadius: '14px', padding: '24px' }}>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '36px', color: 'var(--berry)', fontWeight: '700' }}>₹2Cr</div>
            <div style={{ color: '#A08060', fontSize: '13px', marginTop: '4px' }}>Waste prevented</div>
          </div>
          <div style={{ background: 'rgba(255,250,243,.06)', border: '1px solid rgba(232,213,176,.12)', borderRadius: '14px', padding: '24px' }}>
            <div style={{ fontFamily: 'Playfair Display, serif', fontSize: '36px', color: 'var(--sky)', fontWeight: '700' }}>12</div>
            <div style={{ color: '#A08060', fontSize: '13px', marginTop: '4px' }}>Team members</div>
          </div>
        </div>
      </section>

      <section className="about-section reveal" style={{ background: 'var(--milk)', padding: '80px' }}>
        <div className="section-label">Our Team</div>
        <h2 className="section-title">The people behind BrewIQ.</h2>
        <div className="team-grid">
          <div className="team-card"><div className="team-avatar" style={{ background: 'var(--caramel)', color: 'var(--espresso)' }}>AM</div><div className="team-name">Arjun Mehta</div><div className="team-role">CEO & Co-founder</div></div>
          <div className="team-card"><div className="team-avatar" style={{ background: 'var(--matcha-l)', color: 'var(--matcha-d)' }}>SK</div><div className="team-name">Sneha Kapoor</div><div className="team-role">CTO & Co-founder</div></div>
          <div className="team-card"><div className="team-avatar" style={{ background: 'var(--berry-l)', color: 'var(--berry-d)' }}>RP</div><div className="team-name">Rahul Patel</div><div className="team-role">Head of AI</div></div>
          <div className="team-card"><div className="team-avatar" style={{ background: 'var(--sky-l)', color: 'var(--sky-d)' }}>PS</div><div className="team-name">Priya Sharma</div><div className="team-role">Head of Design</div></div>
        </div>
      </section>

      <section className="about-section reveal" style={{ background: 'var(--foam)', padding: '80px' }}>
        <div className="section-label">Our Values</div>
        <h2 className="section-title">What drives us every day.</h2>
        <div className="values-grid">
          <div className="val-card"><div className="val-icon">♻️</div><h3 className="val-title">Zero Waste Philosophy</h3><p className="val-desc">Every feature we build is designed to reduce food waste. It's not just business — it's our responsibility to the planet.</p></div>
          <div className="val-card"><div className="val-icon">🧠</div><h3 className="val-title">AI for Everyone</h3><p className="val-desc">Powerful AI shouldn't require a data science team. BrewIQ makes enterprise-grade intelligence accessible to every café owner.</p></div>
          <div className="val-card"><div className="val-icon">☕</div><h3 className="val-title">Café First</h3><p className="val-desc">We obsess over the real problems café operators face — not theoretical ones. Every feature is born from real conversations.</p></div>
        </div>
      </section>

      <footer style={{ background: 'var(--espresso)', padding: '40px 80px', borderTop: '1px solid var(--roast)' }}>
        <div className="footer-bottom" style={{ border: 'none', padding: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="footer-copy" style={{ color: '#785840', fontSize: '12px' }}>© 2025 BrewIQ. Built for café operators who care about quality.</div>
          <div className="footer-copy" style={{ color: '#785840', fontSize: '12px' }}>Made with ☕ in India</div>
        </div>
      </footer>
    </div>
  );
};

export default About;
