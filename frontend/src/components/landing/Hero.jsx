import { motion } from "framer-motion";
import { ArrowRight, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button";

const languages = ["English", "हिन्दी", "తెలుగు", "ಕನ್ನಡ", "தமிழ்", "മലയാളം"];

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative flex min-h-[92vh] flex-col items-center justify-center px-6 pt-24 text-center">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 3.0, ease: [0.16, 1, 0.3, 1] }}
        className="mb-6 flex items-center gap-2 rounded-full border border-border bg-white/[0.03] px-4 py-1.5"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-growth" />
        <span className="text-xs font-medium text-slate">
          50+ schemes · answers in 9 Indian languages
        </span>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 3.15, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-4xl text-balance font-display text-5xl font-medium leading-[1.08] text-ink sm:text-6xl md:text-7xl"
      >
        The scheme you qualify for is out there.
        <span className="text-marigold"> We'll help you find it.</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 3.3, ease: [0.16, 1, 0.3, 1] }}
        className="mt-6 max-w-xl text-balance text-lg leading-relaxed text-slate"
      >
        Ask about any government scheme in your own language. Every answer
        is cited to the official document it came from — no guessing,
        no jargon.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 3.45, ease: [0.16, 1, 0.3, 1] }}
        className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
      >
        <Button size="lg" onClick={() => navigate("/chat")}>
          <MessageCircle size={19} />
          Ask a question
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={() => navigate("/eligibility")}
        >
          Check what I qualify for
          <ArrowRight size={18} />
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 3.7 }}
        className="mt-14 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-slateDim"
      >
        {languages.map((lang, i) => (
          <span key={lang} className="flex items-center gap-5">
            {lang}
            {i < languages.length - 1 && (
              <span className="text-slateDim/40">+3 more</span>
            )}
          </span>
        ))}
      </motion.div>
    </section>
  );
}