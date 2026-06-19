// Yoga T20 Programs - Program Dashboard
// 3 yoga-type cards (Normal / Chair / High Intensity).
// Clicking "Start" opens that type's YouTube URL AND starts the 24hr countdown
// (markVideoComplete), so the NEXT day the queue serves the next video.
// No central video section, no manual "Mark as Complete". No backend change.

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Play, Check, Plus, Bell, Calendar, ChevronUp, Stethoscope, Lock, Gift, Video, Clock, X } from "lucide-react";
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
import { fetchMySubscription } from "../../../services/customerBillingService";

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

// 🎁 Free consultations entitled by plan tenure.
// Monthly: floor(months/3). Weekly: floor(weeks/12). Capped at 4 for display.
const entitlementFromSubscription = (sub) => {
  if (!sub || !sub.isActive) return 0;
  // weekly tenure like "24 Weeks"
  const weekMatch = String(sub.tenure || "").match(/(\d+)\s*week/i);
  if (weekMatch)
    return Math.min(4, Math.floor(parseInt(weekMatch[1], 10) / 12));
  // monthly tenure like "6 Months" (fallback to totalWeeks if present)
  const monthMatch = String(sub.tenure || "").match(/(\d+)\s*month/i);
  if (monthMatch)
    return Math.min(4, Math.floor(parseInt(monthMatch[1], 10) / 3));
  return 0;
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

  // 🩺 free-consultation cards state
  const [upcomingAppointments, setUpcomingAppointments] = useState([]); // plan-credit bookings (this program)
  const [allUpcoming, setAllUpcoming] = useState([]); // every upcoming appointment
  const [entitlement, setEntitlement] = useState(0);
  const [planCreditsLeft, setPlanCreditsLeft] = useState(0);

  // 🎂 birthday wish popup (user closes manually — no auto-close)
  const [birthdayPopupOpen, setBirthdayPopupOpen] = useState(false);

  // 🔔 plan-expiry welcome popup
  const [expiryPopupOpen, setExpiryPopupOpen] = useState(false);
  const [expiryInfo, setExpiryInfo] = useState(null);
  const expiryTimerRef = useRef(null);

  // auto-close the expiry popup after 5s (only once it's actually visible, i.e. birthday popup closed)
  useEffect(() => {
    if (!expiryPopupOpen || birthdayPopupOpen) return;
    expiryTimerRef.current = setTimeout(() => setExpiryPopupOpen(false), 5000);
    return () => clearTimeout(expiryTimerRef.current);
  }, [expiryPopupOpen, birthdayPopupOpen]);

  // close popup early + clear timer
  const closeExpiryPopup = () => {
    if (expiryTimerRef.current) clearTimeout(expiryTimerRef.current);
    setExpiryPopupOpen(false);
  };

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
        // fetch ALL appointments so cancelled/completed free consults still hold a card
        const result = await listMyAppointments({
          bucket: "all",
          limit: 50,
        });
        if (!mounted) return;
        const appointments = result?.appointments || [];

        // free-consult appointments for THIS program (any state) → fill cards, oldest first
        const planAppts = appointments
          .filter((a) => a.paidWithPlanCredit && a.platform === id)
          .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
        setUpcomingAppointments(planAppts);

        // upcoming (any booking, not cancelled) → separate "Upcoming Appointment" card
        const upcoming = appointments
          .filter(
            (a) =>
              new Date(a.scheduledAt) >= new Date() &&
              ["pending", "confirmed"].includes(a.status)
          )
          .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt));
        setNextAppointment(upcoming[0] || null);
        setAllUpcoming(upcoming);
      } catch (err) {
        console.error("Failed to load appointments:", err);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  // 📥 Load the logged-in user's name + plan free-consult credits for the greeting/cards
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const profile = await fetchMyProfile();
        if (mounted) {
          setUserName(profile?.fullName || profile?.nickName || "");
          // read only THIS program's plan credits from the per-program map
          setPlanCreditsLeft(profile?.planFreeConsults?.[id] || 0);

          // 🎂 birthday popup — show once per birthday per session
          if (profile?.dob) {
            const dob = new Date(profile.dob);
            const now = new Date();
            const isBirthday =
              !isNaN(dob.getTime()) &&
              dob.getUTCMonth() === now.getUTCMonth() &&
              dob.getUTCDate() === now.getUTCDate();
            if (isBirthday) {
              const sessionTag = (
                localStorage.getItem("token") ||
                sessionStorage.getItem("token") ||
                ""
              ).slice(-12);
              const bdayKey = `birthdayPopupShown_${id}_${sessionTag}`;
              if (sessionStorage.getItem(bdayKey) !== "1") {
                setBirthdayPopupOpen(true);
                sessionStorage.setItem(bdayKey, "1");
              }
            }
          }
        }
      } catch {
        // soft fail — greeting shows without a name
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // 📥 Load active subscription → compute free-consult entitlement + expiry popup
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetchMySubscription(id);
        const sub = res?.subscription || null;
        if (!mounted) return;
        setEntitlement(entitlementFromSubscription(sub));

        // 🔔 show expiry popup ONCE per session (not on every refresh/visit)
        const sessionTag = (localStorage.getItem("token") || sessionStorage.getItem("token") || "").slice(-12);
        const popupKey = `expiryPopupShown_${id}_${sessionTag}`;
        const alreadyShown = sessionStorage.getItem(popupKey) === "1";
        if (
          !alreadyShown &&
          sub?.isActive &&
          typeof sub.daysUntilExpiry === "number" &&
          sub.daysUntilExpiry <= 7 &&
          !res?.pendingRenewal
        ) {
          // store it but only OPEN after the birthday popup is dismissed (birthday has priority)
          setExpiryInfo({
            daysLeft: sub.daysUntilExpiry,
            endDate: sub.endDate,
            programName: sub.programName,
          });
          sessionStorage.setItem(popupKey, "1"); // mark shown for this session
          // open immediately only if no birthday popup is up
          setExpiryPopupOpen(true);
        }
      } catch {
        // soft fail — no cards shown if subscription can't load
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

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
    <div className="min-h-screen bg-[#F6F8FC] flex flex-col">
      {/* 🎂 BIRTHDAY WISH POPUP (manual close; theme-neutral so it pastes into any program) */}
      {birthdayPopupOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md px-6 py-8 sm:px-8 text-center relative overflow-hidden">
            {/* festive top band */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-pink-400 via-amber-400 to-purple-500" />

            <button
              type="button"
              onClick={() => setBirthdayPopupOpen(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* cake illustration */}
            <img
              src="/images/birthday-cake.png"
              alt="Birthday cake"
              className="w-28 h-28 sm:w-32 sm:h-32 object-contain mx-auto mb-4"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />

            <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-1">
              Happy Birthday{userName ? `, ${userName}` : ""}! 🎉
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">
              Wishing you a day full of joy and good health. Thank you for being
              part of the {programTitle} family — here's to another year of
              progress and wellness! 🎂
            </p>

            <button
              type="button"
              onClick={() => setBirthdayPopupOpen(false)}
              className="inline-flex items-center justify-center gap-1.5 px-7 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 transition-colors shadow-[0_6px_18px_rgba(168,85,247,0.3)]"
            >
              Thank you! 🎈
            </button>
          </div>
        </div>
      )}

      {/* 🔔 PLAN-EXPIRY WELCOME POPUP (auto-closes in 5s) — waits until birthday popup is closed */}
      {expiryPopupOpen && expiryInfo && !birthdayPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md px-7 py-8 text-center relative">
            <button
              type="button"
              onClick={closeExpiryPopup}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#EEF2FF] to-[#F5F7FF] flex items-center justify-center mx-auto mb-4 ring-8 ring-[#F5F7FF]/60">
              <Clock size={28} className="text-orange-500" />
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
              {expiryInfo.daysLeft <= 0
                ? "Your plan expires today"
                : expiryInfo.daysLeft === 1
                ? "Your plan expires tomorrow"
                : `Your plan expires in ${expiryInfo.daysLeft} days`}
            </h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-5">
              Renew your {expiryInfo.programName} plan to keep your videos,
              progress tracking, and free consultations going without a break.
            </p>

            <button
              type="button"
              onClick={() => {
                closeExpiryPopup();
                navigate("/my-plans-and-billings");
              }}
              className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors"
            >
              Renew Now
            </button>
          </div>
        </div>
      )}

      {/* blink animation for active free-consult card border */}
      <style>{`
        @keyframes consultBlink {
          0%, 100% { border-color: #FED7AA; box-shadow: 0 0 0 0 rgba(249,115,22,0); }
          50% { border-color: #F97316; box-shadow: 0 0 0 4px rgba(249,115,22,0.15); }
        }
        .consult-blink { animation: consultBlink 1.4s ease-in-out infinite; }
      `}</style>
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
                <HabitTrackerForm
                  programId={id}
                  onSaved={handleProgressSaved}
                />
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
          {/* 📅 UPCOMING APPOINTMENT (any booking)              */}
          {/* ══════════════════════════════════════════════════ */}
          {/* <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                <Calendar size={15} className="text-blue-500" />
              </div>
              <span className="font-semibold text-gray-800 text-sm">
                Upcoming Appointment
              </span>
            </div>

            {allUpcoming.length > 0 ? (
              <div className="bg-blue-50 rounded-xl px-5 py-4 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-gray-500 flex items-center gap-1 mb-1">
                    <Bell size={11} className="text-blue-400" />
                    Upcoming Check-in
                  </p>
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {allUpcoming[0].doctorName ||
                      allUpcoming[0].doctor?.fullName ||
                      "Doctor"}{" "}
                    — {formatAppointmentDate(allUpcoming[0].scheduledAt)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/my-appointments")}
                  className="text-xs font-semibold text-blue-600 hover:underline shrink-0"
                >
                  View all
                </button>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl px-5 py-4 text-center">
                <p className="text-sm text-gray-500">
                  No upcoming appointments yet.
                </p>
              </div>
            )}
          </div> */}

          {/* ══════════════════════════════════════════════════ */}
          {/* 🩺 FREE DOCTOR CONSULTATIONS (plan benefit)        */}
          {/* ══════════════════════════════════════════════════ */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 bg-orange-50 rounded-lg flex items-center justify-center">
                <Stethoscope size={15} className="text-orange-500" />
              </div>
              <span className="font-semibold text-gray-800 text-sm">
                Your Free Consultations
              </span>
            </div>

            {entitlement === 0 ? (
              <div className="mt-4 bg-gray-50 rounded-xl px-5 py-4 text-center">
                <p className="text-sm text-gray-500">
                  Purchase a plan to unlock free doctor consultations.
                </p>
              </div>
            ) : (
              <>
                {/* 🔔 daily reminder — only if a free slot is still bookable */}
                {planCreditsLeft > 0 && (
                  <div className="mt-3 mb-4 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 flex items-center gap-2 shadow-[0_6px_18px_rgba(249,115,22,0.25)]">
                    <Gift size={16} className="text-white shrink-0" />
                    <p className="text-sm font-semibold text-white">
                      Book Your Free Doctor Consultation
                      {planCreditsLeft > 1 ? "s" : ""} ({planCreditsLeft} left).
                    </p>
                  </div>
                )}

                {/* 🃏 cards — 4 slots, responsive grid */}
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                  {Array.from({ length: 4 }).map((_, i) => {
                    const isWithinPlan = i < entitlement;
                    const appt = upcomingAppointments[i]; // free-consult appointment for this slot
                    const slotNo = i + 1;

                    // shared card sizing
                    const cardBase =
                      "rounded-2xl border-2 px-5 py-5 min-h-[120px] flex flex-col justify-center transition-all";

                    // Beyond plan entitlement → locked
                    if (!isWithinPlan) {
                      return (
                        <div
                          key={i}
                          className={`${cardBase} border-dashed border-gray-200 bg-gray-50/60 opacity-70`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gray-200/70 flex items-center justify-center shrink-0">
                              <Lock size={16} className="text-gray-400" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-400">
                                Consultation {slotNo}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5">
                                Upgrade your plan to unlock
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    }

                    // A free-consult appointment occupies this slot → show its state (disabled)
                   if (appt) {
                      const isCancelled = appt.status === "cancelled";
                      const isCompleted = appt.status === "completed";
                      // show Join only for active (not cancelled/completed) bookings with a sent link
                      const canJoin =
                        !isCancelled &&
                        !isCompleted &&
                        !!appt.meetingLink &&
                        !!appt.meetingLinkSentAt;
                      const tone = isCancelled
                        ? { border: "border-gray-200", bg: "bg-gray-50", icon: "bg-gray-100", iconColor: "text-gray-400", badge: "text-gray-500 bg-gray-100", label: "Cancelled" }
                        : isCompleted
                        ? { border: "border-emerald-200", bg: "bg-emerald-50/50", icon: "bg-emerald-100", iconColor: "text-emerald-600", badge: "text-emerald-700 bg-emerald-100", label: "Completed" }
                        : { border: "border-emerald-200", bg: "bg-emerald-50/50", icon: "bg-emerald-100", iconColor: "text-emerald-600", badge: "text-emerald-700 bg-emerald-100", label: "Booked" };

                      return (
                        <div
                          key={i}
                          className={`${cardBase} ${tone.border} ${tone.bg} ${isCancelled ? "opacity-80" : ""}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl ${tone.icon} flex items-center justify-center shrink-0`}>
                              <Calendar size={16} className={tone.iconColor} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className={`text-sm font-bold truncate ${isCancelled ? "text-gray-500 line-through" : "text-gray-800"}`}>
                                {appt.doctorName || appt.doctor?.fullName || "Doctor"}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {formatAppointmentDate(appt.scheduledAt)}
                              </p>
                            </div>
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${tone.badge}`}>
                              {tone.label}
                            </span>
                          </div>

                        {/* 🔗 meeting link + Join Now (once doctor sends it) */}
                          {canJoin && (
                            <div className="mt-3 pt-3 border-t border-emerald-100 space-y-2">
                              <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                                <Video size={12} className="text-orange-500 shrink-0" />
                                <a
                                  href={appt.meetingLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-orange-600 hover:underline truncate"
                                  title={appt.meetingLink}
                                >
                                  {appt.meetingLink}
                                </a>
                              </div>
                              <a
                                href={appt.meetingLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white bg-orange-500 hover:bg-orange-600 transition-colors shadow-[0_4px_10px_rgba(249,115,22,0.25)]"
                              >
                                <Video size={12} />
                                Join Now
                              </a>
                            </div>
                          )}
                        </div>
                      );
                    }

                    // No appointment here → active ONLY if real credits remain
                    if (planCreditsLeft > 0) {
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => navigate("/book-doctor")}
                          className={`${cardBase} text-left border-orange-200 bg-orange-50/40 hover:bg-orange-50 consult-blink`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                              <Stethoscope size={16} className="text-orange-600" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-bold text-gray-800">
                                Free Consultation {slotNo}
                              </p>
                              <p className="text-xs text-orange-600 font-medium mt-0.5">
                                Tap to book your free consultation →
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    }

                    // Within plan but no appointment and no credits left → used/empty (disabled)
                    return (
                      <div
                        key={i}
                        className={`${cardBase} border-dashed border-gray-200 bg-gray-50/60 opacity-70`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-200/70 flex items-center justify-center shrink-0">
                            <Lock size={16} className="text-gray-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-400">
                              Consultation {slotNo}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              No free consultation available
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <CustomerFooter />
    </div>
  );
}
