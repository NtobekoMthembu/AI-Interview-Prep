import { useNavigate } from 'react-router-dom';

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#EAF7F2] to-[#F7FBFA] flex items-center justify-center px-6 relative overflow-hidden">
      {/* One quiet decorative shape — not several, per the "spend your boldness
          in one place" idea. Keeps the page calm instead of busy. */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-[#BFEEDD] opacity-50 blur-3xl pointer-events-none" />

      <div className="max-w-xl text-center relative">
        <h2 className="text-4xl md:text-5xl text-[#10243E]" style={{ fontFamily: "'Fraunces', serif" }}>
          Your Interview Coach
        </h2>
        <p className="mt-6 text-lg text-[#4C5F70] leading-relaxed">
          Walk in ready to be heard. Practice real interview questions out loud, get honest feedback,
          and know exactly what to work on before the real thing.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="mt-10 px-8 py-3 bg-[#2A6DF4] text-white font-medium hover:bg-[#1F58D1] transition rounded-2xl"
        >
          Get started
        </button>
      </div>
    </div>
  );
}