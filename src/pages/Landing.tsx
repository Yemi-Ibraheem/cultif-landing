import logoBlack from '../assets/Logo/Black.png';
import chefPlating from '../assets/Landing/chef-plating.png';
import chefAmara from '../assets/Landing/Nigerian-chef-Kensington-22.webp';
import healthyMealPrep from '../assets/Landing/healthymealprep.webp';
import dish0 from "../assets/Dishes/Homepagedishes/Jollof_Rice_with_Stew.jpg";
import dish1 from "../assets/Dishes/Homepagedishes/Indian dish.jpg";
import dish2 from "../assets/Dishes/Homepagedishes/Beef Enchiladas.webp";
import dish3 from "../assets/Dishes/Homepagedishes/Tuscan-Chicken-19.webp";
import dish4 from "../assets/Dishes/Homepagedishes/burger-with-melted-cheese.webp";
import dish5 from "../assets/Dishes/Homepagedishes/Mango pickle.jpg";
import dish6 from "../assets/Dishes/Homepagedishes/shakti-rajpurohit-F6ajnawxySY-unsplash.jpg";
import dish7 from "../assets/Dishes/Homepagedishes/slow-cooker-beef-dumplings-1.jpg";

import { getCountryFlagUrl } from '../utils/countryFlagUrl';
import { useMemo, useEffect, useState } from 'react';
import './Landing.css';

const homepageDishes = [dish0, dish1, dish2, dish3, dish4, dish5, dish6, dish7];
// Create rows by repeating/slicing the local assets
const row1Images = [...homepageDishes, ...homepageDishes.slice(0, 4)];
const row2Images = [...homepageDishes.slice(4), ...homepageDishes, ...homepageDishes.slice(0, 4)].slice(0, 12);

export default function Landing() {

  const handleGetStarted = () => window.location.href = "https://app.cultif.com/auth"
  const handleLogin = () => window.location.href = "https://app.cultif.com/auth"

  // Fetch flags from the app API for the automated scroll
  const rawCountries = [
    { name: "Nigeria", code: "NG" },
    { name: "India", code: "IN" },
    { name: "Mexico", code: "MX" },
    { name: "Italy", code: "IT" },
    { name: "Japan", code: "JP" },
    { name: "Brazil", code: "BR" },
    { name: "England", code: "GB" },
{ name: "United-States-Of-America", code: "US" },
{ name: "China", code: "CH" },
{ name: "Ghana", code: "GH" },
{ name: "Kenya", code: "KY" },
{ name: "Egypt", code: "EG" },
{ name: "Pakistan", code: "PK" },
{ name: "Saudi-Arabi", code: "SA" },
{ name: "United-Arab-Emirates", code: "AE" },
{ name: "Portugal", code: "PT" },
{ name: "Greece", code: "GR" },
{ name: "South-Africa", code: "SA" },
{ name: "Spain", code: "ES" },
{ name: "Turkey", code: "TK" },
{ name: "Morocco", code: "MO" },
{ name: "France", code: "FR" },
{ name: "Germany", code: "DE" },
{ name: "Netherlands", code: "NL" },
{ name: "Belgium", code: "BE" },
{ name: "Sweden", code: "SE" },
{ name: "Norway", code: "NO" },
{ name: "Denmark", code: "DK" },
{ name: "Finland", code: "FI" },
{ name: "Ireland", code: "IE" },
{ name: "Scotland", code: "GB" },
{ name: "Wales", code: "GB" },
{ name: "Australia", code: "AU" },
{ name: "New-Zealand", code: "NZ" },
{ name: "Canada", code: "CA" },
{ name: "Mexico", code: "MX" },
{ name: "Argentina", code: "AR" },
{ name: "Chile", code: "CL" },
{ name: "Peru", code: "PE" },
{ name: "Colombia", code: "CO" },
{ name: "Venezuela", code: "VE" },
{ name: "Ecuador", code: "EC" },
{ name: "Bolivia", code: "BO" },
{ name: "Paraguay", code: "PY" },
{ name: "Uruguay", code: "UY" },
{ name: "Costa-Rica", code: "CR" },
{ name: "Honduras", code: "HN" },
{ name: "Nicaragua", code: "NI" },
{ name: "Panama", code: "PA" },
{ name: "El-Salvador", code: "SV" },
{ name: "Guatemala", code: "GT" },
{ name: "Haiti", code: "HT" },
{ name: "Dominican-Republic", code: "DO" },
{ name: "Puerto-Rico", code: "PR" },
{ name: "Jamaica", code: "JM" },
{ name: "Trinidad-and-Tobago", code: "TT" },
  ];

  // Randomize the countries array on mount
  const randomizedFlags = useMemo(() => {
    if (!rawCountries) return [];
    const shuffled = [...rawCountries].sort(() => 0.5 - Math.random());
    return shuffled; // Pick a subset of 30 random countries
  }, [rawCountries]);

  // Track scroll for the food grid parallax effect
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="landing-page">
      {/* ─── NAVIGATION ─── */}
      <nav className="landing-nav">
        <div className="landing-nav-left">
          <img src={logoBlack} alt="Cultif" className="landing-nav-logo" />
          <div className="landing-nav-links">
            <a href="#features" className="landing-nav-link">Features</a>
            <a href="#library" className="landing-nav-link">Library</a>
            <a href="#creators" className="landing-nav-link">Creators Voices</a>
          </div>
        </div>
        <div className="landing-nav-right">
          <button className="landing-nav-login" onClick={handleLogin}>Login</button>
          <button className="landing-nav-cta" onClick={handleGetStarted}>Start Cooking</button>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="landing-hero">
        <div className="landing-hero-container">
          <div className="landing-hero-content">
            <span className="landing-hero-tagline">CREATOR ECONOMY FOR FOOD</span>
            <h1 className="landing-hero-title">
              Turn your culture<br />
              <span className="landing-highlight">into income.</span>
            </h1>
            <p className="landing-hero-subtitle">
              Share recipes, build a following, earn from your food knowledge.
              The all-in-one platform for modern culinary creators.
            </p>
            <div className="landing-hero-actions">
              <button className="landing-btn-primary" onClick={handleGetStarted}>
                Start earning with Cultif
              </button>
              <button 
                className="landing-btn-outline" 
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                See how it works
              </button>
            </div>

            <div className="landing-hero-creators-banner">
              <p>Join <strong>5,000+ creators</strong> sharing their recipes</p>
              <div className="landing-flags-marquee">
                <div className="landing-flags-track">
                  {[...randomizedFlags, ...randomizedFlags].map((c, i) => (
                    <img
                    key={`${c.code}-${i}`}
                      src={getCountryFlagUrl(c.code, '32x24')}
                      alt={c.name}
                      title={c.name}
                      className="landing-flag-img"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="landing-hero-visual">
            <div className="landing-hero-image-wrapper">
              <img src={chefPlating} alt="Chef plating a dish" className="landing-hero-img" />

              {/* Overlay Stat 1 */}
              <div className="landing-stat-overlay stat-top-left">
                <span className="stat-label">Monthly Earnings</span>
                <span className="stat-value">$4,850.00</span>
                <span className="stat-trend">↗ +12% this month</span>
              </div>

              {/* Overlay Stat 2 */}
              <div className="landing-stat-overlay stat-bottom-right">
                <span className="stat-value">31,450 new visits</span>
                <span className="stat-label">Views this Month</span>
                <div className="stat-chart-mockup"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── GOAL & GRID ─── */}
      <section className="landing-goal" id="library">
        <h2 className="landing-goal-title">
          Our goal is to have every<br />
          <span className="landing-highlight">culture represented under one roof</span>
        </h2>

        <div className="landing-food-parallax-container">
          <div
            className="landing-food-row"
            style={{ transform: `translateX(${-scrollY * 0.15}px)` }}
          >
            {[...row1Images, ...row1Images].map((src, i) => (
              <div key={`r1-${i}`} className="parallax-img-wrapper">
                <img src={src} alt="Culture Dish" loading="lazy" />
              </div>
            ))}
          </div>

          <div
            className="landing-food-row"
            style={{ transform: `translateX(${-200 + scrollY * 0.15}px)` }}
          >
            {[...row2Images, ...row2Images].map((src, i) => (
              <div key={`r2-${i}`} className="parallax-img-wrapper">
                <img src={src} alt="Culture Dish" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="landing-features" id="features">
        <div className="landing-features-header">
          <h2 className="landing-features-title">Upload once, earn forever.</h2>
          <p className="landing-features-subtitle">
            We've removed the barriers of being a self-made online chef,<br className="desktop-br" />
            and built an automated ecosystem of distribution and monetization.
          </p>
        </div>

        <div className="landing-features-cards">
          <div className="landing-feature-card">
            <div className="feature-icon-wrapper">
              <span className="feature-icon">🌟</span>
            </div>
            <h3>Build Your Brand</h3>
            <p>Gather audience profile, email lists, followers, inside your very own creator space. You connect directly with your customers.</p>
          </div>

          <div className="landing-feature-card">
            <div className="feature-icon-wrapper">
              <span className="feature-icon">🌍</span>
            </div>
            <h3>Reach Global Foodies</h3>
            <p>Our platform handles translation for you globally. Automatically making your recipes accessible for anywhere in the world.</p>
          </div>

          <div className="landing-feature-card">
            <div className="feature-icon-wrapper">
              <span className="feature-icon">🛠️</span>
            </div>
            <h3>Smart Recipe Editor</h3>
            <p>Edit your uploaded videos quickly using our in-browser tools. Automatically transcribe videos to easily offer closed captioning.</p>
          </div>
        </div>
      </section>

      {/* ─── SUCCESS STORY / TESTIMONIAL ─── */}
      <section className="landing-success" id="creators">
        <div className="landing-success-container">
          <div className="landing-success-image">
            <img src={chefAmara} alt="Chef Amara" />
            <div className="success-image-badge">
              <span className="badge-tag">SUCCESS STORY</span>
              <span className="badge-name">Chef Amara</span>
              <span className="badge-role">Nigerian Cuisine Creator</span>
            </div>
          </div>

          <div className="landing-success-content">
            <span className="success-quote-mark">"</span>
            <blockquote className="success-quote">
              "Cultif gave me the tools to turn my family's heritage into a sustainable business. I'm not just a cook; I'm a business owner."
            </blockquote>

            <ul className="success-points">
              <li>
                <span className="tick">✓</span>
                Monetized 50+ Recipes for loyal fans
              </li>
              <li>
                <span className="tick">✓</span>
                Launched 3 Premium Recipe Packs
              </li>
              <li>
                <span className="tick">✓</span>
                Retain 90% in total subscription revenue
              </li>
            </ul>

            <div className="success-user-action">
              <div className="user-action-avatar">AM</div>
              <span className="user-action-text">Try Amara's West African Jollof Masterclass<br /><span className="sub">Includes Video Walkthrough</span></span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── REVENUE STREAMS ─── */}
      <section className="landing-revenue">
        <div className="landing-revenue-header">
          <div>
            <h2 className="landing-revenue-title">Diverse Revenue Streams</h2>
            <p className="landing-revenue-subtitle">
              You provide your expertise, Cultif helps you monetize. Mix and match to earn in three primary ways.
            </p>
          </div>
          <button className="landing-btn-primary revenue-btn-desktop">All Ways &gt;</button>
        </div>

        <div className="landing-revenue-cards">
          <div className="revenue-card">
            <img src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=400&q=80" alt="Monthly Subscriptions" className="revenue-card-img" />
            <div className="revenue-card-content">
              <span className="revenue-tag">FOUNDATIONAL</span>
              <h4>Monthly Subscriptions</h4>
              <p>Unlock recurring income by letting fans subscribe to your feed of exclusive content.</p>
              <div className="revenue-stats">
                <span>Avg. Creator Earnings</span>
                <span className="revenue-amount">$1,200/mo</span>
              </div>
            </div>
          </div>

          <div className="revenue-card">
            <img src={healthyMealPrep} alt="Premium Recipe Packs" className="revenue-card-img" />
            <div className="revenue-card-content">
              <span className="revenue-tag">HIGH IMPACT</span>
              <h4>Premium Recipe Packs</h4>
              <p>Sell curated collections of your best recipes around a specific theme or diet (e.g. Keto, Holidays).</p>
              <div className="revenue-stats">
                <span>Avg. Creator Earnings</span>
                <span className="revenue-amount">$800/pack</span>
              </div>
            </div>
          </div>

          <div className="revenue-card">
            <img src="https://images.unsplash.com/photo-1543362906-acfc16c67564?w=400&q=80" alt="Interactive Meal Plans" className="revenue-card-img" />
            <div className="revenue-card-content">
              <span className="revenue-tag">VALUE ADDED</span>
              <h4>Interactive Meal Plans</h4>
              <p>Sell weekly or bi-weekly meal prep plans with interactive shopping lists for your subscribers.</p>
              <div className="revenue-stats">
                <span>Avg. Creator Earnings</span>
                <span className="revenue-amount">$400/plan</span>
              </div>
            </div>
          </div>
        </div>
        <div className="revenue-btn-mobile-wrapper">
          <button className="landing-btn-primary revenue-btn-mobile">All Ways &gt;</button>
        </div>
      </section>

      {/* ─── BOTTOM CTA ─── */}
      <section className="landing-bottom-cta">
        <div className="landing-cta-box">
          <h2>Your recipes deserve<br />an audience.</h2>
          <p>Join the new era of culinary creators. Start your channel<br className="desktop-br" />today and own your future.</p>
          <button className="landing-btn-primary cta-btn-large" onClick={handleGetStarted}>
            Start earning with Cultif
          </button>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="landing-footer">
        <div className="landing-footer-grid">
          <div className="footer-brand">
            <img src={logoBlack} alt="Cultif" className="footer-logo" />
            <p>The global platform for food creators. Turn your culinary knowledge into real revenue.</p>
            <div className="footer-socials">
              <a href="#" aria-label="Instagram">IG</a>
              <a href="#" aria-label="Twitter">TW</a>
              <a href="#" aria-label="Email">Mail</a>
            </div>
          </div>

          <div className="footer-links">
            <div className="footer-col">
              <h4>Platform</h4>
              <button onClick={() => window.location.href = "https://app.cultif.com/discover"}>Browse Recipes</button>
              <a href="#features">Features</a>
              <a href="#creators">Creators</a>
            </div>

            <div className="footer-col">
              <h4>Company</h4>
              <button onClick={() => window.location.href = "https://app.cultif.com/blog"}>Creator Stories</button>
              <a href="#">Our Team</a>
              <a href="#">Contact Us</a>
            </div>

            <div className="footer-col">
              <h4>Legal</h4>
              <button onClick={() => window.location.href = "https://app.cultif.com/privacy"}>Privacy Policy</button>
              <button onClick={() => window.location.href = "https://app.cultif.com/terms"}>Terms of Service</button>
              <button onClick={() => window.location.href = "https://app.cultif.com/creator-agreement"}>Creator Agreement</button>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Cultif. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
