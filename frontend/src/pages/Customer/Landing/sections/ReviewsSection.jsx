// Yoga T20 - "Reviews from Real People" section
// 2 rows of scrolling/grid review cards — matches Figma screenshot exactly

const reviews = [
  {
    id: 1,
    text: "After 12 weeks of tracking my sugar and walking steps on DiabMukth, my doctor helped me safely reduce my dosage",
    name: "Yash Chopra",
    role: "Corporate Professional",
  },
  {
    id: 2,
    text: "Being able to show my real-time logs for sleep and water intake to my consultant changed everything",
    name: "Yash Chopra",
    role: "Corporate Professional",
  },
  {
    id: 3,
    text: "I started with Yogat20 and moved to DiabMukth for my sugar management. The habit-building streaks kept me motivated even on busy days",
    name: "Yash Chopra",
    role: "Corporate Professional",
  },
  {
    id: 4,
    text: "I started with Yogat20 and moved to DiabMukth for my sugar management. The habit-building streaks kept me motivated even on busy days",
    name: "Yash Chopra",
    role: "Corporate Professional",
  },
  {
    id: 5,
    text: "After 12 weeks of tracking my sugar and walking steps on DiabMukth, my doctor helped me safely reduce my dosage",
    name: "Yash Chopra",
    role: "Corporate Professional",
  },
  {
    id: 6,
    text: "Being able to show my real-time logs for sleep and water intake to my consultant changed everything",
    name: "Yash Chopra",
    role: "Corporate Professional",
  },
  {
    id: 7,
    text: "I started with Yogat20 and moved to DiabMukth for my sugar management. The habit-building streaks kept me motivated even on busy days",
    name: "Yash Chopra",
    role: "Corporate Professional",
  },
  {
    id: 8,
    text: "Being able to show my real-time logs for sleep and water intake to my consultant changed everything",
    name: "Yash Chopra",
    role: "Corporate Professional",
  },
];

function ReviewCard({ text, name, role }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4 h-full">
      {/* Big quote mark */}
      <span className="text-orange-400 text-4xl font-serif leading-none select-none">&ldquo;</span>
      {/* Review text */}
      <p className="text-gray-600 text-sm leading-relaxed flex-1">
        {text}
      </p>
      {/* Author */}
      <div className="pt-3 border-t border-gray-100">
        <p className="text-gray-800 font-semibold text-sm">{name}</p>
        <p className="text-gray-400 text-xs mt-0.5">{role}</p>
      </div>
    </div>
  );
}

export default function ReviewsSection() {
  const row1 = reviews.slice(0, 4);
  const row2 = reviews.slice(4, 8);

  return (
    <section className="py-14 lg:py-20 bg-white">
      <div className="max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="text-center mb-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Reviews from{" "}
            <span className="text-orange-500">Real People</span>
          </h2>
        </div>

        {/* Sub-heading */}
        <p className="text-center text-gray-500 text-sm sm:text-base max-w-xl mx-auto mb-10 leading-relaxed">
          &ldquo;From building daily yoga habits to managing diabetes reversal,
          hear how our members are taking control of their health&rdquo;
        </p>

        {/* Row 1 — 4 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {row1.map((r) => (
            <ReviewCard key={r.id} {...r} />
          ))}
        </div>

        {/* Row 2 — 4 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {row2.map((r) => (
            <ReviewCard key={r.id} {...r} />
          ))}
        </div>

      </div>
    </section>
  );
}