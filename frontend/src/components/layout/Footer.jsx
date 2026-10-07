import { Link } from "react-router-dom";

const columns = [
  {
    heading: "Explore",
    links: [
      { to: "/chat", label: "Ask AI" },
      { to: "/schemes", label: "Browse schemes" },
      { to: "/eligibility", label: "Check eligibility" },
    ],
  },
  {
    heading: "Categories",
    links: [
      { to: "/schemes?category=agriculture", label: "Agriculture" },
      { to: "/schemes?category=health", label: "Health" },
      { to: "/schemes?category=education", label: "Education" },
      { to: "/schemes?category=housing", label: "Housing" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-base">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <span className="font-display text-xl font-semibold text-ink">
              Sarkari<span className="text-marigold">Setu</span>
            </span>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate">
              A bridge between citizens and the 1,000+ government schemes
              that exist but stay unknown. Ask a question in your own
              language and get an answer with a source you can check.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.heading}>
              <h3 className="text-sm font-semibold text-ink">{col.heading}</h3>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-slate transition-colors hover:text-marigold"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-xs text-slateDim sm:flex-row sm:items-center sm:justify-between">
          <p>SarkariSetu is an independent portfolio project, not a government platform.</p>
          <p>Built with React, Node.js, MongoDB and Claude AI</p>
        </div>
      </div>
    </footer>
  );
}