import { motion } from "framer-motion";
import {
  MessageSquareText,
  ListChecks,
  LayoutGrid,
  FileText,
  Bookmark,
  Languages,
  ShieldCheck,
} from "lucide-react";
import Card from "../ui/Card";

const features = [
  {
    icon: MessageSquareText,
    title: "Ask in your own language",
    description:
      "Type a question the way you'd ask a person, in any of 9 Indian languages. Get a direct answer, not a list of links.",
  },
  {
    icon: ListChecks,
    title: "Find out what you qualify for",
    description:
      "Answer five questions about your state, income and category. See every scheme you're eligible for, explained plainly.",
  },
  {
    icon: LayoutGrid,
    title: "Browse by category",
    description:
      "Filter 50+ schemes by category, state or beneficiary type when you'd rather explore than ask.",
  },
  {
    icon: FileText,
    title: "Everything needed to apply",
    description:
      "Benefits, required documents and step-by-step application instructions, together on one page.",
  },
  {
    icon: Bookmark,
    title: "Save schemes for later",
    description:
      "Bookmark the schemes that apply to you and come back to your list whenever you're ready.",
  },
  {
    icon: ShieldCheck,
    title: "Every answer is cited",
    description:
      "We never guess. Each answer names the exact scheme document it was drawn from, so you can verify it yourself.",
  },
];

export default function Features() {
  return (
    <section className="relative mx-auto max-w-7xl px-6 py-28">
      <div className="mx-auto max-w-2xl text-center">
        <h2 className="text-balance font-display text-4xl font-medium text-ink sm:text-5xl">
          One bridge, built for how you actually ask
        </h2>
        <p className="mt-4 text-balance text-lg text-slate">
          SarkariSetu doesn't replace the government portals — it's the
          layer that makes sense of all of them at once.
        </p>
      </div>

      <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, i) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
          >
            <Card className="h-full">
              <feature.icon className="text-marigold" size={26} strokeWidth={1.75} />
              <h3 className="mt-4 text-lg font-semibold text-ink">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate">
                {feature.description}
              </p>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="mt-16 flex flex-wrap items-center justify-center gap-10 border-t border-border pt-12 text-center">
        <div>
          <p className="font-display text-4xl font-medium text-marigold">50+</p>
          <p className="mt-1 text-sm text-slate">Government schemes</p>
        </div>
        <div>
          <p className="font-display text-4xl font-medium text-growth-bright">9</p>
          <p className="mt-1 text-sm text-slate">Indian languages</p>
        </div>
        <div>
          <p className="font-display text-4xl font-medium text-ink">14</p>
          <p className="mt-1 text-sm text-slate">Categories covered</p>
        </div>
        <div className="flex items-center gap-2">
          <Languages className="text-slate" size={20} />
          <p className="text-sm text-slate">No app install needed</p>
        </div>
      </div>
    </section>
  );
}