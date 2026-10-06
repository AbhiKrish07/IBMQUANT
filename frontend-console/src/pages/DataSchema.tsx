import React from 'react';
import { Download, FileDown, CheckCircle2 } from 'lucide-react';

export function DataSchema() {
  return (
    <div className="p-8 max-w-[1400px] mx-auto space-y-6">
      {/* Title Section */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="text-[10px] font-mono text-red-600 dark:text-[#86efac] tracking-widest mb-3 uppercase">Q-UPI / Security Gateway</div>
          <h1 className="text-4xl font-['VT323'] tracking-widest text-gray-900 dark:text-white mb-2">Data Schema</h1>
          <p className="text-sm text-gray-600 dark:text-zinc-400">Browse the proposed data contract, validation rules and end-to-end experiment lineage.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-black dark:bg-[#1e1e1e]  hover:bg-gray-800 dark:bg-zinc-800 text-sm font-medium  hover:bg-gray-100 dark:bg-zinc-800 transition text-white">
            Validate mappings
          </button>
          <button className="px-4 py-2 rounded-lg border border-gray-300 dark:border-zinc-700 bg-gray-900 border-gray-300 dark:border-zinc-700 hover:bg-gray-50 dark:bg-[#121212] text-sm font-medium  flex items-center gap-2 hover:bg-gray-100 dark:bg-zinc-800 transition text-white">
            <Download className="w-4 h-4" /> Export schema
          </button>
        </div>
      </div>

      {/* Banner */}
      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-zinc-500 font-mono">
        <div className="px-2 py-1 rounded border border-gray-200 dark:border-[#27272a] bg-gray-50 dark:bg-[#121212] flex items-center gap-2 uppercase">
          <div className="w-1.5 h-1.5 rounded-full bg-zinc-500"></div> Schema Draft v0.1
        </div>
        <span>Results appear only after a reproducible experiment. No live payment connection.</span>
      </div>

      <div className="mt-4 border border-red-200 dark:border-[#166534] bg-red-50 dark:bg-[#052e16]/30 rounded-lg p-4 flex items-center gap-3">
        <div className="w-4 h-4 rounded-full border border-red-200 dark:border-[#166534] flex items-center justify-center flex-shrink-0">
          <span className="text-[8px] text-red-500 dark:text-[#4ade80]">i</span>
        </div>
        <p className="text-xs text-red-600 dark:text-[#86efac]">DESIGNED SCHEMA · Version 0.1 is a proposed application contract, not an externally established dataset schema. No source mappings or records have been imported; validation has not run.</p>
      </div>

      <div className="grid grid-cols-12 gap-6 pt-2">
        
        {/* Left Sidebar Info (Col Span 3) */}
        <div className="col-span-3 flex flex-col gap-6">
          {/* Entities */}
          <div className="border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Entities</h3>
            <p className="text-[10px] text-gray-500 dark:text-zinc-500 mb-4">10 entities · all expanded</p>
            <div className="space-y-3 font-mono text-xs text-gray-600 dark:text-zinc-400">
              {['Transaction', 'Dataset', 'ModelRun', 'QuantumRun', 'ChannelRun', 'PolicyVersion', 'PolicyDecision', 'Artifact', 'Experiment', 'Manifest'].map(entity => (
                <div key={entity} className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-sm border border-zinc-600 flex items-center justify-center">
                    <div className="w-1 h-1 bg-zinc-400"></div>
                  </div>
                  <span className={entity === 'Transaction' ? 'text-gray-900 dark:text-white' : ''}>{entity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Field legend */}
          <div className="border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-6">Field legend</h3>
            <div className="space-y-4 text-xs text-gray-600 dark:text-zinc-400">
              <div className="flex flex-col gap-1">
                <span className="font-mono text-gray-800 dark:text-zinc-300">Yes</span>
                <span className="text-[10px]">required at record creation</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-gray-800 dark:text-zinc-300">For...</span>
                <span className="text-[10px]">required for that workflow</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-gray-800 dark:text-zinc-300">On run</span>
                <span className="text-[10px]">only after execution</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-gray-800 dark:text-zinc-300">On success</span>
                <span className="text-[10px]">completed result</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="font-mono text-gray-800 dark:text-zinc-300">?</span>
                <span className="text-[10px]">nullable, never a fake default</span>
              </div>
            </div>
          </div>

          {/* Handling */}
          <div className="border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Handling</h3>
            <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed mb-4">Restrict raw source access. Tokenize identifiers before replay.</p>
            <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">Never store credentials, private signing keys or BB84 secret bits in Artifact or Manifest.</p>
          </div>
        </div>

        {/* Main Content (Col Span 9) */}
        <div className="col-span-9 flex flex-col gap-6">
          
          {/* Schema Contract */}
          <div className="border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white">Schema contract</h3>
              <span className="text-[10px] font-mono text-gray-500 dark:text-zinc-500 uppercase border border-gray-200 dark:border-[#27272a] px-2 py-0.5 rounded">Not Validated</span>
            </div>
            <div className="flex gap-6 border-b border-gray-200 dark:border-[#27272a] mb-6 text-sm">
              <button className="pb-3  border-b-2 border-white font-medium text-white">All definitions</button>
              <button className="pb-3  hover: text-white">Relationships</button>
              <button className="pb-3  hover: text-white">Validation</button>
              <button className="pb-3  hover: text-white">Change log</button>
            </div>
            
            <table className="w-full text-xs mb-4">
              <thead className="text-[10px] font-mono text-gray-500 dark:text-zinc-500 border-b border-gray-100 dark:border-zinc-800/50 uppercase">
                <tr>
                  <th className="text-left font-normal pb-3">Inherited field</th>
                  <th className="text-left font-normal pb-3">Type</th>
                  <th className="text-left font-normal pb-3">Required</th>
                  <th className="text-left font-normal pb-3">Source</th>
                  <th className="text-left font-normal pb-3">Definition / validation</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 dark:text-zinc-400 font-mono">
                {[
                  ['id', 'uuid', 'Yes', 'Record writer', 'Primary key on every entity; globally unique and immutable.'],
                  ['schema_version', 'semver', 'Yes', 'Application', 'Contract version used to parse and validate the record.'],
                  ['created_at', 'timestamp UTC', 'Yes', 'Record writer', 'Creation time; not a source-event or execution timestamp.']
                ].map(([field, type, req, source, def]) => (
                  <tr key={field} className="border-b border-gray-200 dark:border-[#27272a]/30">
                    <td className="py-4 font-bold text-gray-800 dark:text-zinc-300">{field}</td>
                    <td className="py-4">{type}</td>
                    <td className="py-4 text-gray-800 dark:text-zinc-300">{req}</td>
                    <td className="py-4">{source}</td>
                    <td className="py-4 font-sans text-gray-500 dark:text-zinc-500">{def}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-[10px] text-gray-500 dark:text-zinc-500 mt-2">All entities inherit the fields above. Setup records may contain no execution values; lifecycle validation requires results only when the corresponding run succeeds.</p>
          </div>

          {/* Transaction Entity */}
          <div className="border border-gray-200 dark:border-[#27272a] bg-white dark:bg-[#0c0c0c] shadow-sm rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-semibold text-gray-900 dark:text-white">Transaction</h3>
              <span className="text-[10px] font-mono text-gray-500 dark:text-zinc-500 uppercase border border-gray-200 dark:border-[#27272a] px-2 py-0.5 rounded">Draft Entity</span>
            </div>
            <p className="text-xs text-gray-600 dark:text-zinc-400 mb-6">Designed canonical event for offline payment replay. Source mappings must be supplied; these fields are not claimed to exist in an external dataset.</p>

            <table className="w-full text-xs mb-6">
              <thead className="text-[10px] font-mono text-gray-500 dark:text-zinc-500 border-b border-gray-100 dark:border-zinc-800/50 uppercase">
                <tr>
                  <th className="text-left font-normal pb-3">Field</th>
                  <th className="text-left font-normal pb-3">Type</th>
                  <th className="text-left font-normal pb-3">Required</th>
                  <th className="text-left font-normal pb-3">Source</th>
                  <th className="text-left font-normal pb-3">Definition / validation</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 dark:text-zinc-400 font-mono">
                {[
                  ['dataset_id', 'uuid · FK', 'Yes', 'Import mapper', 'Dataset version containing the source record.'],
                  ['source_row_ref', 'string', 'Yes', 'Import mapper', 'Stable row locator; unique within a Dataset.'],
                  ['event_time', 'timestamp UTC', 'Yes', 'Mapped source', 'Original payment event time; timezone mapping is explicit.'],
                  ['amount_minor', 'int64', 'Yes', 'Mapped source', 'Amount in currency minor units; never floating-point money.'],
                  ['currency', 'char(3)', 'Yes', 'Mapped source', 'ISO currency code; scale checked against amount_minor.'],
                  ['payment_type', 'enum / string', 'Yes', 'Mapped source', 'Normalized transaction category from a versioned mapping.'],
                  ['payer_token', 'opaque string', 'If present', 'Secure ingestion', 'Pseudonymous payer reference; no raw account identifier.'],
                  ['payee_token', 'opaque string', 'If present', 'Secure ingestion', 'Pseudonymous payee reference; tokenization scope recorded.'],
                  ['device_token', 'opaque string?', 'No', 'Secure ingestion', 'Optional device reference; raw fingerprints excluded.'],
                  ['target_label', 'bool / enum?', 'For eval', 'Mapped source', 'Ground-truth class and mapping; never a model prediction.'],
                  ['feature_values', 'map<string,num>', 'For replay', 'Feature pipeline', 'Derived feature vector, version and missing-value handling.'],
                  ['feature_pipeline_hash', 'sha256', 'For replay', 'Pipeline output', 'Binds features to the shared benchmark transformation.'],
                  ['replay_emitted_at', 'timestamp?', 'On replay', 'Replay runtime', 'Wall-clock emission time, distinct from source event_time.']
                ].map(([field, type, req, source, def]) => (
                  <tr key={field} className="border-b border-gray-200 dark:border-[#27272a]/30">
                    <td className="py-3 font-bold text-gray-800 dark:text-zinc-300">{field}</td>
                    <td className="py-3">{type}</td>
                    <td className="py-3 text-gray-800 dark:text-zinc-300">{req}</td>
                    <td className="py-3">{source}</td>
                    <td className="py-3 font-sans text-gray-500 dark:text-zinc-500">{def}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-[#27272a] rounded-lg p-3 flex items-center gap-3">
              <div className="w-4 h-4 rounded border border-red-200 dark:border-[#166534]/50 flex items-center justify-center bg-red-50 dark:bg-[#052e16]/30 flex-shrink-0">
                <CheckCircle2 className="w-3 h-3 text-red-600 dark:text-[#86efac]" />
              </div>
              <p className="text-[11px] font-mono text-gray-500 dark:text-zinc-500">
                Dataset 1 → N Transaction · Transaction 1 → N PolicyDecision
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
