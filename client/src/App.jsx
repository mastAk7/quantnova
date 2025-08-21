import { useEffect, useState } from "react";
import api from "./api";

function Section({ id, title, children }) {
  return (
    <section id={id} className="section container">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export default function App() {
  const [stats, setStats] = useState(null);
  const [lead, setLead] = useState({ name: "", email: "", investorType: "", message: "" });
  const [leadOk, setLeadOk] = useState("");

  useEffect(() => {
    api.get("/api/stats").then((res) => setStats(res.data)).catch(() => {});
  }, []);

  const submitLead = async (e) => {
    e.preventDefault();
    setLeadOk("");
    try {
      const { data } = await api.post("/api/leads", lead);
      if (data.ok) setLeadOk("Thanks! We'll reach out soon.");
      setLead({ name: "", email: "", investorType: "", message: "" });
    } catch (e) {
      setLeadOk("Something went wrong. Please try again.");
    }
  };

  return (
    <div>
      <nav className="nav">
        <div className="nav-inner container">
          <strong>QuantNova Fund</strong>
          <div>
            <a href="#strategies">Strategies</a>
            <a href="#risk">Risk</a>
            <a href="#tech">Technology</a>
            <a href="#ethics">Compliance</a>
            <a href="#contact" className="btn">Request Access</a>
          </div>
        </div>
      </nav>

      <header className="hero container">
        <h1>{stats?.tagline || "Turning Volatility into Opportunity."}</h1>
        <p>{stats?.subtext || "India’s first multi-strategy, AI-powered hedge fund."}</p>
        <div className="quick">
          {(stats?.quick || []).map((q, i) => <span key={i} className="tag">{q}</span>)}
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 10 }}>
          <a href="#strategies" className="btn">Explore Our Strategy</a>
          <a className="btn" href={`${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/pitch-deck`} target="_blank" rel="noreferrer">Download Pitch Deck</a>
        </div>
        <p className="small" style={{ marginTop: 12 }}>
          Educational demo. Not an offer to sell or solicit securities.
        </p>
      </header>

      <Section id="strategies" title="Strategy Pods">
        <div className="grid">
          {(stats?.strategies || []).map((s) => (
            <div key={s} className="card">
              <h3>{s}</h3>
              <p className="small">
                <strong>How it works:</strong> Brief description.<br/>
                <strong>Why it wins:</strong> Diversified alpha sources.<br/>
                <strong>Risks:</strong> Model drift, liquidity.<br/>
                <strong>Mitigation:</strong> Hedges, stop-loss, risk budgets.
              </p>
            </div>
          ))}
        </div>
      </Section>

      <Section id="risk" title="Portfolio & Risk Management">
        <div className="grid">
          {(stats?.risk || []).map((r) => (
            <div key={r} className="card">{r}</div>
          ))}
        </div>
      </Section>

      <Section id="tech" title="Technology & Data Edge">
        <div className="grid">
          {(stats?.tech || []).map((t) => (
            <div key={t} className="card">{t}</div>
          ))}
        </div>
      </Section>

      <Section id="ethics" title="Regulatory & Ethical Guardrails">
        <div className="card">
          <p className="small">
            We adhere to data privacy (GDPR/DPDP), avoid manipulative trading practices,
            and maintain transparent governance via audits and controls.
          </p>
        </div>
      </Section>

      <Section id="contact" title="Contact & Request Access">
        <form className="form" onSubmit={submitLead}>
          <div>
            <label>Name</label>
            <input value={lead.name} onChange={(e) => setLead({ ...lead, name: e.target.value })} placeholder="Your full name" required />
          </div>
          <div>
            <label>Email</label>
            <input type="email" value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} placeholder="name@company.com" required />
          </div>
          <div>
            <label>Investor Type</label>
            <select value={lead.investorType} onChange={(e) => setLead({ ...lead, investorType: e.target.value })}>
              <option value="">Select</option>
              <option>Institution</option>
              <option>HNWI/Family Office</option>
              <option>NRI/Foreign</option>
              <option>Other</option>
            </select>
          </div>
          <div>
            <label>Message</label>
            <textarea rows="4" value={lead.message} onChange={(e) => setLead({ ...lead, message: e.target.value })} placeholder="Tell us a bit about you and your objectives." />
          </div>
          <button className="btn" type="submit">Request Access</button>
          {leadOk && <div className="small">{leadOk}</div>}
        </form>
      </Section>

      <footer className="footer container">
        <div>© {new Date().getFullYear()} QuantNova Fund · Educational demo</div>
        <div className="small">
          SEBI AIF Cat III · GIFT City feeder (illustrative) · Daily NAV & quarterly audits (illustrative)
        </div>
      </footer>
    </div>
  );
}
