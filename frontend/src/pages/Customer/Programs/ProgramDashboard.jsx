// Yoga T20 Programs - Program Dashboard
// Daily video tracker with dynamic queue + 24hr cooldown logic
// Uses real clinical videos from admin CMS + real upcoming appointment

import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Play, Check, Plus, Bell, Calendar } from "lucide-react";
import toast from "react-hot-toast";
import CustomerNavbar from "../../../components/customer/layout/CustomerNavbar";
import CustomerFooter from "../../../components/customer/layout/CustomerFooter";
import {
  getCurrentVideo,
  markVideoComplete,
  buildThumbnailSrc,
} from "../../../services/clinicalVideoService";
import { listMyAppointments } from "../../../services/customerAppointmentService";

const programTitles = {
  yogat20: "Yoga T20",
  diabmukt: "Diabmukt",
  mommyfit: "MommyFit",
  slimfitter: "Slimfitter",
};

// 🧘 The 3 yoga queues (default = normal_yoga)
const YOGA_TYPES = {
  normal_yoga:    { id: "normal_yoga",    label: "Normal Yoga"       },
  chair_yoga:     { id: "chair_yoga",     label: "Chair Yoga"        },
  high_intensity: { id: "high_intensity", label: "High Intensity Yoga" },
};

// 🧘 Suggestion cards below video (clicking swaps the queue)
const suggestions = [
  {
    id: "chair_yoga",
    label: "Tired today ? Do some",
    bold: "Chair yoga then",
    image: "https://images.unsplash.com/photo-1552196563-55cd4e45efb3?w=400&q=80",
  },
  {
    id: "high_intensity",
    label: "Motivated Enough for",
    bold: "Daily Yoga",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&q=80",
  },
];

// ─── Progress Ring (self-contained component, no overflow) ──────────────────
function ProgressRing() {
  const SIZE   = 200;
  const CX     = 100;
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
                cx={CX} cy={CX} r={r}
                fill="none"
                stroke={color}
                strokeWidth={STROKE}
                opacity={0.12}
              />
              {/* Progress */}
              <circle
                cx={CX} cy={CX} r={r}
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
              <span className="font-bold" style={{ color }}>{value}%</span>
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

// 📅 Format appointment date relative
const formatAppointmentDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const now = new Date();
  const diffDays = Math.round((d - now) / (1000 * 60 * 60 * 24));
  const timeStr = d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  if (diffDays === 0) return `Today, ${timeStr}`;
  if (diffDays === 1) return `Tomorrow, ${timeStr}`;
  if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days, ${timeStr}`;
  return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${timeStr}`;
};

export default function ProgramDashboard() {
  const { id } = useParams();
  const programTitle = programTitles[id] || "Program";

  const [yogaType,        setYogaType]        = useState("normal_yoga");
  const [videoData,       setVideoData]       = useState(null);
  const [loadingVideo,    setLoadingVideo]    = useState(true);
  const [markingComplete, setMarkingComplete] = useState(false);
  const [nextAppointment, setNextAppointment] = useState(null);

  // 📥 Load video for current queue
  const loadVideo = useCallback(async () => {
    setLoadingVideo(true);
    try {
      const data = await getCurrentVideo(id, yogaType);
      setVideoData(data);
    } catch (err) {
      console.error("Failed to load video:", err);
      setVideoData(null);
    } finally {
      setLoadingVideo(false);
    }
  }, [id, yogaType]);

  useEffect(() => { loadVideo(); }, [loadVideo]);

  // 📥 Load next appointment (once on mount)
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const result = await listMyAppointments({ bucket: "upcoming", limit: 5 });
        if (!mounted) return;
        const appointments = result?.appointments || [];
        const sorted = [...appointments].sort(
          (a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt)
        );
        setNextAppointment(sorted[0] || null);
      } catch (err) {
        console.error("Failed to load appointments:", err);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // ✅ Mark current video complete
  const handleMarkComplete = async () => {
    if (!videoData?.video || videoData.completedToday || markingComplete) return;
    setMarkingComplete(true);
    try {
      await markVideoComplete(videoData.video._id);
      toast.success("Video marked as complete! See you tomorrow.");
      await loadVideo();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to mark complete");
    } finally {
      setMarkingComplete(false);
    }
  };

  const handleSwitchQueue = (newYogaType) => {
    if (newYogaType === yogaType) return;
    setYogaType(newYogaType);
  };

  const video          = videoData?.video;
  const completedToday = videoData?.completedToday;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <CustomerNavbar />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">

          {/* ══════════════════════════════════════════════════ */}
          {/* GREETING CARD + PROGRESS RING                      */}
          {/* ══════════════════════════════════════════════════ */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-7 sm:px-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">

              {/* Left */}
              <div className="flex-1 min-w-0">
                <p className="text-orange-500 font-semibold text-sm mb-1">
                  {programTitle}
                </p>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 leading-tight">
                  Good Morning,{" "}
                  <span className="text-orange-500">Anandadas</span>
                </h2>
                <p className="text-gray-400 text-sm mt-1">
                  Let's track your wellness journey for today
                </p>

                {/* Date box */}
                <div className="mt-5 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 inline-flex items-center gap-4 w-full sm:w-auto">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Today</p>
                    <p className="font-bold text-gray-800 text-sm leading-tight">
                      {formatToday()}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Click to view your past logs
                    </p>
                  </div>
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/2693/2693507.png"
                    alt="calendar"
                    className="w-10 h-10 object-contain shrink-0"
                  />
                </div>

                <button className="mt-5 flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-6 py-2.5 rounded-full shadow-[0_4px_14px_rgba(249,115,22,0.35)] transition-colors">
                  <Plus size={15} />
                  Add Progress
                </button>
              </div>

              {/* Right — progress ring fully inside the card */}
              <div className="shrink-0 mx-auto sm:mx-0">
                <ProgressRing />
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════ */}
          {/* 🎬 VIDEO CARD                                       */}
          {/* ══════════════════════════════════════════════════ */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            {loadingVideo ? (
              <p className="py-10 text-center text-sm text-gray-400">
                Loading video...
              </p>
            ) : !video ? (
              <div className="py-10 text-center">
                <p className="text-sm text-gray-500 mb-2">
                  No videos available for {YOGA_TYPES[yogaType].label} yet.
                </p>
                <p className="text-xs text-gray-400">
                  Check back soon — new content is uploaded regularly.
                </p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-start gap-5">

                {/* Thumbnail */}
                <a
                  href={video.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative w-full sm:w-52 h-32 rounded-xl overflow-hidden shrink-0 group"
                >
                  <img
                    src={buildThumbnailSrc(video.thumbnailUrl)}
                    alt={video.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80";
                    }}
                  />
                  <div className="absolute inset-0 bg-black/25 group-hover:bg-black/40 flex items-center justify-center transition-colors">
                    <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center">
                      <Play size={18} className="text-white ml-0.5" fill="white" />
                    </div>
                  </div>
                </a>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  {/* Day label */}
                  {videoData?.dayIndex != null && (
                    <p className="text-xs text-gray-400 font-semibold mb-0.5 tracking-wide uppercase">
                      Day {String(videoData.dayIndex + 1).padStart(2, "0")}
                    </p>
                  )}
                  <p className="text-orange-500 font-semibold text-sm">
                    {YOGA_TYPES[yogaType].label}
                    {videoData?.isScheduled && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 text-[10px] font-bold">
                        Today's Special
                      </span>
                    )}
                  </p>
                  <p className="text-gray-800 font-semibold text-base mt-0.5 leading-snug">
                    {video.title}
                  </p>
                  {video.duration && (
                    <p className="text-xs text-gray-400 mt-1">{video.duration}</p>
                  )}

                  <div className="flex flex-wrap gap-3 mt-4">
                    <a
                      href={video.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-6 py-2.5 rounded-full shadow-[0_4px_14px_rgba(249,115,22,0.25)] transition-colors"
                    >
                      <Play size={13} fill="white" />
                      Play Video
                    </a>
                    <button
                      onClick={handleMarkComplete}
                      disabled={completedToday || markingComplete}
                      className={`inline-flex items-center gap-2 text-sm font-semibold px-6 py-2.5 rounded-full border transition-colors disabled:cursor-not-allowed ${
                        completedToday
                          ? "bg-green-50 border-green-400 text-green-600"
                          : "border-gray-200 text-gray-600 hover:border-orange-400 hover:text-orange-500"
                      }`}
                    >
                      <Check size={13} />
                      {completedToday
                        ? "Completed ✓"
                        : markingComplete
                        ? "Saving..."
                        : "Mark as Complete"}
                    </button>
                  </div>

                  {completedToday && (
                    <p className="text-xs text-gray-400 mt-3">
                      Great job! Your next video unlocks tomorrow.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════ */}
          {/* 🧘 SUGGESTION CARDS                                */}
          {/* ══════════════════════════════════════════════════ */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2">
              {suggestions.map((s, idx) => {
                const isActive = yogaType === s.id;
                return (
                  <div
                    key={s.id}
                    className={`flex flex-col items-center text-center px-8 py-8 ${
                      idx === 0
                        ? "border-b sm:border-b-0 sm:border-r border-orange-100"
                        : ""
                    }`}
                  >
                    {/* Tall portrait image — matches Figma */}
                    <div className="w-44 h-56 mb-5 rounded-2xl overflow-hidden shadow-sm">
                      <img
                        src={s.image}
                        alt={s.bold}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <p className="text-gray-400 text-sm">{s.label}</p>
                    <p className="text-gray-800 font-bold text-base mt-0.5">
                      {s.bold}
                    </p>
                    <button
                      onClick={() => handleSwitchQueue(s.id)}
                      className={`mt-4 text-sm font-semibold px-12 py-2.5 rounded-full transition-colors shadow-[0_4px_14px_rgba(249,115,22,0.25)] ${
                        isActive
                          ? "bg-green-500 hover:bg-green-600 text-white"
                          : "bg-orange-500 hover:bg-orange-600 text-white"
                      }`}
                    >
                      {isActive ? "✓ Active" : "Start"}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Back to Normal Yoga — only shown when on alt queue */}
            {yogaType !== "normal_yoga" && (
              <div className="text-center py-3 border-t border-gray-100">
                <button
                  onClick={() => handleSwitchQueue("normal_yoga")}
                  className="text-sm text-orange-500 hover:text-orange-600 font-medium hover:underline"
                >
                  ← Back to Normal Yoga
                </button>
              </div>
            )}
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