// Yoga T20 Programs - Program Dashboard
// 3 yoga-type cards (Normal / Chair / High Intensity).
// Clicking "Start" opens that type's YouTube URL AND starts the 24hr countdown
// (markVideoComplete), so the NEXT day the queue serves the next video.
// No central video section, no manual "Mark as Complete". No backend change.

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Play, Plus, Bell, Calendar, ChevronUp } from "lucide-react";
import HabitTrackerForm from "./components/HabitTrackerForm";
import toast from "react-hot-toast";
import CustomerNavbar from "../../../components/customer/layout/CustomerNavbar";
import CustomerFooter from "../../../components/customer/layout/CustomerFooter";
import {
  getCurrentVideo,
  markVideoComplete,
} from "../../../services/clinicalVideoService";
import { listMyAppointments } from "../../../services/customerAppointmentService";
import { fetchMyProfile } from "../../../services/customerProfileService";

const programTitles = {
  yogat20: "Yoga T20",
  diabmukt: "Diabmukt",
  mommyfit: "MommyFit",
  slimfitter: "Slimfitter",
};

// 🧘 The 3 yoga queues
const YOGA_TYPES = {
  normal_yoga: { id: "normal_yoga", label: "Normal Yoga" },
  chair_yoga: { id: "chair_yoga", label: "Chair Yoga" },
  high_intensity: { id: "high_intensity", label: "High Intensity Yoga" },
};

// 🧘 The 3 cards shown on the dashboard. Clicking "Start" plays that queue's
// current video on YouTube and advances the queue (starts the 24hr countdown).
const YOGA_CARDS = [
  {
    id: "normal_yoga",
    label: "Your daily practice",
    bold: "Normal Yoga",
    image: "/images/normalyogaimg.png", // ⚠️ add this asset to /public/images
  },
  {
    id: "chair_yoga",
    label: "Tired today ? Do some",
    bold: "Chair Yoga",
    image: "/images/chairyogaimg.png",
  },
  {
    id: "high_intensity",
    label: "Motivated Enough for",
    bold: "High Intensity Yoga",
    image: "/images/highintesityyogaimg.png",
  },
];

// ─── Progress Ring (self-contained component, no overflow) ──────────────────
function ProgressRing() {
  const SIZE = 200;
  const CX = 100;
  const STROKE = 13;
  const rings = [
    { label: "Sleep", color: "#F97316", value: 75, r: 84 },
    { label: "Sleep", color: "#A855F7", value: 60, r: 67 },
    { label: "Water", color: "#3B82F6", value: 45, r: 50 },
    { label: "Steps", color: "#22C55E", value: 85, r: 33 },
  ];

  return (
    <div className="flex flex-col items-center gap-3">
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ transform: "rotate(-90deg)" }}
      >
        {rings.map(({ color, value, r }) => {
          const circ = 2 * Math.PI * r;
          const dash = (value / 100) * circ;
          return (
            <g key={r}>
              {/* Track */}
              <circle
                cx={CX}
                cy={CX}
                r={r}
                fill="none"
                stroke={color}
                strokeWidth={STROKE}
                opacity={0.12}
              />
              {/* Progress */}
              <circle
                cx={CX}
                cy={CX}
                r={r}
                fill="none"
                stroke={color}
                strokeWidth={STROKE}
                strokeDasharray={`${dash} ${circ}`}
                strokeLinecap="round"
              />
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
        {rings.map(({ label, color, value, r }) => (
          <div key={r} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: color }}
            />
            <span className="text-xs text-gray-500 font-medium">
              {label}{" "}
              <span className="font-bold" style={{ color }}>
                {value}%
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// 📅 Format date as "Monday, Feb 23"
const formatToday = () =>
  new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "2-digit",
  });

// 🕒 Returns "Good Morning/Afternoon/Evening" based on current hour
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
};

// 📅 Format appointment date relative
const formatAppointmentDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.round((d - now) / (1000 * 60 * 60 * 24));
  const timeStr = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (diffDays === 0) return `Today, ${timeStr}`;
  if (diffDays === 1) return `Tomorrow, ${timeStr}`;
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days, ${timeStr}`;
  return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${timeStr}`;
};

export default function ProgramDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const programTitle = programTitles[id] || "Program";

  // 📈 inline Add-Progress expand state
  const [showProgress, setShowProgress] = useState(false);
  const topRef = useRef(null); // scroll target after saving
  const progressRef = useRef(null); // scroll target when auto-opening from navbar

  const [searchParams, setSearchParams] = useSearchParams();

  // called after habits saved → collapse + scroll user to top
  const handleProgressSaved = () => {
    setShowProgress(false);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // auto-open the habit form + scroll to it when arriving with ?openProgress=1
  useEffect(() => {
    if (searchParams.get("openProgress") === "1") {
      setShowProgress(true);
      // clear the param so refresh/back doesn't re-trigger
      searchParams.delete("openProgress");
      setSearchParams(searchParams, { replace: true });
      // wait for expand animation to start, then scroll to the form
      const t = setTimeout(() => {
        progressRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 250);
      return () => clearTimeout(t);
    }
  }, [searchParams, setSearchParams]);

  // 🎬 Pre-fetched current video for EACH yoga type.
  // Shape per entry: { video, completedToday, dayIndex, isScheduled } | null
  const [videosByType, setVideosByType] = useState({});
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [startingType, setStartingType] = useState(null); // type currently advancing

  const [nextAppointment, setNextAppointment] = useState(null);
  const [userName, setUserName] = useState(""); // logged-in user's display name

  // 📥 Load the current video for all three queues at once.
  // Pre-fetching is required so window.open() on click is synchronous and
  // does NOT get blocked by the browser's popup blocker.
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingVideos(true);
      try {
        const types = Object.keys(YOGA_TYPES);
        const results = await Promise.all(
          types.map((t) => getCurrentVideo(id, t).catch(() => null)),
        );
        if (!mounted) return;
        const map = {};
        types.forEach((t, i) => {
          map[t] = results[i];
        });
        setVideosByType(map);
      } finally {
        if (mounted) setLoadingVideos(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  // 📥 Load next appointment (once on mount)
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const result = await listMyAppointments({
          bucket: "upcoming",
          limit: 5,
        });
        if (!mounted) return;
        const appointments = result?.appointments || [];
        const sorted = [...appointments].sort(
          (a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt),
        );
        setNextAppointment(sorted[0] || null);
      } catch (err) {
        console.error("Failed to load appointments:", err);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // 📥 Load the logged-in user's name for the greeting
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const profile = await fetchMyProfile();
        if (mounted) {
          setUserName(profile?.fullName || profile?.nickName || "");
        }
      } catch {
        // soft fail — greeting shows without a name
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // ▶️ Start a queue: open the YouTube video AND begin the 24hr countdown.
  // Visiting the video IS the trigger — no separate "Mark Complete" needed.
  const handleStart = (type) => {
    const data = videosByType[type];
    if (!data?.video?.videoUrl) {
      toast.error(`No ${YOGA_TYPES[type].label} video available yet.`);
      return;
    }

    // Open synchronously (inside the click handler) so it isn't popup-blocked.
    window.open(data.video.videoUrl, "_blank", "noopener,noreferrer");

    // Already watched today → just reopened it, nothing to advance.
    if (data.completedToday) return;

    // Start the countdown: marking complete advances the queue for tomorrow.
    setStartingType(type);
    (async () => {
      try {
        await markVideoComplete(data.video._id);
        // Refresh this queue so the UI reflects "watched today";
        // the next video unlocks on the next day's visit.
        const refreshed = await getCurrentVideo(id, type).catch(() => ({
          ...data,
          completedToday: true,
        }));
        setVideosByType((prev) => ({ ...prev, [type]: refreshed }));
      } catch (err) {
        // Soft fail — the user still got the video open.
        console.error("Failed to start countdown:", err);
      } finally {
        setStartingType(null);
      }
    })();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <CustomerNavbar />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">
          {/* ══════════════════════════════════════════════════ */}
          {/* GREETING CARD + PROGRESS RING                      */}
          {/* ══════════════════════════════════════════════════ */}
          <div
            ref={topRef}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-7 sm:px-8"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              {/* Left */}
              <div className="flex-1 min-w-0">
                <p className="text-orange-500 font-semibold text-sm mb-1">
                  {programTitle}
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-[#1F2937] leading-tight">
                  {getGreeting()},{" "}
                  <span className="text-orange-500">{userName || "there"}</span>
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  Let's track your wellness journey for today
                </p>
                {/* 📊 ring shown here on mobile only (below greeting) */}
                <div className="sm:hidden mt-5 flex justify-center">
                  <ProgressRing />
                </div>

                {/* Date box */}
                <button
                  onClick={() => navigate(`/programs/${id}/progress-report`)}
                  className="mt-5 bg-[#FFF7ED] border border-[#E7EAF3] rounded-2xl px-4 py-3 inline-flex items-center gap-4 w-full sm:w-auto text-left hover:border-orange-500 transition-colors"
                >
                  <div>
                    <p className="text-xs text-[#9CA3AF] mb-0.5">Today</p>
                    <p className="font-bold text-[#1F2937] text-sm leading-tight">
                      {formatToday()}
                    </p>
                    <p className="text-xm text-[#76787c] mt-1">
                      Click to view your past logs
                    </p>
                  </div>
                  <img
                    src="/images/calendar.png"
                    alt="calendar"
                    className="w-20 h-20 object-contain shrink-0"
                  />
                </button>
                <button
                  onClick={() => setShowProgress((v) => !v)}
                  className="mt-5 flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-6 py-2.5 rounded-full shadow-[0_8px_20px_rgba(91,79,247,0.22)] transition-all duration-200"
                >
                  {showProgress ? <ChevronUp size={15} /> : <Plus size={15} />}
                  {showProgress ? "Hide Progress" : "Add Progress"}
                </button>
              </div>

              {/* Right — progress ring (desktop only; mobile renders it under the greeting) */}
              <div className="shrink-0 mx-auto sm:mx-0 hidden sm:block">
                <ProgressRing />
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════ */}
          {/* 📈 INLINE ADD-PROGRESS (animated expand)            */}
          {/* ══════════════════════════════════════════════════ */}
          <div
            ref={progressRef}
            className={`grid transition-all duration-300 ease-in-out ${
              showProgress
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden">
              <div className="pt-1 pb-1">
                <p className="text-sm font-bold text-gray-800 mb-3 px-1">
                  Log Today's Progress
                </p>
                <HabitTrackerForm programId={id} onSaved={handleProgressSaved} />
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════ */}
          {/* 🧘 CHOOSE YOUR PRACTICE — 3 CARDS                  */}
          {/* ══════════════════════════════════════════════════ */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 pt-6">
              <p className="text-gray-800 font-bold text-base">
                Choose your practice for today
              </p>
              <p className="text-gray-400 text-xs mt-0.5">
                Pick a style and hit Start — your video opens and the next one
                unlocks tomorrow.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 sm:divide-x sm:divide-orange-200">
              {YOGA_CARDS.map((card) => {
                const data = videosByType[card.id];
                const video = data?.video;
                const completedToday = data?.completedToday;
                const dayIndex = data?.dayIndex;
                const busy = startingType === card.id;

                // Button label / state
                let btnLabel = "Start";
                if (loadingVideos) btnLabel = "Loading...";
                else if (!video) btnLabel = "Coming soon";
                else if (busy) btnLabel = "Opening...";
                else if (completedToday) btnLabel = "Watch Again";

                const disabled = loadingVideos || !video || busy;

                return (
                  <div
                    key={card.id}
                    className="flex flex-col items-center text-center px-4 sm:px-8 py-8 sm:py-10"
                  >
                    {/* Illustration */}
                    <div className="w-full h-32 sm:h-72 mb-5">
                      <img
                        src={card.image}
                        alt={card.bold}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    </div>

                    {/* Tagline */}
                    <p className="text-gray-400 text-xs sm:text-sm leading-snug">
                      {card.label}
                    </p>
                    <p className="text-gray-800 font-bold text-sm sm:text-base mt-0.5">
                      {card.bold}
                    </p>

                    {/* Current video hint (today's queue item) */}
                    {video ? (
                      <p className="text-[11px] text-gray-400 mt-1 line-clamp-1 max-w-[12rem]">
                        {dayIndex != null && (
                          <span className="font-semibold text-gray-500">
                            Day {String(dayIndex + 1).padStart(2, "0")} ·{" "}
                          </span>
                        )}
                        {video.title}
                      </p>
                    ) : (
                      !loadingVideos && (
                        <p className="text-[11px] text-gray-300 mt-1">
                          No video yet
                        </p>
                      )
                    )}

                    {/* CTA button */}
                    <button
                      onClick={() => handleStart(card.id)}
                      disabled={disabled}
                      className={`mt-4 inline-flex items-center gap-2 text-sm font-semibold px-10 sm:px-12 py-2.5 rounded-full transition-colors shadow-[0_4px_14px_rgba(249,115,22,0.25)] disabled:cursor-not-allowed disabled:opacity-60 ${
                        completedToday
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : "bg-orange-500 hover:bg-orange-600 text-white"
                      }`}
                    >
                      <Play size={13} fill="white" />
                      {btnLabel}
                    </button>

                    {/* Subtle note once watched today */}
                    {completedToday && (
                      <p className="text-[11px] text-gray-400 mt-2">
                        Next video unlocks tomorrow
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ══════════════════════════════════════════════════ */}
          {/* 🩺 NEXT DOCTOR CONSULTATION                        */}
          {/* ══════════════════════════════════════════════════ */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center">
                <Calendar size={15} className="text-orange-500" />
              </div>
              <span className="font-semibold text-gray-800 text-sm">
                Next Doctor Consultation
              </span>
            </div>

            {nextAppointment ? (
              <div className="bg-blue-50 rounded-xl px-5 py-4">
                <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                  <Bell size={11} className="text-blue-400" />
                  Upcoming Check-in
                </p>
                <p className="text-sm font-medium text-gray-700">
                  {nextAppointment.doctorName ||
                    nextAppointment.doctor?.fullName ||
                    "Doctor"}{" "}
                  — {formatAppointmentDate(nextAppointment.scheduledAt)}
                </p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl px-5 py-4 text-center">
                <p className="text-sm text-gray-500">
                  No upcoming appointments. Book a doctor consultation anytime.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <CustomerFooter />
    </div>
  );
}