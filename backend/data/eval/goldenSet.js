/**
 * goldenSet — hand-labeled test questions for evaluating retrieval
 * quality. Each entry pairs a realistic citizen question with the
 * schemeId(s) a human considers the correct answer. jobs/runEvaluation.js
 * runs every question through the real vectorSearch() pipeline and
 * scores the results against this file using services/retrievalMetrics.js.
 *
 * Some questions intentionally have more than one relevant scheme
 * (e.g. farmer credit could reasonably surface both PM-KISAN and Kisan
 * Credit Card) — recall@k accounts for that; a single-answer question
 * only needs hit@k.
 *
 * Keep this file growing as the scheme dataset grows — an evaluation
 * set that doesn't track the underlying data goes stale fast.
 */
export default [
  {
    question: "What help is available for farmers who need money to grow crops?",
    relevantSchemeIds: ["pm-kisan-samman-nidhi", "kisan-credit-card"],
  },
  {
    question: "Is there insurance if my crops get destroyed by flood or drought?",
    relevantSchemeIds: ["pm-fasal-bima-yojana"],
  },
  {
    question: "How can I get free medical treatment if I need to be hospitalized?",
    relevantSchemeIds: ["ayushman-bharat-pmjay"],
  },
  {
    question: "What support exists for my daughter's education and future?",
    relevantSchemeIds: ["sukanya-samriddhi-yojana", "beti-bachao-beti-padhao"],
  },
  {
    question: "I want to start a small business but have no collateral for a loan.",
    relevantSchemeIds: ["mudra-yojana", "pm-svanidhi"],
  },
  {
    question: "Is there a scheme to help me buy or build a house?",
    relevantSchemeIds: ["pmay-urban", "pmay-gramin"],
  },
  {
    question: "What guaranteed employment can I get in my village?",
    relevantSchemeIds: ["mgnrega"],
  },
  {
    question: "How do I get a pension after I turn 60?",
    relevantSchemeIds: ["atal-pension-yojana", "national-social-assistance-programme", "senior-citizens-savings-scheme"],
  },
  {
    question: "I'm a street vendor and need working capital for my cart.",
    relevantSchemeIds: ["pm-svanidhi"],
  },
  {
    question: "What scholarships exist for SC/ST students in college?",
    relevantSchemeIds: ["national-scholarship-portal", "pm-yasasvi-scholarship"],
  },
  {
    question: "Can I get a free wheelchair or hearing aid?",
    relevantSchemeIds: ["adip-scheme"],
  },
  {
    question: "How do I open a free bank account with no minimum balance?",
    relevantSchemeIds: ["pradhan-mantri-jan-dhan-yojana"],
  },
  {
    question: "Is there a subsidy for installing solar panels on my roof?",
    relevantSchemeIds: ["pm-surya-ghar-muft-bijli-yojana"],
  },
  {
    question: "What cash assistance is available for a pregnant woman?",
    relevantSchemeIds: ["pradhan-mantri-matru-vandana-yojana", "janani-suraksha-yojana"],
  },
  {
    question: "Where can I get free or low-cost generic medicines?",
    relevantSchemeIds: ["pradhan-mantri-jan-aushadhi-yojana"],
  },
  {
    question: "I'm an artisan making handicrafts — is there support for my trade?",
    relevantSchemeIds: ["pm-vishwakarma"],
  },
  {
    question: "What free skill training programs can help me get a job?",
    relevantSchemeIds: ["pm-kaushal-vikas-yojana", "jan-shikshan-sansthan"],
  },
  {
    question: "How do I get accident insurance for a very low premium?",
    relevantSchemeIds: ["pradhan-mantri-suraksha-bima-yojana"],
  },
  {
    question: "Is there life insurance available for a small yearly premium?",
    relevantSchemeIds: ["pradhan-mantri-jeevan-jyoti-bima-yojana"],
  },
  {
    question: "What loans are available for women entrepreneurs starting a business?",
    relevantSchemeIds: ["stand-up-india", "tread-scheme-women"],
  },
  {
    question: "How can I get my land's soil tested for free?",
    relevantSchemeIds: ["soil-health-card-scheme"],
  },
  {
    question: "Is there help available for a woman facing domestic violence?",
    relevantSchemeIds: ["one-stop-centre-scheme", "swadhar-greh-scheme"],
  },
  {
    question: "What benefits exist for senior citizens who can't afford healthcare?",
    relevantSchemeIds: ["ayushman-bharat-vay-vandana"],
  },
  {
    question: "How do I register my startup for tax benefits and funding?",
    relevantSchemeIds: ["startup-india-seed-fund", "credit-guarantee-scheme-startups"],
  },
  {
    question: "Is there a scheme for free LPG gas connections for poor families?",
    relevantSchemeIds: ["pradhan-mantri-ujjwala-yojana"],
  },
  {
    question: "What support is there for a person with a physical disability to get a job or start work?",
    relevantSchemeIds: ["divyangjan-swavalamban-yojana", "unique-disability-id"],
  },
  {
    question: "How do I get piped drinking water connected to my house in the village?",
    relevantSchemeIds: ["jal-jeevan-mission"],
  },
  {
    question: "Is there any support for unorganised sector or gig workers like delivery drivers?",
    relevantSchemeIds: ["e-shram-card", "pm-shram-yogi-maandhan"],
  },
  {
    question: "What documents do I need and how do I get a caste certificate?",
    relevantSchemeIds: ["digital-caste-certificate"],
  },
  {
    question: "Is there financial support for organic farming certification?",
    relevantSchemeIds: ["paramparagat-krishi-vikas-yojana"],
  },
];
