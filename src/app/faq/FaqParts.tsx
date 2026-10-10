import React from 'react';

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="text-xl font-black text-[#1a1a2e] mb-4 pb-2 border-b border-slate-200">{title}</h2>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

export function Q({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="font-bold text-[#1a1a2e] mb-1.5">❓ {q}</p>
      <div className="text-slate-600 text-sm leading-relaxed pl-5">{children}</div>
    </div>
  );
}

export function Table({ rows }: { rows: string[][] }) {
  const [headers, ...body] = rows;
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 mt-2">
      <table className="w-full text-sm">
        <thead className="bg-slate-50">
          <tr>{headers.map((h, i) => <th key={i} className="px-3 py-2 text-left font-bold text-slate-600 text-xs">{h}</th>)}</tr>
        </thead>
        <tbody>
          {body.map((row, i) => (
            <tr key={i} className="border-t border-slate-100">
              {row.map((cell, j) => <td key={j} className="px-3 py-2 text-slate-700">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
