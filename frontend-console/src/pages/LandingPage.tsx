import { ArrowRight, Cpu, ListOrdered, BarChart2, Radio, GitBranch, FlaskConical } from 'lucide-react';

interface LandingPageProps {
  onEnterWorkspace: (targetPage?: string) => void;
}

export function LandingPage({ onEnterWorkspace }: LandingPageProps) {
  const modules = [
    {
      id: 'replay',
      title: 'Transaction Replay',
      desc: 'Import financial transaction streams, replay events, and inspect tiered security routing decisions in real time.',
      icon: ListOrdered
    },
    {
      id: 'benchmarks',
      title: 'Model Benchmarks',
      desc: 'Compare classical GBDT/SVM against Bloq & QC Vectorized Quantum Kernel SVM under unified SRS evaluation contracts.',
      icon: BarChart2
    },
    {
      id: 'circuit',
      title: 'Circuit & Measurements',
      desc: 'Configure Qiskit feature maps, inspect 2ⁿ-dimensional Hilbert statevectors, Bloch sphere angles, and transpiled circuits.',
      icon: Cpu
    },
    {
      id: 'qkd',
      title: 'QKD Channel Lab',
      desc: 'Simulate inter-bank BB84 quantum key distribution under eavesdropping, beam splitters, and photon polarization collapses.',
      icon: Radio
    },
    {
      id: 'policy',
      title: 'Adaptive Security Policy',
      desc: 'Route transaction risk scores and channel conditions to automated fallback security protection suites.',
      icon: GitBranch
    },
    {
      id: 'experiments',
      title: 'Experiments & Provenance',
      desc: 'Trace immutable execution manifests, quantum hardware parameters, audit logs, and benchmark reproducibility.',
      icon: FlaskConical
    }
  ];

  return (
    <div className="min-h-screen bg-[#070707] text-zinc-100 font-mono selection:bg-[#4ade80] selection:text-black">
      {/* Navigation Header */}
      <header className="h-16 border-b border-[#1c1c1f] px-6 md:px-12 flex items-center justify-between sticky top-0 bg-[#070707]/90 backdrop-blur-md z-50">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onEnterWorkspace('benchmarks')}>
          <div className="w-7 h-7 rounded border border-zinc-700 bg-zinc-900 flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-[#4ade80] rounded-sm animate-pulse"></div>
          </div>
          <span className="text-xl font-['VT323'] tracking-widest text-white font-bold">Q-UPI</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-xs text-zinc-400">
          <a href="#platform" className="hover:text-white transition">Platform</a>
          <a href="#threats" className="hover:text-white transition">Threats</a>
          <a href="#pipeline" className="hover:text-white transition">Pipeline</a>
          <a href="#modules" className="hover:text-white transition">Modules</a>
          <a href="#provenance" className="hover:text-white transition">Provenance</a>
        </nav>

        <button
          onClick={() => onEnterWorkspace('benchmarks')}
          className="px-4 py-2 rounded bg-[#86efac] hover:bg-[#4ade80] text-black font-bold text-xs flex items-center gap-2 transition shadow-[0_0_15px_rgba(74,222,128,0.2)]"
        >
          <span>Enter Workspace</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="max-w-[1400px] mx-auto px-6 md:px-12 py-12 space-y-24">
        {/* HERO SECTION */}
        <section className="space-y-8 max-w-4xl pt-4">
          <div className="flex flex-wrap gap-3 text-[10px] uppercase tracking-widest">
            <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold">
              [ DRAFT ARCHITECTURE ]
            </span>
            <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold">
              [ REPRODUCIBLE PIPELINE ]
            </span>
            <span className="px-2.5 py-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold">
              [ IMMUTABLE EXPERIMENTS ]
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-['VT323'] tracking-wider text-white uppercase leading-none">
            Quantum-resilient payment research<span className="text-[#86efac]">.</span>
          </h1>

          <p className="text-sm md:text-base text-zinc-400 leading-relaxed font-sans max-w-2xl">
            We ground quantum gain claims in standard benchmarks. We measure when classical models win, when quantum kernels boost performance, and where it fails.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onEnterWorkspace('benchmarks')}
              className="px-6 py-3 rounded bg-[#86efac] hover:bg-[#4ade80] text-black font-bold text-xs flex items-center gap-2 transition shadow-[0_0_20px_rgba(74,222,128,0.25)] uppercase tracking-wider"
            >
              <span>Enter Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onEnterWorkspace('replay')}
              className="px-6 py-3 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold text-xs transition uppercase tracking-wider"
            >
              Read Whitepaper
            </button>
          </div>

          {/* Model Benchmark Card Preview */}
          <div className="mt-12 p-6 rounded-xl border border-[#1c1c1f] bg-[#0c0c0e] space-y-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">[ BENCHMARK CONTRACT PREVIEW ]</span>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ACTIVE BENCHMARK RUN
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono text-left">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 uppercase text-[10px]">
                    <th className="py-2 pr-4">MODEL</th>
                    <th className="py-2 pr-4">LATENCY (MS)</th>
                    <th className="py-2 pr-4">AUC</th>
                    <th className="py-2">F1 SCORE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-zinc-300">
                  <tr>
                    <td className="py-2.5 font-bold text-white">QC Tiered QSVM</td>
                    <td className="py-2.5 text-emerald-400">12 ms</td>
                    <td className="py-2.5 text-emerald-400 font-bold">0.982</td>
                    <td className="py-2.5 font-bold">0.965</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-white">Bloq QSVM</td>
                    <td className="py-2.5 text-zinc-400">18 ms</td>
                    <td className="py-2.5 text-zinc-300">0.954</td>
                    <td className="py-[#0c0c0e]">0.932</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 font-bold text-zinc-400">Gradient Boosting</td>
                    <td className="py-2.5 text-zinc-400">4 ms</td>
                    <td className="py-2.5 text-zinc-400">0.865</td>
                    <td className="py-2.5 text-zinc-400">0.820</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* SECTION 2: THREAT MODEL */}
        <section id="threats" className="space-y-8 border-t border-[#1c1c1f] pt-16">
          <div>
            <span className="text-[10px] text-[#86efac] font-bold uppercase tracking-widest block mb-2">
              [ ALL-HAZARD RISK MODEL ]
            </span>
            <h2 className="text-4xl md:text-5xl font-['VT323'] tracking-wider text-white uppercase">
              Two threats, one payment rail<span className="text-[#86efac]">.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border border-[#1c1c1f] bg-[#0c0c0e] space-y-3">
              <h3 className="font-bold text-sm text-white font-mono uppercase tracking-wider">Volume Mule Fraud</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                High-throughput money laundering networks exploit classical decision tree boundary limits, forcing high false-positive rates on legitimate high-volume users.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-[#1c1c1f] bg-[#0c0c0e] space-y-3">
              <h3 className="font-bold text-sm text-white font-mono uppercase tracking-wider">Adversarial Cryptanalysis</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Post-quantum vulnerabilities threaten inter-bank authorization channels. Quantum Key Distribution (BB84) provides physical-layer security bounds.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: PLATFORM ARCHITECTURE */}
        <section id="platform" className="space-y-8 border-t border-[#1c1c1f] pt-16">
          <div>
            <span className="text-[10px] text-[#86efac] font-bold uppercase tracking-widest block mb-2">
              [ ARCHITECTURE BLUEPRINT ]
            </span>
            <h2 className="text-4xl md:text-5xl font-['VT323'] tracking-wider text-white uppercase">
              A quantum-readiness platform for payments<span className="text-[#86efac]">.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-[#1c1c1f] bg-[#0c0c0e] space-y-3">
              <span className="text-[10px] text-[#86efac] font-bold uppercase tracking-widest">1 : Silent Bridge</span>
              <h3 className="font-bold text-sm text-white">Non-Disruptive Integration</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Operates alongside production payment gateways without injecting latency into low-risk transactions.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-[#1c1c1f] bg-[#0c0c0e] space-y-3">
              <span className="text-[10px] text-[#86efac] font-bold uppercase tracking-widest">2 : Inter-Bank Simulation</span>
              <h3 className="font-bold text-sm text-white">Full-Stack Channel Testing</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Simulate fiber optic QKD channel loss, eavesdropping attacks, and quantum state vector Hilbert encoding.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-[#1c1c1f] bg-[#0c0c0e] space-y-3">
              <span className="text-[10px] text-[#86efac] font-bold uppercase tracking-widest">3 : Hybrid Engine</span>
              <h3 className="font-bold text-sm text-white">Classical + Quantum Fusion</h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Fast GBDT filters 95% of trivial transactions, routing only high-uncertainty transactions to 16D Hilbert space.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 4: FILTERING STRATEGY */}
        <section id="pipeline" className="space-y-8 border-t border-[#1c1c1f] pt-16">
          <div>
            <span className="text-[10px] text-[#86efac] font-bold uppercase tracking-widest block mb-2">
              [ FILTERING STRATEGY ]
            </span>
            <h2 className="text-4xl md:text-5xl font-['VT323'] tracking-wider text-white uppercase">
              Quantum reviews only the uncertain few<span className="text-[#86efac]">.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
            <div className="p-5 bg-[#0c0c0e] border border-[#1c1c1f] rounded-xl space-y-2">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">STAGE 1</span>
              <h3 className="font-bold text-white">Classical Fast Screening</h3>
              <p className="text-[11px] text-zinc-400 font-sans">Fast GBDT evaluates linear features in sub-millisecond latency.</p>
            </div>

            <div className="p-5 bg-[#0c0c0e] border border-red-900/60 rounded-xl space-y-2">
              <span className="text-[10px] text-red-400 uppercase font-bold block">STAGE 2 (QUANTUM)</span>
              <h3 className="font-bold text-white">Quantum Hilbert Review</h3>
              <p className="text-[11px] text-zinc-400 font-sans">ZZFeatureMap evaluates 16D non-linear entangled decision hyperplanes.</p>
            </div>

            <div className="p-5 bg-[#0c0c0e] border border-[#1c1c1f] rounded-xl space-y-2">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">STAGE 3</span>
              <h3 className="font-bold text-white">Analyst Queue</h3>
              <p className="text-[11px] text-zinc-400 font-sans">High-risk alerts dispatched to human security operations center.</p>
            </div>
          </div>
        </section>

        {/* SECTION 5: SIX MODULES */}
        <section id="modules" className="space-y-8 border-t border-[#1c1c1f] pt-16">
          <div>
            <span className="text-[10px] text-[#86efac] font-bold uppercase tracking-widest block mb-2">
              [ WORKSPACE CONSOLE ]
            </span>
            <h2 className="text-4xl md:text-5xl font-['VT323'] tracking-wider text-white uppercase">
              Six modules, one lineage<span className="text-[#86efac]">.</span>
            </h2>
            <p className="text-xs text-zinc-400 mt-1 font-sans">
              Click any module to launch directly into that active workspace page.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map(mod => (
              <div
                key={mod.id}
                onClick={() => onEnterWorkspace(mod.id)}
                className="group cursor-pointer p-6 rounded-xl border border-[#1c1c1f] bg-[#0c0c0e] hover:border-[#86efac] transition-all duration-300 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <mod.icon className="w-5 h-5 text-[#86efac]" />
                  <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-[#86efac] group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="font-bold text-sm text-white font-mono">{mod.title}</h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans">{mod.desc}</p>
              </div>
            ))}
          </div>

          <div className="pt-4 flex justify-center">
            <button
              onClick={() => onEnterWorkspace('benchmarks')}
              className="px-8 py-3.5 rounded bg-[#86efac] hover:bg-[#4ade80] text-black font-bold text-xs flex items-center gap-2 transition shadow-[0_0_20px_rgba(74,222,128,0.25)] uppercase tracking-wider"
            >
              <span>Launch Workspace Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* SECTION 6: FOOTER STATEMENT */}
        <section id="provenance" className="border-t border-[#1c1c1f] pt-16 pb-12 space-y-8">
          <div className="p-8 rounded-xl border border-[#1c1c1f] bg-[#0c0c0e] space-y-4">
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">[ SCIENTIFIC INTEGRITY STATEMENT ]</span>
            <h2 className="text-3xl md:text-4xl font-['VT323'] tracking-wider text-white uppercase">
              Gradient boosting may well win. That is an acceptable finding<span className="text-[#86efac]">.</span>
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans max-w-3xl">
              Q-UPI Sentinel is built on honest empirical reporting. Every benchmark run records exact hardware specs, noise rates, and bootstrap confidence intervals.
            </p>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center text-[10px] text-zinc-500 font-mono pt-4 border-t border-[#1a1a1e]">
            <span>Q-UPI SENTINEL QUANTUM RESEARCH ENGINE</span>
            <span>DATASET → EXPERIMENT → ARTIFACTS → POLICY DECISION</span>
          </div>
        </section>
      </main>
    </div>
  );
}
