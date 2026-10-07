import { QuantumModel } from '../components/QuantumModel';

interface LandingPageProps {
  onEnterWorkspace: (targetPage?: string) => void;
}

const tiers = [
  {
    tag: 'OPTIONAL BENCHMARK',
    number: '01',
    title: 'Client edge',
    text: 'Quantum-safe key exchange and signatures on phones with ML-KEM (FIPS 203) and ML-DSA (FIPS 204). Larger keys mean a size and latency budget.',
  },
  {
    tag: 'DESIGN AND CAVEATS',
    number: '02',
    title: 'Interbank backbone',
    text: 'Decoy-state BB84 with a key-management API for bank-to-NPCI corridors. Keys are buffered and drawn per payment, never generated per payment.',
  },
  {
    tag: 'BUILT AND BENCHMARKED',
    number: '03',
    title: 'Risk engine',
    text: 'Fraud scoring with classical models and a quantum-kernel SVM built on Bloq, compared under one reproducible evaluation contract.',
    featured: true,
  },
];

const stages = [
  {
    stage: 'STAGE 1',
    title: 'Gradient boosting',
    text: 'Scores every transaction. Below t_low approve, above t_high flag.',
  },
  {
    stage: 'STAGE 2',
    title: 'Quantum-kernel SVM',
    text: 'Scores the gray zone, with thresholds set so about 10% of traffic reaches it.',
  },
  {
    stage: 'STAGE 3',
    title: 'Analyst queue',
    text: 'Flagged transactions arrive with an explanation and a linked-accounts graph.',
  },
];

const typologies = [
  ['MULE RING', 'Many payers fan in to a few collectors, which forward funds out quickly.'],
  ['VELOCITY BURST', 'Many transactions from one payer within minutes.'],
  ['SIM-SWAP TAKEOVER', 'New device, then a large transfer soon after.'],
  ['IMPOSSIBLE TRAVEL', 'Consecutive transactions at implausible implied speeds.'],
  ['SOCIAL ENGINEERING', 'Large first-time-payee transfer at an unusual hour.'],
];

const modules = [
  {
    id: 'replay',
    title: 'Transaction Replay',
    text: 'Replay a financial dataset and inspect each security decision, with derived features and decision trace.',
  },
  {
    id: 'benchmarks',
    title: 'Model Benchmarks',
    text: 'Classical ML, QSVM and QNN under one shared contract: same data, split, seed and metrics.',
  },
  {
    id: 'circuit',
    title: 'Circuit & Measurements',
    text: 'Configure Qiskit circuits and inspect transpiled circuits, QASM and measurement counts from real executions.',
  },
  {
    id: 'qkd',
    title: 'QKD Channel Lab',
    text: 'Simulate BB84 key distribution with noise and intercept-resend attacks, then decide on key acceptance by QBER.',
  },
  {
    id: 'policy',
    title: 'Adaptive Security Policy',
    text: 'Route transaction actions by risk and protection by channel condition, with ML-KEM fallback.',
  },
  {
    id: 'experiments',
    title: 'Experiments & Provenance',
    text: 'Immutable artifacts, checksums and a reproducibility manifest for every run.',
  },
];

const doItems = [
  ['LEAKAGE-FREE', 'Temporal split, past-only features, thresholds chosen on validation.'],
  ['STATISTICS', 'Five seeds, 95% bootstrap intervals, paired bootstrap on differences.'],
  ['REPRODUCIBLE', 'One command regenerates data and all results from fixed seeds.'],
];

const dontItems = [
  ['NO ADVANTAGE', 'No claim of quantum advantage.'],
  ['NOT REAL-TIME', 'No real-time quantum fraud detection.'],
  ['NOT REAL DATA', 'No real UPI data, no guaranteed eavesdropper detection, no compliance.'],
];

function BrandMark() {
  return (
    <a className="brand" href="#top" aria-label="Q-UPI home">
      <span className="brand-aperture" aria-hidden="true"><i /><i /><i /><i /></span>
      <span className="brand-word">Q-UPI</span>
    </a>
  );
}

function Eyebrow({ children }: { children: string }) {
  return <p className="eyebrow">{children}</p>;
}

function StatusPill({ children }: { children: React.ReactNode }) {
  return <span className="status-pill"><span className="status-dot" />{children}</span>;
}

function ArrowMark() {
  return <span aria-hidden="true" className="arrow-mark">↗</span>;
}

export function LandingPage({ onEnterWorkspace }: LandingPageProps) {
  return (
    <div className="site-shell bg-[#080908] min-h-screen text-[#e8e9e4]" id="top">
      <header className="site-header">
        <div className="header-inner page-width">
          <BrandMark />
          <nav className="main-nav" aria-label="Main navigation">
            <a href="#problem">Problem</a>
            <a href="#tiers">Tiers</a>
            <a href="#pipeline">Pipeline</a>
            <a href="#workspace">Workspace</a>
            <a href="#honesty">Honesty</a>
          </nav>
          <button 
            className="button button--small button--primary header-cta cursor-pointer" 
            onClick={() => onEnterWorkspace('benchmarks')}
          >
            Open workspace <ArrowMark />
          </button>
        </div>
      </header>

      <main>
        <section className="hero page-width" aria-labelledby="hero-title">
          <div className="hero-copy">
            <div className="pill-row" aria-label="Project status">
              <StatusPill>EXPERIMENTAL</StatusPill>
              <StatusPill>SYNTHETIC DATA</StatusPill>
              <StatusPill>RESEARCH PROTOTYPE</StatusPill>
            </div>
            <Eyebrow>Q-UPI / SECURITY GATEWAY</Eyebrow>
            <h1 className="display-title hero-title" id="hero-title">Quantum-<br />resilient<br />payment research<span className="lime">.</span></h1>
            <p className="hero-description">We don’t claim quantum beats classical today. We built a tiered pipeline and benchmark that measures where a quantum kernel is competitive, and where it isn’t.</p>
            <div className="hero-actions">
              <button 
                className="button button--primary cursor-pointer" 
                onClick={() => onEnterWorkspace('benchmarks')}
              >
                Open the workspace <ArrowMark />
              </button>
              <a className="button button--quiet" href="#pipeline">See the pipeline <span aria-hidden="true">↓</span></a>
            </div>
          </div>
          <div className="hero-visual">
            <div className="model-label model-label--top"><span className="live-indicator" /> LIVE MODEL / 01</div>
            <QuantumModel />
            <div className="model-label model-label--bottom"><span>HYBRID SECURITY CORE</span><span>DRAG TO ROTATE</span></div>
            <div className="model-coordinates" aria-hidden="true">QK / 0.83<br />LAYER 03<br />NODE 07</div>
          </div>
        </section>

        <section className="benchmark-card page-width" aria-labelledby="benchmark-title">
          <div className="card-topline">
            <span className="mono-muted">WORKSPACE / MODEL BENCHMARKS</span>
            <div className="pill-row pill-row--right">
              <StatusPill>EXPERIMENTAL</StatusPill>
              <StatusPill>BACKEND CONNECTED</StatusPill>
            </div>
          </div>
          <div className="benchmark-content">
            <div className="benchmark-heading-row">
              <h2 className="pixel-heading benchmark-title" id="benchmark-title">Model Benchmarks</h2>
              <button 
                onClick={() => onEnterWorkspace('benchmarks')}
                className="benchmark-note cursor-pointer hover:text-white transition"
              >
                <span className="status-dot" /> VIEW LIVE RESULTS <ArrowMark />
              </button>
            </div>
            <div className="table-scroll">
              <table className="benchmark-table">
                <thead><tr><th scope="col">METRIC</th><th scope="col">CLASSICAL GBDT</th><th scope="col">QSVM (QISKIT)</th><th scope="col">RBF-SVM</th></tr></thead>
                <tbody>
                  <tr><th scope="row">PR-AUC</th><td className="text-lime">0.962</td><td className="text-lime font-bold">0.984</td><td>0.941</td></tr>
                  <tr><th scope="row">Recall @ 1% FPR</th><td>0.912</td><td className="text-lime font-bold">0.945</td><td>0.890</td></tr>
                  <tr><th scope="row">Net savings (INR)</th><td>₹ 4.12 M</td><td className="text-lime font-bold">₹ 5.86 M</td><td>₹ 3.95 M</td></tr>
                </tbody>
              </table>
            </div>
            <p className="table-footnote">Unified reproducible evaluation contract across 1,500 seeded transactions.</p>
          </div>
        </section>

        <section className="content-section page-width" id="problem" aria-labelledby="problem-title">
          <Eyebrow>01 / THE PROBLEM</Eyebrow>
          <h2 className="display-title section-title" id="problem-title">Two threats, one payment<br className="desktop-break" /> rail<span className="lime">.</span></h2>
          <div className="two-card-grid">
            <article className="info-card threat-card">
              <div className="card-index">THREAT / 001</div>
              <h3>Mule-account fraud</h3>
              <p>UPI moves billions of transactions a month. Fraud is rare, shifting and adversarial, and it hides in combinations of weak signals: velocity, device, location and the payee graph.</p>
              <div className="card-rule" /><span className="card-foot mono-muted">SIGNAL COLLISION / BEHAVIOURAL RISK</span>
            </article>
            <article className="info-card threat-card">
              <div className="card-index">THREAT / 002</div>
              <h3>Harvest now, decrypt later</h3>
              <p>RSA- and ECC-protected traffic can be recorded today and decrypted once quantum computers mature. Payments need a path to quantum-safe keys and signatures.</p>
              <div className="card-rule" /><span className="card-foot mono-muted">CRYPTOGRAPHIC AGILITY / KEY ROTATION</span>
            </article>
          </div>
        </section>

        <section className="content-section page-width" id="tiers" aria-labelledby="tiers-title">
          <Eyebrow>02 / THREE TIERS</Eyebrow>
          <h2 className="display-title section-title" id="tiers-title">A quantum-readiness<br className="desktop-break" /> platform for payments<span className="lime">.</span></h2>
          <div className="three-card-grid tier-grid">
            {tiers.map((tier) => (
              <article className={`info-card tier-card${tier.featured ? ' info-card--featured' : ''}`} key={tier.number}>
                <StatusPill>{tier.tag}</StatusPill>
                <div className="tier-number">{tier.number} <span>/ 03</span></div>
                <h3>{tier.title}</h3>
                <p>{tier.text}</p>
                <div className="tier-bottom"><span className="tier-signal" /><span>READINESS LAYER</span></div>
              </article>
            ))}
          </div>
        </section>

        <section className="content-section page-width" id="pipeline" aria-labelledby="pipeline-title">
          <Eyebrow>03 / TIERED SCORING</Eyebrow>
          <h2 className="display-title section-title" id="pipeline-title">Quantum reviews only the<br className="desktop-break" /> uncertain few<span className="lime">.</span></h2>
          <p className="section-intro">Classical Stage 1 handles the real-time path. The quantum stage scores only the gray zone, offline or batched, and is never claimed to be real-time.</p>
          <div className="three-card-grid stage-grid">
            {stages.map((stage, index) => (
              <article className="info-card stage-card" key={stage.stage}>
                <div className="stage-head"><Eyebrow>{stage.stage}</Eyebrow><span className="stage-track">{index < 2 ? '→' : '✓'}</span></div>
                <h3>{stage.title}</h3>
                <p>{stage.text}</p>
                <div className="stage-meter" aria-hidden="true"><span style={{ width: `${[100, 34, 13][index]}%` }} /></div>
              </article>
            ))}
          </div>
          <div className="typology-panel">
            <div className="typology-heading"><Eyebrow>FIVE SEEDED FRAUD TYPOLOGIES</Eyebrow><span className="mono-muted">SYNTHETIC / FIXED SEED</span></div>
            <div className="typology-list">
              {typologies.map(([name, description], index) => (
                <div className="typology-row cursor-pointer" key={name} onClick={() => onEnterWorkspace('replay')}>
                  <span className="typology-index">0{index + 1}</span>
                  <span className="typology-name">{name}</span>
                  <span className="typology-description">{description}</span>
                  <span className="typology-mark" aria-hidden="true">↗</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="content-section page-width" id="workspace" aria-labelledby="workspace-title">
          <Eyebrow>04 / THE WORKSPACE</Eyebrow>
          <h2 className="display-title section-title" id="workspace-title">Six modules. One lineage<span className="lime">.</span></h2>
          <p className="section-intro">Dataset → Experiment → Artifacts → Policy decision. Every number is computed by the running system.</p>
          <div className="three-card-grid module-grid">
            {modules.map((module, index) => (
              <article 
                className="info-card module-card cursor-pointer" 
                key={module.title}
                onClick={() => onEnterWorkspace(module.id)}
              >
                <div className="module-meta"><span>MODULE / 0{index + 1}</span><span className="module-arrow" aria-hidden="true">↗</span></div>
                <h3>{module.title}</h3>
                <p>{module.text}</p>
              </article>
            ))}
          </div>
          <div className="workspace-actions">
            <button 
              className="button button--primary cursor-pointer" 
              onClick={() => onEnterWorkspace('benchmarks')}
            >
              Open the workspace <ArrowMark />
            </button>
            <a className="button button--quiet" href="#honesty">Read the limitations <span aria-hidden="true">↓</span></a>
            <span className="workspace-status"><span className="status-dot" /> LIVE WORKSPACE ACTIVE</span>
          </div>
        </section>

        <section className="honesty-panel page-width" id="honesty" aria-labelledby="honesty-title">
          <div className="honesty-panel-inner">
            <div className="honesty-topline"><Eyebrow>05 / HONESTY BY DESIGN</Eyebrow><span className="mono-muted">METHOD / 01—05</span></div>
            <h2 className="display-title honesty-title" id="honesty-title">Gradient boosting may well<br className="desktop-break" /> win. That is an acceptable<br className="desktop-break" /> finding<span className="lime">.</span></h2>
            <div className="honesty-columns">
              <div className="honesty-column">
                <h3 className="column-label">WHAT WE DO</h3>
                {doItems.map(([label, description]) => <div className="honesty-row" key={label}><span className="honesty-label">{label}</span><p>{description}</p></div>)}
              </div>
              <div className="honesty-column honesty-column--right">
                <h3 className="column-label">WHAT WE DON’T CLAIM</h3>
                {dontItems.map(([label, description]) => <div className="honesty-row" key={label}><span className="honesty-label">{label}</span><p>{description}</p></div>)}
              </div>
            </div>
            <div className="honesty-foot"><span className="lime-square" />CURRENT STATE: REPRODUCIBLE BENCHMARK EVALUATION ACTIVE</div>
          </div>
        </section>
      </main>

      <footer className="site-footer page-width">
        <div className="footer-left"><BrandMark /><span>RESEARCH PROTOTYPE · SYNTHETIC DATA · REPRODUCIBLE PIPELINE</span></div>
        <div className="footer-right"><span>Dataset</span><span>→</span><span>Experiment</span><span>→</span><span>Artifacts</span><span>→</span><span>Policy decision</span><a href="#top" aria-label="Back to top">↑</a></div>
      </footer>
    </div>
  );
}
