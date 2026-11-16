"use client";

import { useMemo, useState } from "react";
import {
  Calendar,
  Folder,
  X,
  ChevronDown,
  Cloud,
  Clock,
  Image as ImageIcon,
  Check,
  Minus,
  FileText,
  ShieldCheck,
  Download,
  Wind,
  Droplets,
  User,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useProject } from "@/contexts/project-context";
import { useDemo } from "@/contexts/demo-context";

export type ReportStatus = "signed" | "pending";

export type DailyReportItem = {
  id: string;
  projectId: string;
  projectName: string;
  clientName: string;
  timestamp: string;
  rawDate: string;
  status: ReportStatus;
  weather: {
    tempRange: string;
    temp: string;
    wind: string;
    condition: string;
  };
  delay?: {
    hours: number;
    label: string;
  };
  photoCount: number;
  preparedBy: string;
  superintendentTitle: string;
  description: string;
  acresToday?: number;
  crew: string[];
  equipment: string[];
  signatureStamp: string;
};

const INITIAL_REPORTS: DailyReportItem[] = [
  {
    id: "rep-everglades-today",
    projectId: "proj-everglades-solar",
    projectName: "Everglades Solar Corridor - Phase II",
    clientName: "Meridian Energy Partners, LLC",
    timestamp: "Today, 4:30 PM",
    rawDate: "2025-06-25T16:30:00Z",
    status: "signed",
    weather: {
      tempRange: "78°/59°F",
      temp: "78°F",
      wind: "4 mph SE (Optimal Drift Window)",
      condition: "Partly Cloudy",
    },
    photoCount: 2,
    preparedBy: "Carlos R. Fuentes",
    superintendentTitle: "Project Superintendent",
    description:
      "Daily wicking & mowing pass across solar corridor zones A & B (28 acres). Zero panel strikes logged. Tracker clearance verified above 14 inches.",
    acresToday: 28,
    crew: ["Carlos R. Fuentes (Superintendent)", "J. Davis (Operator)", "T. Green (Tech)"],
    equipment: ["John Deere 5075E with 20ft Wick'd Wicking Rig", "Support UTV"],
    signatureStamp: "Digitally certified by Carlos R. Fuentes on Jun 25, 2025 at 16:30 CST",
  },
  {
    id: "rep-suncoast-today",
    projectId: "proj-suncoast-row",
    projectName: "Suncoast Transmission ROW Clearing",
    clientName: "Meridian Energy Partners, LLC",
    timestamp: "Today, 3:15 PM",
    rawDate: "2025-06-25T15:15:00Z",
    status: "signed",
    weather: {
      tempRange: "70°/47°F",
      temp: "70°F",
      wind: "5 mph SW",
      condition: "Clear",
    },
    photoCount: 1,
    preparedBy: "Devon T. Marsh",
    superintendentTitle: "Lead Field Inspector",
    description:
      "Transmission easement right-of-way mechanical clearing. Low ground-pressure mulching mower deployed to protect underlying wetland root structures.",
    acresToday: 18,
    crew: ["Devon T. Marsh (Lead Inspector)", "R. Vance (Tech)"],
    equipment: ["Ventrac 4500 Dual-Wheel Slope Mower", "Stihl Brushcutters"],
    signatureStamp: "Digitally certified by Devon T. Marsh on Jun 25, 2025 at 15:15 CST",
  },
  {
    id: "rep-ocala-yesterday",
    projectId: "proj-ocala-substation",
    projectName: "Ocala Substation Vegetation Mgmt",
    clientName: "Meridian Energy Partners, LLC",
    timestamp: "Yesterday, 5:00 PM",
    rawDate: "2025-06-24T17:00:00Z",
    status: "signed",
    weather: {
      tempRange: "61°/42°F",
      temp: "61°F",
      wind: "3 mph Calm",
      condition: "Morning fog clearing to sun",
    },
    delay: {
      hours: 0.5,
      label: "0.5 Delay",
    },
    photoCount: 1,
    preparedBy: "Carlos R. Fuentes",
    superintendentTitle: "Project Superintendent",
    description:
      "Perimeter fence lines and switchyard gravel border treatment. 30-minute morning delay due to heavy dew on ground cover; work resumed once vegetation dried for optimal chemical absorption.",
    acresToday: 12,
    crew: ["Carlos R. Fuentes", "M. Evans"],
    equipment: ["Backpack Ultra-Low Volume Applicators", "Survey Rig"],
    signatureStamp: "Digitally certified by Carlos R. Fuentes on Jun 24, 2025 at 17:00 CST",
  },
  {
    id: "rep-tampa-yesterday",
    projectId: "proj-tampa-electric-row",
    projectName: "Tampa Electric Grid Resiliency Right-of-Way",
    clientName: "Meridian Energy Partners, LLC",
    timestamp: "Yesterday, 4:45 PM",
    rawDate: "2025-06-24T16:45:00Z",
    status: "pending",
    weather: {
      tempRange: "64°/49°F",
      temp: "64°F",
      wind: "7 mph W",
      condition: "Overcast",
    },
    photoCount: 1,
    preparedBy: "Devon T. Marsh",
    superintendentTitle: "Lead Field Inspector",
    description:
      "Right-of-way mechanical clearing across Sector 3. Daily report logged and submitted by field operator; awaiting evening superintendent countersignature.",
    acresToday: 22,
    crew: ["Devon T. Marsh", "A. Coleman", "S. Wright"],
    equipment: ["Fecon Bull Hog Forestry Mulcher", "Toro Groundsmaster"],
    signatureStamp: "Pending secondary client superintendent countersignature",
  },
  {
    id: "rep-everglades-2days",
    projectId: "proj-everglades-solar",
    projectName: "Everglades Solar Corridor - Phase II",
    clientName: "Meridian Energy Partners, LLC",
    timestamp: "2 days ago",
    rawDate: "2025-06-23T16:00:00Z",
    status: "signed",
    weather: {
      tempRange: "76°/58°F",
      temp: "76°F",
      wind: "6 mph E",
      condition: "Scattered Clouds",
    },
    photoCount: 3,
    preparedBy: "Carlos R. Fuentes",
    superintendentTitle: "Project Superintendent",
    description:
      "Post-storm drainage basin survey and sediment trap check. Foundation piles secure; zero silt encroachment onto inverter pads.",
    acresToday: 0,
    crew: ["Carlos R. Fuentes"],
    equipment: ["Drone Aerial Survey Rig", "Support UTV"],
    signatureStamp: "Digitally certified by Carlos R. Fuentes on Jun 23, 2025 at 16:00 CST",
  },
  {
    id: "rep-sunridge-3days",
    projectId: "proj-sunridge-phase-2",
    projectName: "Sunridge Solar Farm — Phase II",
    clientName: "Meridian Energy Partners, LLC",
    timestamp: "3 days ago",
    rawDate: "2025-06-22T17:30:00Z",
    status: "signed",
    weather: {
      tempRange: "82°/64°F",
      temp: "82°F",
      wind: "4 mph SE",
      condition: "Sunny",
    },
    photoCount: 4,
    preparedBy: "Carlos R. Fuentes",
    superintendentTitle: "Project Superintendent",
    description:
      "Weekly comprehensive progress inspection. 142 cumulative acres maintained for contract cycle WET-2024-0147.",
    acresToday: 35,
    crew: ["Carlos R. Fuentes", "J. Davis", "T. Green", "Devon T. Marsh"],
    equipment: ["Full Wick'd Field Fleet Staging"],
    signatureStamp: "Digitally certified by Carlos R. Fuentes on Jun 22, 2025 at 17:30 CST",
  },
];

const DATE_OPTIONS = [
  "Last 7 Days",
  "Last 30 Days",
  "Last 90 Days",
  "This Month",
  "All Time",
] as const;

export function ReportsScreen() {
  const { projects } = useProject();
  const { sim } = useDemo();

  const [dateFilter, setDateFilter] = useState<string>("Last 30 Days");
  const [selectedProject, setSelectedProject] = useState<string>("All Projects");

  const [dateDropdownOpen, setDateDropdownOpen] = useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [modalReport, setModalReport] = useState<DailyReportItem | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Derive unique project list
  const projectOptions = useMemo(() => {
    const fromReports = Array.from(new Set(INITIAL_REPORTS.map((r) => r.projectName)));
    const fromContext = projects.map((p) => p.name);
    return ["All Projects", ...Array.from(new Set([...fromReports, ...fromContext]))];
  }, [projects]);

  // Filter reports (scoped to client's projects)
  const filteredReports = useMemo(() => {
    return INITIAL_REPORTS.filter((rep) => {
      const matchesProject =
        selectedProject === "All Projects" || rep.projectName === selectedProject;
      return matchesProject;
    });
  }, [selectedProject]);

  function handleResetFilters() {
    setDateFilter("Last 30 Days");
    setSelectedProject("All Projects");
    setDateDropdownOpen(false);
    setProjectDropdownOpen(false);
  }

  // The guided tour can expand the first report, open its PDF, and download it.
  const effectiveExpandedId =
    sim.reportExpanded && filteredReports[0] ? filteredReports[0].id : expandedId;

  const effectiveModalReport =
    sim.reportModal ? (modalReport ?? filteredReports[0] ?? null) : modalReport;

  const isDownloaded = downloadSuccess || sim.reportDownloaded;

  function handleDownload(report: DailyReportItem) {
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  }

  return (
    <div className="pt-6 pb-28 lg:pb-12 max-w-5xl mx-auto px-4 sm:px-6">
      {/* Main Title & Subtitle */}
      <div className="mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Reports</h1>
        <p className="text-xs sm:text-sm text-white/40 mt-1 font-medium">
          Daily signed project logs · {filteredReports.length} report{filteredReports.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="mb-6 flex items-center gap-2.5 flex-wrap">
        {/* Date Filter Pill (Orange Border / Accent) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setDateDropdownOpen((v) => !v);
              setProjectDropdownOpen(false);
            }}
            className="flex items-center gap-2 rounded-xl border border-[#FF6633] bg-[#FF6633]/10 hover:bg-[#FF6633]/15 text-[#FF6633] px-3.5 py-2 text-xs font-semibold transition-all shadow-sm"
          >
            <Calendar size={13} className="text-[#FF6633]" />
            <span>{dateFilter}</span>
            <ChevronDown size={12} className={`transition-transform duration-200 ${dateDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {dateDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDateDropdownOpen(false)} />
              <div className="absolute left-0 top-full mt-1.5 z-50 w-44 bg-[#141414] border border-white/12 rounded-xl shadow-2xl py-1 divide-y divide-white/5">
                {DATE_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setDateFilter(opt);
                      setDateDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs transition-colors ${
                      dateFilter === opt
                        ? "text-[#FF6633] font-bold bg-[#FF6633]/10"
                        : "text-white/70 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Project Filter Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setProjectDropdownOpen((v) => !v);
              setDateDropdownOpen(false);
            }}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#141414] hover:bg-white/5 hover:border-white/20 text-white/80 px-3.5 py-2 text-xs font-medium transition-all"
          >
            <Folder size={13} className="text-white/40" />
            <span className="truncate max-w-[140px] sm:max-w-[200px]">{selectedProject}</span>
            <ChevronDown size={12} className={`text-white/40 transition-transform duration-200 ${projectDropdownOpen ? "rotate-180" : ""}`} />
          </button>

          {projectDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setProjectDropdownOpen(false)} />
              <div className="absolute left-0 top-full mt-1.5 z-50 w-64 bg-[#141414] border border-white/12 rounded-xl shadow-2xl py-1 divide-y divide-white/5 max-h-60 overflow-y-auto">
                {projectOptions.map((proj) => (
                  <button
                    key={proj}
                    type="button"
                    onClick={() => {
                      setSelectedProject(proj);
                      setProjectDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs transition-colors truncate ${
                      selectedProject === proj
                        ? "text-[#FF6633] font-bold bg-[#FF6633]/10"
                        : "text-white/70 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {proj}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Clear Filter Action */}
        {(selectedProject !== "All Projects" || dateFilter !== "Last 30 Days") && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-xs text-white/40 hover:text-white/80 px-2.5 py-2 font-medium transition-colors"
          >
            <X size={12} />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Reports Card List matching screenshot */}
      <div className="space-y-3.5" data-demo="reports-list">
        {filteredReports.map((report, index) => {
          const isExpanded = (effectiveExpandedId ?? expandedId) === report.id;
          const isSigned = report.status === "signed";

          return (
            <div
              key={report.id}
              data-demo={index === 0 ? "reports-first-card" : undefined}
              className="bg-[#141414]/90 hover:bg-[#141414] border border-white/8 hover:border-white/16 rounded-2xl p-4 sm:p-5 transition-all duration-200 group shadow-lg shadow-black/40"
            >
              {/* Card Main Row */}
              <div className="flex items-start gap-4">
                {/* PDF Document Icon with Attached Status Badge */}
                <div
                  className="relative flex-shrink-0 cursor-pointer pt-0.5"
                  onClick={() => setModalReport(report)}
                  title="View PDF Document"
                >
                  <div className="w-12 h-14 rounded-xl bg-white/4 border border-white/10 flex flex-col items-center justify-between p-1.5 transition-colors group-hover:border-white/20">
                    <div className="w-7 h-9 rounded-[4px] border border-white/30 bg-white/5 flex flex-col items-center justify-between py-1 relative overflow-hidden">
                      {/* Folded Corner */}
                      <div className="absolute top-0 right-0 w-2 h-2 bg-[#141414] border-b border-l border-white/30 rounded-bl-[2px]" />
                      <span className="text-[7.5px] font-mono font-bold tracking-tighter text-red-400 mt-1">
                        PDF
                      </span>
                      <div className="w-4 h-[1.5px] bg-white/20 rounded-full" />
                      <div className="w-3 h-[1.5px] bg-white/20 rounded-full mb-0.5" />
                    </div>
                  </div>

                  {/* Status Circle Badge (Green Checkmark or Yellow Minus) */}
                  <div
                    className={`absolute -bottom-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#141414] shadow-md ${
                      isSigned ? "bg-[#34C759] text-white" : "bg-[#FF9500] text-black"
                    }`}
                  >
                    {isSigned ? (
                      <Check size={11} strokeWidth={3} />
                    ) : (
                      <Minus size={11} strokeWidth={3} />
                    )}
                  </div>
                </div>

                {/* Card Title & Content */}
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => setExpandedId((cur) => (cur === report.id ? null : report.id))}
                >
                  <h3 className="text-sm sm:text-base font-bold text-white leading-snug group-hover:text-[#FF6633] transition-colors truncate">
                    Daily Report for {report.projectName}
                  </h3>
                  <p className="text-[11px] text-white/40 font-mono mt-0.5 truncate">
                    {report.timestamp}
                  </p>

                  {/* Metadata Chips Row: Weather, Delay, Photos */}
                  <div className="flex items-center gap-2 mt-2.5 flex-wrap">
                    {/* Weather Pill */}
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/8 text-xs text-white/70 font-medium">
                      <Cloud size={12} className="text-sky-400" />
                      <span>{report.weather.tempRange}</span>
                    </span>

                    {/* Delay Pill (if present) */}
                    {report.delay && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FF9500]/15 border border-[#FF9500]/30 text-xs text-[#FF9500] font-semibold">
                        <Clock size={11} />
                        <span>{report.delay.label}</span>
                      </span>
                    )}

                    {/* Photos Count Pill */}
                    {report.photoCount > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/8 text-xs text-white/45">
                        <ImageIcon size={11} className="text-white/30" />
                        <span>
                          {report.photoCount} photo{report.photoCount !== 1 ? "s" : ""}
                        </span>
                      </span>
                    )}

                    {/* Acres Completed (Bonus Solar Metric) */}
                    {(report.acresToday ?? 0) > 0 && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#FF6633]/10 border border-[#FF6633]/20 text-[10px] text-[#FF6633] font-mono font-medium">
                        +{report.acresToday} acres
                      </span>
                    )}
                  </div>
                </div>

                {/* Right Actions: Red PDF Icon + Expand Chevron */}
                <div className="flex items-center gap-2.5 flex-shrink-0 pt-1">
                  <button
                    type="button"
                    data-demo={index === 0 ? "report-view-btn" : undefined}
                    onClick={(e) => {
                      e.stopPropagation();
                      setModalReport(report);
                    }}
                    title="View PDF Report"
                    className="w-8 h-8 rounded-lg bg-white/4 hover:bg-white/10 flex items-center justify-center text-[#FF4D4D] hover:scale-105 transition-transform"
                  >
                    <FileText size={17} />
                  </button>

                  <button
                    type="button"
                    data-demo={index === 0 ? "report-expand-btn" : undefined}
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedId((cur) => (cur === report.id ? null : report.id));
                    }}
                    title={isExpanded ? "Collapse Details" : "Expand Details"}
                    className="w-8 h-8 rounded-lg bg-white/4 hover:bg-white/10 flex items-center justify-center text-white/30 hover:text-white/70 transition-colors"
                  >
                    <ChevronDown
                      size={17}
                      className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>
              </div>

              {/* Accordion Expanded Details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 pt-4 border-t border-white/8 space-y-4 text-xs">
                      {/* Summary Notes */}
                      <div className="bg-white/3 rounded-xl p-3.5 border border-white/6">
                        <div className="flex items-center gap-1.5 text-white/40 font-semibold uppercase tracking-wider text-[10px] mb-1">
                          <User size={12} className="text-[#FF6633]" />
                          <span>Prepared by {report.preparedBy} ({report.superintendentTitle})</span>
                        </div>
                        <p className="text-white/80 leading-relaxed text-sm">
                          {report.description}
                        </p>
                      </div>

                      {/* Environmental & Weather Readings */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-white/3 rounded-xl p-3 border border-white/6">
                          <div className="flex items-center gap-1.5 text-white/40 mb-1">
                            <Wind size={12} className="text-[#FF6633]" />
                            <span className="font-semibold uppercase tracking-wider text-[10px]">Wind Velocity & Dispersion</span>
                          </div>
                          <p className="text-white/90 font-medium">{report.weather.wind}</p>
                          <p className="text-white/40 text-[10px] mt-0.5">{report.weather.condition}</p>
                        </div>

                        <div className="bg-white/3 rounded-xl p-3 border border-white/6">
                          <div className="flex items-center gap-1.5 text-white/40 mb-1">
                            <Droplets size={12} className="text-[#34C759]" />
                            <span className="font-semibold uppercase tracking-wider text-[10px]">Temperature & Compliance</span>
                          </div>
                          <p className="text-white/90 font-medium">{report.weather.temp}</p>
                          <p className="text-white/40 text-[10px] mt-0.5">Compliant with zero-drift state guidelines</p>
                        </div>
                      </div>

                      {/* Personnel & Machinery */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1.5">
                            On-Site Field Crew
                          </p>
                          <ul className="space-y-1">
                            {report.crew.map((member, i) => (
                              <li key={i} className="text-white/70 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#FF6633]" />
                                <span>{member}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1.5">
                            Machinery Deployed
                          </p>
                          <ul className="space-y-1">
                            {report.equipment.map((eq, i) => (
                              <li key={i} className="text-white/70 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-white/20" />
                                <span>{eq}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Digital Certification Stamp */}
                      <div
                        className={`rounded-xl p-3 flex items-start gap-2.5 border ${
                          isSigned
                            ? "bg-[#34C759]/10 border-[#34C759]/25 text-[#34C759]"
                            : "bg-[#FF9500]/10 border-[#FF9500]/25 text-[#FF9500]"
                        }`}
                      >
                        <ShieldCheck size={16} className="flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-xs">
                            {isSigned ? "Digitally Certified Field Record" : "Awaiting Final Superintendent Signature"}
                          </p>
                          <p className="text-[11px] font-mono mt-0.5 opacity-90">
                            {report.signatureStamp}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => setModalReport(report)}
                          className="px-4 py-2.5 rounded-xl bg-[#FF6633] hover:bg-[#FF7A4D] text-white font-bold text-xs transition-colors flex items-center gap-2"
                        >
                          <FileText size={14} />
                          <span>View Official PDF Document</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDownload(report)}
                          className="px-4 py-2.5 rounded-xl bg-white/6 hover:bg-white/10 border border-white/10 text-white/80 font-semibold text-xs transition-colors flex items-center gap-2"
                        >
                          <Download size={14} />
                          <span>{downloadSuccess ? "Downloaded PDF ✓" : "Download PDF"}</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {filteredReports.length === 0 && (
          <div className="bg-[#141414] border border-white/8 rounded-2xl p-12 text-center">
            <FileText size={32} className="mx-auto text-white/20 mb-3" />
            <p className="text-sm font-semibold text-white/80">No reports match your filters</p>
            <p className="text-xs text-white/40 mt-1 mb-4">Try clearing the project or client filter</p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-[#FF6633] text-white text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Official PDF Document Modal */}
      {effectiveModalReport && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setModalReport(null)}
        >
          <div
            data-demo="report-modal"
            className="bg-[#141414] border border-white/14 rounded-2xl max-w-xl w-full max-h-[88vh] overflow-y-auto p-6 sm:p-7 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/8 pb-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FF6633]/15 border border-[#FF6633]/30 flex items-center justify-center text-[#FF6633] flex-shrink-0">
                  <FileText size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF6633]">
                    Official Field Report
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-white mt-0.5 leading-snug">
                    {effectiveModalReport.projectName}
                  </h2>
                  <p className="text-xs text-white/40 font-mono mt-0.5">
                    {effectiveModalReport.timestamp} · {effectiveModalReport.clientName}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalReport(null)}
                className="w-8 h-8 rounded-full bg-white/6 hover:bg-white/12 flex items-center justify-center text-white/60 hover:text-white transition-colors flex-shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            {/* Scope Summary */}
            <div className="bg-white/4 rounded-xl p-4 border border-white/6 space-y-1.5">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#FF6633]">
                Work Performed & Summary
              </p>
              <p className="text-sm text-white/85 leading-relaxed">
                {effectiveModalReport.description}
              </p>
            </div>

            {/* Weather & Conditions Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white/4 rounded-xl p-3 border border-white/6">
                <div className="flex items-center gap-1.5 text-xs text-white/40 mb-1">
                  <Wind size={13} className="text-[#FF6633]" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Wind & Dispersion</span>
                </div>
                <p className="text-sm font-semibold text-white/90">{effectiveModalReport.weather.wind}</p>
                <p className="text-[10px] text-white/40">{effectiveModalReport.weather.condition}</p>
              </div>

              <div className="bg-white/4 rounded-xl p-3 border border-white/6">
                <div className="flex items-center gap-1.5 text-xs text-white/40 mb-1">
                  <Droplets size={13} className="text-[#34C759]" />
                  <span className="text-[10px] uppercase font-bold tracking-wider">Temperature & Limits</span>
                </div>
                <p className="text-sm font-semibold text-white/90">{effectiveModalReport.weather.temp}</p>
                <p className="text-[10px] text-white/40">Within safe application thresholds</p>
              </div>
            </div>

            {/* Personnel & Machinery */}
            <div className="space-y-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1.5">
                  Field Personnel on Site
                </p>
                <ul className="space-y-1">
                  {effectiveModalReport.crew.map((member, i) => (
                    <li key={i} className="text-xs text-white/70 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF6633]" />
                      <span>{member}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1.5">
                  Equipment Deployed
                </p>
                <ul className="space-y-1">
                  {effectiveModalReport.equipment.map((eq, i) => (
                    <li key={i} className="text-xs text-white/70 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
                      <span>{eq}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Digital Signature */}
            <div
              className={`rounded-xl p-3.5 flex items-start gap-3 border ${
                effectiveModalReport.status === "signed"
                  ? "bg-[#34C759]/10 border-[#34C759]/25"
                  : "bg-[#FF9500]/10 border-[#FF9500]/25"
              }`}
            >
              <ShieldCheck
                size={18}
                className={effectiveModalReport.status === "signed" ? "text-[#34C759] flex-shrink-0 mt-0.5" : "text-[#FF9500] flex-shrink-0 mt-0.5"}
              />
              <div>
                <p
                  className={`text-xs font-bold ${
                    effectiveModalReport.status === "signed" ? "text-[#34C759]" : "text-[#FF9500]"
                  }`}
                >
                  {effectiveModalReport.status === "signed"
                    ? "Digitally Verified Field Record"
                    : "Pending Final Counter-Signature"}
                </p>
                <p
                  className={`text-[11px] font-mono mt-0.5 leading-snug ${
                    effectiveModalReport.status === "signed" ? "text-[#34C759]/90" : "text-[#FF9500]/90"
                  }`}
                >
                  {effectiveModalReport.signatureStamp}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2 flex gap-3">
              <button
                type="button"
                data-demo="report-download-btn"
                onClick={() => handleDownload(effectiveModalReport)}
                className="flex-1 bg-[#FF6633] hover:bg-[#FF7A4D] text-white font-bold rounded-xl py-3 px-4 text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#FF6633]/20"
              >
                <Download size={14} />
                <span>{isDownloaded ? "Downloaded Official PDF ✓" : "Download Official PDF"}</span>
              </button>
              <button
                type="button"
                onClick={() => setModalReport(null)}
                className="px-5 py-3 bg-white/6 hover:bg-white/10 border border-white/8 text-white/70 rounded-xl text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
