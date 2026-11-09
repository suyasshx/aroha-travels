"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Inbox,
  Search,
  Filter,
  Clock,
  Sparkles,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Send,
  MessageSquare,
  ChevronRight,
  ExternalLink,
  Edit2,
  Save,
  X,
  FileText,
} from "lucide-react";
import { EnquiryStatus } from "@prisma/client";

interface AIExtraction {
  id: string;
  extractedData: {
    destination: string;
    adults: number;
    children: number;
    duration: string;
    travel_month: string;
    budget: number | null;
    special_requirements: string[];
    confidence: number;
  };
  confidence: number;
  recommendations: Array<{
    packageId: string;
    packageCode: string;
    title: string;
    slug: string;
    matchScore: number;
    seasonMatched: string;
    pricePerPerson: number;
    estimatedTotal: number;
    reason: string;
  }>;
  replyDraft: string;
  approved: boolean;
  provider: string;
}

interface EnquiryNote {
  id: string;
  authorName: string;
  note: string;
  createdAt: string;
}

interface EnquiryItem {
  id: string;
  enquiryNumber: string;
  customerName: string;
  email: string;
  phone: string;
  destination: string;
  travelStartDate: string | null;
  travelEndDate: string | null;
  duration: string | null;
  adults: number;
  children: number;
  budget: number | null;
  specialRequirements: string | null;
  originalMessage: string;
  preferredContactMethod: string;
  whatsappConsent: boolean;
  status: EnquiryStatus;
  priority: string;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
  aiExtraction: AIExtraction | null;
  notes: EnquiryNote[];
}

export default function EnquiryInboxClient({
  initialEnquiries,
  initialSelectedId,
}: {
  initialEnquiries: EnquiryItem[];
  initialSelectedId?: string;
}) {
  const router = useRouter();
  const [enquiries, setEnquiries] = useState<EnquiryItem[]>(initialEnquiries);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState<string>(
    initialSelectedId || initialEnquiries[0]?.id || ""
  );

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Detail Action States
  const [updating, setUpdating] = useState(false);
  const [newNoteText, setNewNoteText] = useState("");
  const [submittingNote, setSubmittingNote] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState(false);
  const [regeneratingAI, setRegeneratingAI] = useState(false);

  // Editable Extracted Fields State
  const [isEditingExtracted, setIsEditingExtracted] = useState(false);
  const [editFormData, setEditFormData] = useState<any>({});

  // Active selected enquiry object
  const selectedEnquiry = enquiries.find((e) => e.id === selectedEnquiryId) || enquiries[0];

  // Helper for human-readable elapsed response time
  const getElapsedTime = (createdDate: string) => {
    const diffMs = Date.now() - new Date(createdDate).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays}d ${diffHours % 24}h elapsed`;
    if (diffHours > 0) return `${diffHours}h ${diffMins % 60}m elapsed`;
    return `${Math.max(1, diffMins)}m elapsed`;
  };

  // Filtered List
  const filteredEnquiries = enquiries.filter((enq) => {
    if (statusFilter !== "ALL" && enq.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const text = (
        enq.customerName +
        " " +
        enq.enquiryNumber +
        " " +
        enq.phone +
        " " +
        enq.email +
        " " +
        enq.destination
      ).toLowerCase();
      if (!text.includes(q)) return false;
    }
    return true;
  });

  // Handle Status Update
  const updateStatus = async (newStatus: EnquiryStatus) => {
    if (!selectedEnquiry) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/enquiries/${selectedEnquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setEnquiries((prev) =>
          prev.map((e) => (e.id === selectedEnquiry.id ? data.enquiry : e))
        );
        router.refresh();
      }
    } catch {
      alert("Failed to update status");
    } finally {
      setUpdating(false);
    }
  };

  // Handle Assignee Update
  const updateAssignee = async (newAssignee: string) => {
    if (!selectedEnquiry) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/enquiries/${selectedEnquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedTo: newAssignee || null }),
      });
      const data = await res.json();
      if (data.success) {
        setEnquiries((prev) =>
          prev.map((e) => (e.id === selectedEnquiry.id ? data.enquiry : e))
        );
        router.refresh();
      }
    } catch {
      alert("Failed to update assigned consultant");
    } finally {
      setUpdating(false);
    }
  };

  // Handle Add Note
  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiry || !newNoteText.trim()) return;
    setSubmittingNote(true);
    try {
      const res = await fetch(`/api/enquiries/${selectedEnquiry.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: newNoteText.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setEnquiries((prev) =>
          prev.map((e) =>
            e.id === selectedEnquiry.id
              ? { ...e, notes: [data.note, ...e.notes] }
              : e
          )
        );
        setNewNoteText("");
        router.refresh();
      }
    } catch {
      alert("Failed to save note");
    } finally {
      setSubmittingNote(false);
    }
  };

  // Handle Regenerate AI
  const handleRegenerateAI = async () => {
    if (!selectedEnquiry) return;
    setRegeneratingAI(true);
    try {
      const res = await fetch(`/api/enquiries/${selectedEnquiry.id}/regenerate-ai`, {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        setEnquiries((prev) =>
          prev.map((e) =>
            e.id === selectedEnquiry.id
              ? { ...e, aiExtraction: data.aiExtraction }
              : e
          )
        );
        router.refresh();
      } else {
        alert(data.error || "Failed to regenerate AI analysis");
      }
    } catch {
      alert("Network error");
    } finally {
      setRegeneratingAI(false);
    }
  };

  // Handle Save Extracted Data Edits & Approval
  const handleSaveExtractedEdits = async () => {
    if (!selectedEnquiry) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/enquiries/${selectedEnquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          editedExtractedData: {
            ...selectedEnquiry.aiExtraction?.extractedData,
            ...editFormData,
          },
          aiExtractionApproved: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setEnquiries((prev) =>
          prev.map((e) => (e.id === selectedEnquiry.id ? data.enquiry : e))
        );
        setIsEditingExtracted(false);
        router.refresh();
      }
    } catch {
      alert("Failed to save edited AI fields");
    } finally {
      setUpdating(false);
    }
  };

  // Toggle AI Approval
  const toggleAIApproval = async () => {
    if (!selectedEnquiry || !selectedEnquiry.aiExtraction) return;
    const currentApproved = selectedEnquiry.aiExtraction.approved;
    setUpdating(true);
    try {
      const res = await fetch(`/api/enquiries/${selectedEnquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aiExtractionApproved: !currentApproved }),
      });
      const data = await res.json();
      if (data.success) {
        setEnquiries((prev) =>
          prev.map((e) => (e.id === selectedEnquiry.id ? data.enquiry : e))
        );
        router.refresh();
      }
    } catch {
      alert("Failed to update approval status");
    } finally {
      setUpdating(false);
    }
  };

  // Copy reply draft to clipboard
  const handleCopyDraft = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDraft(true);
    setTimeout(() => setCopiedDraft(false), 2000);
  };

  const getStatusBadge = (status: EnquiryStatus) => {
    switch (status) {
      case EnquiryStatus.NEW:
        return "bg-amber-100 text-amber-900 border-amber-300";
      case EnquiryStatus.CONTACTED:
        return "bg-blue-100 text-blue-900 border-blue-300";
      case EnquiryStatus.QUALIFIED:
        return "bg-purple-100 text-purple-900 border-purple-300";
      case EnquiryStatus.QUOTATION_SENT:
        return "bg-indigo-100 text-indigo-900 border-indigo-300";
      case EnquiryStatus.CONVERTED:
        return "bg-emerald-100 text-emerald-900 border-emerald-300";
      case EnquiryStatus.LOST:
        return "bg-gray-100 text-gray-700 border-gray-300";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-[#6a7d61] block mb-1">
            Enquiry CRM & Reservations Desk
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#173D32]">
            Enquiry Inbox & AI Assistant
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-white px-3 py-1.5 rounded-full border border-[#E9E1D5] font-mono text-[#173D32]">
            Total Inbound: <strong>{enquiries.length}</strong>
          </span>
        </div>
      </div>

      {/* CRM Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[750px]">
        {/* LEFT COLUMN: ENQUIRY LIST (5 cols) */}
        <div className="lg:col-span-5 flex flex-col bg-white border border-[#E9E1D5] rounded-3xl p-4 sm:p-5 shadow-sm space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#6a7d61] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search enquiries by name, phone, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-[#E9E1D5] bg-[#FAF9F6] text-xs text-[#252925] focus:outline-none focus:ring-2 focus:ring-[#173D32]/30"
            />
          </div>

          {/* Status Filter Horizontal Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {[
              { id: "ALL", label: "All" },
              { id: "NEW", label: "New" },
              { id: "CONTACTED", label: "Contacted" },
              { id: "QUALIFIED", label: "Qualified" },
              { id: "QUOTATION_SENT", label: "Quote Sent" },
              { id: "CONVERTED", label: "Converted" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1 rounded-full whitespace-nowrap font-semibold transition-colors ${
                  statusFilter === tab.id
                    ? "bg-[#173D32] text-[#FAF9F6]"
                    : "bg-[#FAF9F6] text-[#252925] hover:bg-[#E9E1D5]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Scrollable Enquiry List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[680px] pr-1">
            {filteredEnquiries.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#6a7d61]">
                No enquiries match your search filter.
              </div>
            ) : (
              filteredEnquiries.map((enq) => {
                const isSelected = enq.id === selectedEnquiry?.id;
                return (
                  <div
                    key={enq.id}
                    onClick={() => {
                      setSelectedEnquiryId(enq.id);
                      setIsEditingExtracted(false);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#FAF9F6] border-[#173D32] shadow-sm"
                        : "bg-white border-[#E9E1D5] hover:border-[#A9B8A2]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-xs font-bold text-[#173D32]">
                        {enq.enquiryNumber}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${getStatusBadge(
                          enq.status
                        )}`}
                      >
                        {enq.status}
                      </span>
                    </div>

                    <h4 className="font-serif font-bold text-sm text-[#252925] mb-1">
                      {enq.customerName}
                    </h4>

                    <p className="text-xs text-[#6a7d61] line-clamp-1 mb-2">
                      📍 {enq.destination} • {enq.adults} Adults {enq.children > 0 && `+ ${enq.children} Kids`}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-[#E9E1D5]/60 text-[11px]">
                      <span className="text-[#6a7d61] font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-[#173D32]" />
                        {getElapsedTime(enq.createdAt)}
                      </span>

                      {enq.aiExtraction && (
                        <span className="text-[#173D32] font-semibold flex items-center gap-1 bg-[#173D32]/10 px-2 py-0.5 rounded-full text-[10px]">
                          <Sparkles className="w-2.5 h-2.5 text-[#C5A059]" />
                          <span>AI Ready</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: ENQUIRY DETAIL & AI ASSISTANT PANEL (7 cols) */}
        {selectedEnquiry ? (
          <div className="lg:col-span-7 bg-white border border-[#E9E1D5] rounded-3xl p-6 sm:p-8 shadow-sm space-y-8 overflow-y-auto max-h-[820px]">
            {/* Header: Identity, Elapsed Time, Status Changer */}
            <div className="space-y-4 pb-6 border-b border-[#E9E1D5]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs font-bold text-[#173D32] bg-[#FAF9F6] px-2 py-0.5 rounded border border-[#E9E1D5]">
                      {selectedEnquiry.enquiryNumber}
                    </span>
                    <span className="text-xs text-[#6a7d61] font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {getElapsedTime(selectedEnquiry.createdAt)}
                    </span>
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-[#173D32]">
                    {selectedEnquiry.customerName}
                  </h2>
                </div>

                {/* Status Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-[#6a7d61]">Status:</span>
                  <select
                    value={selectedEnquiry.status}
                    disabled={updating}
                    onChange={(e) => updateStatus(e.target.value as EnquiryStatus)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-full border cursor-pointer focus:outline-none ${getStatusBadge(
                      selectedEnquiry.status
                    )}`}
                  >
                    <option value="NEW">NEW</option>
                    <option value="CONTACTED">CONTACTED</option>
                    <option value="QUALIFIED">QUALIFIED</option>
                    <option value="QUOTATION_SENT">QUOTATION_SENT</option>
                    <option value="CONVERTED">CONVERTED</option>
                    <option value="LOST">LOST</option>
                  </select>
                </div>
              </div>

              {/* Contact & Assignment Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#FAF9F6] rounded-2xl p-4 border border-[#E9E1D5] text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#6a7d61] block mb-0.5">Contact</span>
                  <p className="font-medium text-[#252925] truncate">✉️ {selectedEnquiry.email}</p>
                  <p className="font-medium text-[#252925] mt-0.5">📞 {selectedEnquiry.phone}</p>
                  {selectedEnquiry.whatsappConsent && (
                    <span className="inline-block mt-1 text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-semibold">
                      WhatsApp Consent Granted
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-[#6a7d61] block mb-0.5">Trip Scope</span>
                  <p className="font-medium text-[#252925]">📍 {selectedEnquiry.destination}</p>
                  <p className="font-medium text-[#252925] mt-0.5">
                    👥 {selectedEnquiry.adults} Adults {selectedEnquiry.children > 0 && `+ ${selectedEnquiry.children} Kids`}
                  </p>
                  {selectedEnquiry.budget && (
                    <p className="font-mono font-bold text-[#173D32] mt-0.5">
                      ₹{selectedEnquiry.budget.toLocaleString("en-IN")} Target
                    </p>
                  )}
                </div>

                <div>
                  <span className="text-[10px] uppercase font-bold text-[#6a7d61] block mb-0.5">Assigned Consultant</span>
                  <select
                    value={selectedEnquiry.assignedTo || ""}
                    disabled={updating}
                    onChange={(e) => updateAssignee(e.target.value)}
                    className="w-full mt-1 px-2.5 py-1.5 rounded-lg border border-[#E9E1D5] bg-white text-xs font-semibold text-[#173D32] focus:outline-none"
                  >
                    <option value="">Unassigned</option>
                    <option value="Kavya Menon">Kavya Menon (Kerala Specialist)</option>
                    <option value="Aroha Operations Admin">Aroha Operations Admin</option>
                  </select>
                </div>
              </div>
            </div>

            {/* ORIGINAL CUSTOMER MESSAGE */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6a7d61] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Original Enquiry Message
              </span>
              <div className="bg-[#FAF9F6] border border-[#E9E1D5] rounded-2xl p-4 text-xs sm:text-sm text-[#252925] leading-relaxed italic">
                &ldquo;{selectedEnquiry.originalMessage}&rdquo;
              </div>
            </div>

            {/* AI ENQUIRY ASSISTANT PANEL */}
            <div className="border border-[#173D32]/20 bg-[#FAF9F6] rounded-3xl p-6 space-y-6">
              {/* Header with provider badge and confidence */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E9E1D5]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#173D32] text-[#FAF9F6] flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-[#C5A059]" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#173D32] flex items-center gap-2">
                      <span>AI Enquiry Intelligence</span>
                      {selectedEnquiry.aiExtraction?.approved ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                          Staff Approved
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold border border-amber-300">
                          Awaiting Approval
                        </span>
                      )}
                    </h3>
                    <span className="text-[10px] text-[#6a7d61] font-mono">
                      Engine: {selectedEnquiry.aiExtraction?.provider || "rule-based-fallback"} • Confidence: {Math.round((selectedEnquiry.aiExtraction?.confidence || 0.9) * 100)}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRegenerateAI}
                    disabled={regeneratingAI}
                    className="p-1.5 text-xs text-[#173D32] hover:bg-[#E9E1D5] rounded-lg transition-colors flex items-center gap-1 border border-[#E9E1D5] bg-white cursor-pointer"
                    title="Rerun AI extraction on message"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${regeneratingAI ? "animate-spin" : ""}`} />
                    <span className="hidden sm:inline">Re-Extract</span>
                  </button>

                  <button
                    onClick={toggleAIApproval}
                    disabled={updating}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                      selectedEnquiry.aiExtraction?.approved
                        ? "bg-emerald-700 text-white hover:bg-emerald-800"
                        : "bg-[#173D32] text-[#FAF9F6] hover:bg-[#215143]"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{selectedEnquiry.aiExtraction?.approved ? "Approved" : "Approve AI"}</span>
                  </button>
                </div>
              </div>

              {/* Extracted Structured Entities */}
              {selectedEnquiry.aiExtraction?.extractedData ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#6a7d61]">
                      Extracted Traveller Parameters
                    </span>
                    {!isEditingExtracted ? (
                      <button
                        onClick={() => {
                          setIsEditingExtracted(true);
                          setEditFormData(selectedEnquiry.aiExtraction!.extractedData);
                        }}
                        className="text-xs font-semibold text-[#173D32] hover:underline flex items-center gap-1"
                      >
                        <Edit2 className="w-3 h-3" />
                        <span>Edit Values</span>
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleSaveExtractedEdits}
                          disabled={updating}
                          className="text-xs bg-[#173D32] text-white px-2.5 py-1 rounded-full flex items-center gap-1"
                        >
                          <Save className="w-3 h-3" />
                          <span>Save & Approve</span>
                        </button>
                        <button
                          onClick={() => setIsEditingExtracted(false)}
                          className="text-xs text-gray-600 hover:text-black"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>

                  {!isEditingExtracted ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white rounded-2xl p-4 border border-[#E9E1D5] text-xs">
                      <div>
                        <span className="text-[10px] text-[#6a7d61] block font-semibold">Destination</span>
                        <span className="font-bold text-[#173D32]">
                          {selectedEnquiry.aiExtraction.extractedData.destination}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#6a7d61] block font-semibold">Travel Month / Period</span>
                        <span className="font-bold text-[#173D32]">
                          {selectedEnquiry.aiExtraction.extractedData.travel_month || "Upcoming"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#6a7d61] block font-semibold">Party Size</span>
                        <span className="font-bold text-[#173D32]">
                          {selectedEnquiry.aiExtraction.extractedData.adults} Adults, {selectedEnquiry.aiExtraction.extractedData.children} Kids
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#6a7d61] block font-semibold">Target Budget</span>
                        <span className="font-mono font-bold text-[#173D32]">
                          {selectedEnquiry.aiExtraction.extractedData.budget
                            ? `₹${selectedEnquiry.aiExtraction.extractedData.budget.toLocaleString("en-IN")}`
                            : "Flexible / Not Stated"}
                        </span>
                      </div>

                      {selectedEnquiry.aiExtraction.extractedData.special_requirements?.length > 0 && (
                        <div className="col-span-2 sm:col-span-4 pt-2 border-t border-[#E9E1D5]/60">
                          <span className="text-[10px] text-[#6a7d61] block font-semibold mb-1">
                            Key Desired Experiences:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {selectedEnquiry.aiExtraction.extractedData.special_requirements.map((req, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-full bg-[#173D32]/10 text-[#173D32] text-[11px] font-medium"
                              >
                                {req}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Inline Editing Mode */
                    <div className="bg-white rounded-2xl p-4 border border-[#E9E1D5] space-y-3 text-xs">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold text-[#6a7d61] mb-1">Destination</label>
                          <input
                            type="text"
                            value={editFormData.destination || ""}
                            onChange={(e) => setEditFormData({ ...editFormData, destination: e.target.value })}
                            className="w-full px-2.5 py-1 rounded border border-[#E9E1D5]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#6a7d61] mb-1">Travel Month</label>
                          <input
                            type="text"
                            value={editFormData.travel_month || ""}
                            onChange={(e) => setEditFormData({ ...editFormData, travel_month: e.target.value })}
                            className="w-full px-2.5 py-1 rounded border border-[#E9E1D5]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#6a7d61] mb-1">Adults</label>
                          <input
                            type="number"
                            value={editFormData.adults || 2}
                            onChange={(e) => setEditFormData({ ...editFormData, adults: Number(e.target.value) })}
                            className="w-full px-2.5 py-1 rounded border border-[#E9E1D5]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-[#6a7d61] mb-1">Budget (₹)</label>
                          <input
                            type="number"
                            value={editFormData.budget || ""}
                            onChange={(e) => setEditFormData({ ...editFormData, budget: Number(e.target.value) })}
                            className="w-full px-2.5 py-1 rounded border border-[#E9E1D5]"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}

              {/* RECOMMENDED PACKAGES (Deterministic Hybrid Match against Real DB) */}
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#6a7d61] block mb-3">
                  Deterministically Matched Packages (PostgreSQL Inventory)
                </span>

                {selectedEnquiry.aiExtraction?.recommendations && selectedEnquiry.aiExtraction.recommendations.length > 0 ? (
                  <div className="space-y-3">
                    {selectedEnquiry.aiExtraction.recommendations.map((rec, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-2xl p-4 border border-[#E9E1D5] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1 max-w-md">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[10px] bg-[#FAF9F6] text-[#173D32] px-2 py-0.5 rounded border border-[#E9E1D5]">
                              {rec.packageCode}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                              {Math.round(rec.matchScore * 100)}% Match
                            </span>
                          </div>
                          <h4 className="font-serif font-bold text-sm text-[#173D32]">
                            {rec.title}
                          </h4>
                          <p className="text-[11px] text-[#6a7d61]">
                            {rec.reason}
                          </p>
                        </div>

                        <div className="text-left sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E9E1D5]/60">
                          <span className="text-[10px] text-[#6a7d61] block">
                            Matched Season: {rec.seasonMatched}
                          </span>
                          <span className="text-sm font-serif font-bold text-[#173D32]">
                            ₹{rec.pricePerPerson.toLocaleString("en-IN")}{" "}
                            <span className="text-[10px] font-sans font-normal text-[#6a7d61]">/ person</span>
                          </span>
                          <span className="text-[11px] font-bold text-emerald-800 block">
                            Est. Total: ₹{rec.estimatedTotal.toLocaleString("en-IN")} + GST
                          </span>
                          <Link
                            href={`/packages/${rec.slug}`}
                            target="_blank"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#173D32] underline hover:text-[#215143] mt-1"
                          >
                            <span>Inspect Package</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white rounded-xl p-4 border border-[#E9E1D5] text-xs text-[#6a7d61] text-center">
                    No exact package match found. You can customize any itinerary for this guest.
                  </div>
                )}
              </div>

              {/* AI-GENERATED REPLY DRAFT */}
              {selectedEnquiry.aiExtraction?.replyDraft && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#6a7d61]">
                      Generated Proposal Draft (Real Contracted Tariffs)
                    </span>
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/enquiries/${selectedEnquiry.id}/quote`}
                        target="_blank"
                        className="px-3 py-1 bg-[#173D32] hover:bg-[#215143] text-[#FAF9F6] text-xs rounded-full flex items-center gap-1 font-semibold transition-colors cursor-pointer shadow-sm"
                      >
                        <FileText className="w-3 h-3" />
                        <span>Print Client Quote</span>
                      </Link>

                      <button
                        onClick={() => handleCopyDraft(selectedEnquiry.aiExtraction!.replyDraft)}
                        className="px-3 py-1 bg-white border border-[#E9E1D5] hover:bg-[#FAF9F6] text-[#173D32] text-xs rounded-full flex items-center gap-1 font-semibold transition-colors cursor-pointer"
                      >
                        {copiedDraft ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Draft</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="bg-white border border-[#E9E1D5] rounded-2xl p-4 font-mono text-xs text-[#252925] leading-relaxed whitespace-pre-wrap">
                    {selectedEnquiry.aiExtraction.replyDraft}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-[#6a7d61] bg-[#FAF9F6] p-2.5 rounded-xl border border-[#E9E1D5]">
                    <ShieldCheck className="w-4 h-4 text-[#173D32] shrink-0" />
                    <span>
                      Draft safety policy: Responses require human review and are never automatically dispatched.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* INTERNAL NOTES TIMELINE */}
            <div className="space-y-4 pt-4 border-t border-[#E9E1D5]">
              <h3 className="font-serif font-bold text-base text-[#173D32] flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#173D32]" />
                <span>Internal Staff Notes ({selectedEnquiry.notes.length})</span>
              </h3>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="space-y-2">
                <textarea
                  rows={2}
                  placeholder="Add private consultant note (e.g. called guest, holding room at Fragrant Nature)..."
                  value={newNoteText}
                  onChange={(e) => setNewNoteText(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#E9E1D5] bg-[#FAF9F6] text-xs text-[#252925] focus:outline-none focus:ring-2 focus:ring-[#173D32]/30"
                />
                <button
                  type="submit"
                  disabled={submittingNote || !newNoteText.trim()}
                  className="bg-[#173D32] hover:bg-[#215143] text-[#FAF9F6] px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>{submittingNote ? "Saving Note..." : "Add Internal Note"}</span>
                </button>
              </form>

              {/* Notes List */}
              <div className="space-y-3 pt-2">
                {selectedEnquiry.notes.map((note) => (
                  <div
                    key={note.id}
                    className="bg-[#FAF9F6] border border-[#E9E1D5] rounded-xl p-3.5 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between text-[#6a7d61]">
                      <span className="font-semibold text-[#173D32]">{note.authorName}</span>
                      <span className="text-[10px] font-mono">
                        {new Date(note.createdAt).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <p className="text-[#252925] leading-relaxed">{note.note}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

