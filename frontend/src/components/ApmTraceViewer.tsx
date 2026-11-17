import React, { useState } from 'react';
import {
  Activity,
  AlertOctagon,
  Layers,
} from 'lucide-react';

interface Span {
  id: string;
  parent_id: string | null;
  service: string;
  name: string;
  start_time_offset_ms: number;
  duration_ms: number;
  status: 'ok' | 'error' | 'cancelled';
  http_status?: number;
  tags?: Record<string, any>;
  error_event?: {
    type: string;
    message: string;
    stack?: string;
  };
}

interface TelemetryTraces {
  trace_id: string;
  root_service: string;
  total_duration_ms: number;
  error_count: number;
  warning_count: number;
  spans: Span[];
}

interface ApmTraceViewerProps {
  traces?: TelemetryTraces;
  framework?: string;
}

export const ApmTraceViewer: React.FC<ApmTraceViewerProps> = ({ traces }) => {
  const [selectedSpanId, setSelectedSpanId] = useState<string | null>(
    traces?.spans.find((s) => s.status === 'error')?.id || traces?.spans[0]?.id || null
  );
  const [filterStatus, setFilterStatus] = useState<'all' | 'error'>('all');

  if (!traces || !traces.spans || traces.spans.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500">
        <Activity className="w-10 h-10 mx-auto text-slate-300 mb-3 animate-pulse" />
        <p className="text-sm font-semibold">No APM Telemetry Spans Recorded</p>
        <p className="text-xs text-slate-400 mt-1">
          OpenTelemetry tracing is enabled on production microservice tiers.
        </p>
      </div>
    );
  }

  const totalDuration = traces.total_duration_ms || 1000;
  const filteredSpans = filterStatus === 'error'
    ? traces.spans.filter((s) => s.status === 'error')
    : traces.spans;

  const selectedSpan = traces.spans.find((s) => s.id === selectedSpanId);

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-sm border border-slate-700">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                  OpenTelemetry W3C Trace
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-950 text-red-300 border border-red-800 font-semibold">
                  {traces.error_count} Defects Caught
                </span>
              </div>
              <h3 className="text-sm font-mono font-bold text-white tracking-tight">
                Trace ID: {traces.trace_id}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase">Wall Clock Duration</span>
              <span className="font-bold text-amber-400 text-sm">{traces.total_duration_ms.toFixed(1)}ms</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block uppercase">Root Service</span>
              <span className="font-bold text-blue-400 text-sm">{traces.root_service}</span>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-4 pt-3 border-t border-slate-700/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-[11px]">Filter Spans:</span>
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                filterStatus === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All Spans ({traces.spans.length})
            </button>
            <button
              onClick={() => setFilterStatus('error')}
              className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors ${
                filterStatus === 'error'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-800 text-red-400 hover:bg-red-950'
              }`}
            >
              Failing Spans Only ({traces.spans.filter((s) => s.status === 'error').length})
            </button>
          </div>

          <span className="text-[11px] text-slate-400 font-mono">
            Click any span to inspect distributed context & stack trace
          </span>
        </div>
      </div>

      {/* Waterfall Gantt Chart */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px] font-mono text-slate-600 font-semibold">
          <div className="w-1/2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>Service & Span Operation</span>
          </div>
          <div className="w-1/2 flex items-center justify-between pl-4">
            <span>0ms</span>
            <span>{(totalDuration / 2).toFixed(0)}ms</span>
            <span>{totalDuration.toFixed(0)}ms</span>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredSpans.map((span) => {
            const leftPercent = Math.min(100, Math.max(0, (span.start_time_offset_ms / totalDuration) * 100));
            const widthPercent = Math.min(100 - leftPercent, Math.max(2, (span.duration_ms / totalDuration) * 100));
            const isSelected = selectedSpanId === span.id;

            return (
              <div
                key={span.id}
                onClick={() => setSelectedSpanId(span.id)}
                className={`p-3 cursor-pointer transition-colors flex items-center text-xs ${
                  isSelected ? 'bg-blue-50/70' : 'hover:bg-slate-50'
                }`}
              >
                {/* Span Identification */}
                <div className="w-1/2 pr-3 flex items-center gap-2 truncate">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      span.status === 'error'
                        ? 'bg-red-500 animate-ping'
                        : span.status === 'cancelled'
                        ? 'bg-amber-400'
                        : 'bg-emerald-500'
                    }`}
                  />
                  <div className="truncate">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono bg-slate-100 text-slate-700 font-bold border border-slate-200">
                        {span.service}
                      </span>
                      <span className="font-semibold text-slate-800 truncate font-mono text-[11px]">
                        {span.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Waterfall Visualizer Bar */}
                <div className="w-1/2 pl-3 relative flex items-center h-5">
                  {/* Timeline Background Track */}
                  <div className="absolute inset-0 bg-slate-100/60 rounded"></div>

                  {/* Active Bar */}
                  <div
                    style={{
                      left: `${leftPercent}%`,
                      width: `${widthPercent}%`,
                    }}
                    className={`absolute h-4 rounded flex items-center px-1.5 text-[9px] font-mono font-bold text-white shadow-sm transition-all ${
                      span.status === 'error'
                        ? 'bg-gradient-to-r from-red-600 to-red-500'
                        : span.status === 'cancelled'
                        ? 'bg-amber-500'
                        : 'bg-gradient-to-r from-emerald-600 to-emerald-500'
                    }`}
                  >
                    <span className="truncate">{span.duration_ms.toFixed(1)}ms</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Span Inspector Drawer */}
      {selectedSpan && (
        <div className="p-4 rounded-xl bg-slate-900 text-slate-100 border border-slate-800 shadow-md space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  selectedSpan.status === 'error'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                }`}
              >
                {selectedSpan.status}
              </span>
              <span className="text-white font-bold text-sm">{selectedSpan.name}</span>
            </div>

            <div className="flex items-center gap-3 text-slate-400 text-xs">
              <span>Service: <strong className="text-blue-400">{selectedSpan.service}</strong></span>
              <span>Duration: <strong className="text-amber-400">{selectedSpan.duration_ms.toFixed(2)}ms</strong></span>
            </div>
          </div>

          {/* Exception Details if present */}
          {selectedSpan.error_event && (
            <div className="p-3 rounded-lg bg-red-950/60 border border-red-800/80 text-red-200 space-y-1">
              <div className="flex items-center gap-1.5 text-red-300 font-bold text-xs uppercase">
                <AlertOctagon className="w-4 h-4 text-red-400" />
                <span>Triggered Exception: {selectedSpan.error_event.type}</span>
              </div>
              <p className="text-red-100 font-sans text-xs">{selectedSpan.error_event.message}</p>
              {selectedSpan.error_event.stack && (
                <pre className="mt-2 p-2 rounded bg-black/60 text-[10px] text-red-300 overflow-x-auto leading-relaxed border border-red-900/60 font-mono">
                  {selectedSpan.error_event.stack}
                </pre>
              )}
            </div>
          )}

          {/* Span Tags / Attributes */}
          {selectedSpan.tags && Object.keys(selectedSpan.tags).length > 0 && (
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                Span Metadata & Semantic Attributes
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {Object.entries(selectedSpan.tags).map(([key, val]) => (
                  <div key={key} className="p-2 rounded bg-slate-800/70 border border-slate-700/80">
                    <span className="block text-[10px] text-slate-400 truncate">{key}</span>
                    <span className="text-xs text-white font-semibold truncate block">
                      {String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
