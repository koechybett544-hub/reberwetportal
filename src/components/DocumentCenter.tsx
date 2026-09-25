import React, { useState } from 'react';
import { SchoolDocument, UserProfile } from '../types';
import { SCHOOL_INFO, SUBJECTS } from '../data/initialData';
import { generateLearningResourcePdf } from '../utils/pdfExport';
import {
  FolderOpen,
  FileText,
  Download,
  Eye,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  X,
  BookOpen,
  GraduationCap,
  FileDown,
  Upload,
  Calendar,
  Layers,
} from 'lucide-react';

interface DocumentCenterProps {
  documents: SchoolDocument[];
  currentUser: UserProfile;
  onAddDocument: (doc: SchoolDocument) => void;
  onShowSuccessToast: (msg: string) => void;
}

export interface LearningResourceItem {
  id: string;
  title: string;
  grade: 'Grade 7' | 'Grade 8' | 'Grade 9';
  subject: string;
  category: 'Schemes of Work' | 'Revision Notes' | 'Assessment Papers' | 'Curriculum Designs' | 'Lesson Plans';
  term: 'Term 1' | 'Term 2' | 'Term 3';
  fileType: 'PDF' | 'DOCX';
  fileSize: string;
  author: string;
  date: string;
  content: string;
  keyOutcomes?: string[];
  fileDataUrl?: string; // Stored uploaded file
}

export const INITIAL_LEARNING_RESOURCES: LearningResourceItem[] = [
  {
    id: 'res-1',
    title: 'Grade 8 Mathematics - Linear Equations & Coordinate Geometry Summary',
    grade: 'Grade 8',
    subject: 'Mathematics',
    category: 'Revision Notes',
    term: 'Term 3',
    fileType: 'PDF',
    fileSize: '1.4 MB',
    author: 'Brian Bett',
    date: '2026-09-15',
    keyOutcomes: [
      'Solve linear equations with one unknown and fractional coefficients.',
      'Plot Cartesian coordinates and determine gradient of linear graphs.',
      'Formulate real-life word equations and apply algebraic substitution.',
    ],
    content: `1. LINEAR EQUATIONS OVERVIEW
A linear equation is an algebraic sentence where the highest exponent of the variable is 1. Standard format: ax + b = c.
- Step 1: Group like terms on one side of the equality sign.
- Step 2: Use inverse operations (addition/subtraction, multiplication/division).
- Step 3: Check your solution by substituting the value back into the original expression.

2. CARTESIAN PLANE & COORDINATES
Points are identified as ordered pairs (x, y) where x is the horizontal abscissa and y is the vertical ordinate.
- Gradient (m) formula: m = (y2 - y1) / (x2 - x1)
- Positive slope rises from left to right; negative slope falls from left to right.

3. WORKED SAMPLE PROBLEM:
Solve for x: 3(2x - 4) + 5 = 23
Step 1: Expand brackets: 6x - 12 + 5 = 23
Step 2: Simplify: 6x - 7 = 23
Step 3: Add 7 to both sides: 6x = 30
Step 4: Divide by 6: x = 5.
Verified: 3(10 - 4) + 5 = 3(6) + 5 = 18 + 5 = 23 ✓`,
  },
  {
    id: 'res-2',
    title: 'Grade 7 Integrated Science - Mixtures, Elements & Separation Techniques',
    grade: 'Grade 7',
    subject: 'Integrated Science',
    category: 'Revision Notes',
    term: 'Term 3',
    fileType: 'PDF',
    fileSize: '2.1 MB',
    author: 'Sharon Cherotich',
    date: '2026-09-12',
    keyOutcomes: [
      'Distinguish between homogeneous and heterogeneous mixtures.',
      'Select appropriate separation techniques: filtration, evaporation, chromatography, and distillation.',
      'Demonstrate safety precautions when handling chemical reagents.',
    ],
    content: `1. NATURE OF MATTER & MIXTURES
Matter is anything that has mass and occupies space. Mixtures consist of two or more substances physically combined without chemical bonding.
- Homogeneous Mixtures: Uniform composition throughout (e.g. salt dissolved in clean water).
- Heterogeneous Mixtures: Non-uniform composition with observable phase boundaries (e.g. sand and water).

2. SEPARATION METHODS IN CBC LABORATORIES:
- Filtration: Separating an insoluble solid from a liquid using filter paper.
- Evaporation: Recovering a dissolved solute from a liquid solvent by boiling off the liquid.
- Simple Distillation: Separating miscible liquids with distinct boiling points.
- Paper Chromatography: Separating pigments and dyes based on differential solubility and capillary rates.`,
  },
  {
    id: 'res-3',
    title: 'Grade 8 Agriculture - Soil Conservation & Water Harvesting Scheme of Work',
    grade: 'Grade 8',
    subject: 'Agriculture & Nutrition',
    category: 'Schemes of Work',
    term: 'Term 3',
    fileType: 'PDF',
    fileSize: '1.8 MB',
    author: 'Reberwet Agriculture Faculty',
    date: '2026-09-10',
    keyOutcomes: [
      'Construct gabions, contour ridges, and grass strips to control soil erosion.',
      'Set up rooftop rain water harvesting systems and conservation pits.',
      'Maintain school kitchen garden with organic mulching.',
    ],
    content: `WEEK 1 - 2: SOIL EROSION CONTROL
Strand: Conserving Soil and Water Resources.
Specific Learning Outcomes: By the end of the lesson, the learner should be able to identify types of erosion (splash, sheet, rill, and gully) within Siongiroi sub-county and prepare contour bands.
Learning Activities: Field walk around school compound, taking soil samples, digging half-moon micro-catchments.

WEEK 3 - 4: WATER HARVESTING METHODS
Strand: Crop Husbandry and Moisture Retention.
Activities: Designing sunken beds, applying organic compost mulches, and gutter installation for runoff collection.`,
  },
  {
    id: 'res-4',
    title: 'Grade 9 Pre-Technical Studies - Electrical Circuitry & Safety Handbook',
    grade: 'Grade 9',
    subject: 'Pre-Technical Studies',
    category: 'Curriculum Designs',
    term: 'Term 3',
    fileType: 'PDF',
    fileSize: '2.5 MB',
    author: 'Brian Bett',
    date: '2026-09-18',
    keyOutcomes: [
      'Identify electrical symbols for switches, resistors, cells, and capacitors.',
      'Assemble series and parallel circuits on breadboards safely.',
      'Apply workshop safety rules to prevent electric shocks and burns.',
    ],
    content: `1. BASIC PRINCIPLES OF ELECTRICITY
- Voltage (V): Electrical potential difference driving charge flow (measured in Volts).
- Current (I): Rate of flow of electrical charges (measured in Amperes).
- Resistance (R): Opposition to current flow (Ohm's Law: V = I * R).

2. WORKSHOP SAFETY REGULATIONS:
- Never handle exposed conductors with damp hands.
- Ensure all laboratory circuits incorporate a certified fuse or circuit breaker.
- Inspect multimeter test leads before measuring live voltages.`,
  },
];

export const DocumentCenter: React.FC<DocumentCenterProps> = ({
  documents,
  currentUser,
  onAddDocument,
  onShowSuccessToast,
}) => {
  const [activeTab, setActiveTab] = useState<'resources' | 'admin_docs'>('resources');
  const [resources, setResources] = useState<LearningResourceItem[]>(() => {
    try {
      const stored = localStorage.getItem('reberwet_learning_resources_v1');
      if (stored) return JSON.parse(stored);
    } catch {}
    return INITIAL_LEARNING_RESOURCES;
  });

  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Upload/Create Resource Modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newGrade, setNewGrade] = useState<'Grade 7' | 'Grade 8' | 'Grade 9'>('Grade 8');
  const [newSubject, setNewSubject] = useState<string>('Mathematics');
  const [newCategory, setNewCategory] = useState<LearningResourceItem['category']>('Revision Notes');
  const [newTerm, setNewTerm] = useState<'Term 1' | 'Term 2' | 'Term 3'>('Term 3');
  const [newKeyOutcomes, setNewKeyOutcomes] = useState<string>('');
  const [newContent, setNewContent] = useState<string>('');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: string; dataUrl: string } | null>(null);

  // Preview Resource Modal
  const [previewResource, setPreviewResource] = useState<LearningResourceItem | null>(null);

  const saveResources = (items: LearningResourceItem[]) => {
    setResources(items);
    try {
      localStorage.setItem('reberwet_learning_resources_v1', JSON.stringify(items));
    } catch (err) {
      console.error('Failed to cache resources:', err);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeFormatted = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUploadedFile({
        name: file.name,
        size: sizeFormatted,
        dataUrl,
      });
      if (!newTitle.trim()) {
        setNewTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
      onShowSuccessToast(`Loaded ${file.name} successfully.`);
    };
    reader.readAsDataURL(file);
  };

  const handleCreateResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const outcomesArray = newKeyOutcomes
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const newResource: LearningResourceItem = {
      id: `res-${Date.now()}`,
      title: newTitle.trim(),
      grade: newGrade,
      subject: newSubject,
      category: newCategory,
      term: newTerm,
      fileType: 'PDF',
      fileSize: uploadedFile ? uploadedFile.size : '1.2 MB',
      author: currentUser.name,
      date: new Date().toISOString().split('T')[0],
      keyOutcomes: outcomesArray.length > 0 ? outcomesArray : [
        `Understand core strands and competencies in ${newSubject} under CBC guidelines.`,
      ],
      content: newContent.trim() || `CBC learning resource and revision study guide for ${newGrade} ${newSubject}. Prepared for Reberwet JSS learners.`,
      fileDataUrl: uploadedFile?.dataUrl,
    };

    const updated = [newResource, ...resources];
    saveResources(updated);

    // Also register in school documents
    onAddDocument({
      id: newResource.id,
      title: newResource.title,
      category: newResource.category,
      fileSize: newResource.fileSize,
      fileType: 'PDF',
      updatedAt: newResource.date,
      author: currentUser.name,
      accessLevel: 'staff',
    });

    setShowUploadModal(false);
    setNewTitle('');
    setNewContent('');
    setNewKeyOutcomes('');
    setUploadedFile(null);
    onShowSuccessToast('Learning resource saved and ready for PDF export!');
  };

  const handleExportResourcePdf = (resource: LearningResourceItem) => {
    if (resource.fileDataUrl) {
      // Direct download of stored PDF
      const a = document.createElement('a');
      a.href = resource.fileDataUrl;
      a.download = `${resource.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      onShowSuccessToast(`Exported "${resource.title}" as PDF!`);
    } else {
      // Generate formatted PDF using jsPDF
      generateLearningResourcePdf({
        title: resource.title,
        grade: resource.grade,
        subject: resource.subject,
        category: resource.category,
        term: resource.term,
        author: resource.author,
        date: resource.date,
        content: resource.content,
        keyOutcomes: resource.keyOutcomes,
      });
      onShowSuccessToast(`Exported "${resource.title}" as PDF document!`);
    }
  };

  const filteredResources = resources.filter((item) => {
    if (selectedGrade !== 'all' && item.grade !== selectedGrade) return false;
    if (selectedSubject !== 'all' && item.subject !== selectedSubject) return false;
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        item.title.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q) ||
        item.author.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-5 pb-16">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-200 pb-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-stone-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#6b1426]" />
            <span>Learning Resources &amp; Document Centre</span>
          </h1>
          <p className="text-xs text-stone-600">
            Upload CBC learning materials, schemes of work, revision notes, and export them directly as downloadable PDFs.
          </p>
        </div>

        <button
          id="upload-learning-resource-btn"
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-[#6b1426] hover:bg-[#520e1c] text-white px-4 py-2.5 text-xs font-bold transition shadow-sm self-start sm:self-auto active:scale-95"
        >
          <Upload className="w-4 h-4" />
          <span>Upload / Create Learning Resource</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by title, subject, or author..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 text-xs sm:text-sm border border-stone-300 rounded-xl bg-stone-50 focus:bg-white focus:border-[#6b1426] focus:outline-none"
            />
          </div>

          {/* Grade Filter */}
          <div className="sm:col-span-2">
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full border border-stone-300 rounded-xl p-2 text-xs sm:text-sm font-semibold text-stone-800 focus:border-[#6b1426]"
            >
              <option value="all">All Grades</option>
              <option value="Grade 7">Grade 7</option>
              <option value="Grade 8">Grade 8</option>
              <option value="Grade 9">Grade 9</option>
            </select>
          </div>

          {/* Subject Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full border border-stone-300 rounded-xl p-2 text-xs sm:text-sm font-semibold text-stone-800 focus:border-[#6b1426]"
            >
              <option value="all">All Subjects</option>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full border border-stone-300 rounded-xl p-2 text-xs sm:text-sm font-semibold text-stone-800 focus:border-[#6b1426]"
            >
              <option value="all">All Types</option>
              <option value="Revision Notes">Revision Notes</option>
              <option value="Schemes of Work">Schemes of Work</option>
              <option value="Curriculum Designs">Curriculum Designs</option>
              <option value="Lesson Plans">Lesson Plans</option>
              <option value="Assessment Papers">Assessment Papers</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resources Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredResources.map((res) => (
          <div
            key={res.id}
            className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs hover:shadow-md hover:border-[#6b1426] transition flex flex-col justify-between space-y-3"
          >
            <div className="space-y-2.5">
              {/* Badges */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md uppercase bg-rose-50 text-[#6b1426] border border-rose-200">
                    {res.grade}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase bg-stone-100 text-stone-700">
                    {res.category}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {res.fileType}
                </span>
              </div>

              {/* Title & Subject */}
              <div>
                <h3 className="font-extrabold text-sm text-stone-950 leading-snug line-clamp-2">
                  {res.title}
                </h3>
                <p className="text-xs font-semibold text-stone-500 mt-0.5">
                  {res.subject} • {res.term}
                </p>
              </div>

              {/* Snippet / Outcomes */}
              {res.keyOutcomes && res.keyOutcomes.length > 0 && (
                <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/80 text-[11px] text-stone-600 line-clamp-2">
                  <strong>Key Outcome:</strong> {res.keyOutcomes[0]}
                </div>
              )}
            </div>

            {/* Bottom Bar with Export as PDF Button */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
              <span className="text-[11px] text-stone-500">
                {res.fileSize} • {res.author}
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setPreviewResource(res)}
                  className="p-1.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition"
                  title="Preview Resource"
                >
                  <Eye className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleExportResourcePdf(res)}
                  className="flex items-center gap-1 bg-[#6b1426] hover:bg-[#520e1c] text-white px-2.5 py-1.5 rounded-lg text-xs font-bold transition active:scale-95 shadow-2xs"
                  title="Export this resource as PDF document"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Export PDF</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredResources.length === 0 && (
          <div className="col-span-full bg-white rounded-2xl border border-stone-200 p-12 text-center text-stone-500 space-y-2">
            <BookOpen className="w-8 h-8 text-stone-300 mx-auto" />
            <p className="font-bold text-sm">No learning resources found matching your search.</p>
            <p className="text-xs">Click "Upload / Create Learning Resource" above to add your first study materials or schemes of work.</p>
          </div>
        )}
      </div>

      {/* Upload & Create Learning Resource Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl bg-white p-5 sm:p-6 shadow-2xl border border-stone-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
              <h3 className="font-black text-stone-900 text-base flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#6b1426]" />
                <span>Upload / Create Learning Resource (PDF Exportable)</span>
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateResource} className="space-y-3.5 text-xs">
              {/* File Upload Zone */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Upload PDF File or Lesson Document (Optional)
                </label>
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-stone-300 hover:border-[#6b1426] rounded-xl text-center bg-stone-50 cursor-pointer transition">
                  <Upload className="w-6 h-6 text-stone-400 mb-1" />
                  <span className="text-stone-700 font-bold">
                    {uploadedFile ? uploadedFile.name : 'Click to select PDF or drag & drop'}
                  </span>
                  <span className="text-[11px] text-stone-400 mt-0.5">
                    {uploadedFile ? `Size: ${uploadedFile.size} • Ready for export` : 'PDF, DOCX, Notes (Max 25MB)'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Title */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">Resource Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Grade 8 Integrated Science - Living Organisms Notes"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 p-2.5 text-stone-800 font-semibold focus:border-[#6b1426] focus:outline-none"
                  required
                />
              </div>

              {/* Grade, Subject, Category, Term */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Grade</label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value as any)}
                    className="w-full rounded-xl border border-stone-300 p-2 text-stone-800 font-bold"
                  >
                    <option value="Grade 7">Grade 7</option>
                    <option value="Grade 8">Grade 8</option>
                    <option value="Grade 9">Grade 9</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Subject</label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full rounded-xl border border-stone-300 p-2 text-stone-800 font-bold"
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Type</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-stone-300 p-2 text-stone-800 font-bold"
                  >
                    <option value="Revision Notes">Revision Notes</option>
                    <option value="Schemes of Work">Schemes of Work</option>
                    <option value="Assessment Papers">Assessment Papers</option>
                    <option value="Curriculum Designs">Curriculum Designs</option>
                    <option value="Lesson Plans">Lesson Plans</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Term</label>
                  <select
                    value={newTerm}
                    onChange={(e) => setNewTerm(e.target.value as any)}
                    className="w-full rounded-xl border border-stone-300 p-2 text-stone-800 font-bold"
                  >
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Term 3">Term 3</option>
                  </select>
                </div>
              </div>

              {/* Key Learning Outcomes */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Key Learning Outcomes / Strands (1 per line)
                </label>
                <textarea
                  rows={2}
                  value={newKeyOutcomes}
                  onChange={(e) => setNewKeyOutcomes(e.target.value)}
                  placeholder="e.g. Understand the principles of algebraic expressions&#10;Apply equations to solve practical word problems"
                  className="w-full rounded-xl border border-stone-300 p-2 text-stone-800 focus:border-[#6b1426] focus:outline-none"
                />
              </div>

              {/* Content / Notes */}
              <div>
                <label className="block font-bold text-stone-700 mb-1">
                  Study Notes / Summary Content (Included in Exported PDF)
                </label>
                <textarea
                  rows={5}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Enter revision notes, lesson summary, or curriculum guidelines here..."
                  className="w-full rounded-xl border border-stone-300 p-2 text-stone-800 focus:border-[#6b1426] focus:outline-none font-sans"
                />
              </div>

              <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#6b1426] hover:bg-[#520e1c] text-white font-bold transition shadow-sm"
                >
                  Save &amp; Enable PDF Export
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Resource Modal */}
      {previewResource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#6b1426]" />
                <h3 className="font-bold text-stone-900 text-base">{previewResource.title}</h3>
              </div>
              <button
                onClick={() => setPreviewResource(null)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold px-2 py-0.5 rounded bg-rose-50 text-[#6b1426]">
                {previewResource.grade}
              </span>
              <span className="font-semibold text-stone-600">
                {previewResource.subject} • {previewResource.category} • {previewResource.term}
              </span>
            </div>

            {previewResource.keyOutcomes && previewResource.keyOutcomes.length > 0 && (
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-xs space-y-1">
                <strong className="text-stone-900 block font-bold">Key Learning Outcomes:</strong>
                <ul className="list-disc pl-4 text-stone-700 space-y-0.5">
                  {previewResource.keyOutcomes.map((out, i) => (
                    <li key={i}>{out}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-white p-4 rounded-xl border border-stone-200 text-xs font-mono whitespace-pre-line text-stone-800 max-h-72 overflow-y-auto">
              {previewResource.content}
            </div>

            <div className="pt-3 border-t border-stone-200 flex justify-between items-center text-xs">
              <span className="text-stone-500">Compiled by {previewResource.author}</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewResource(null)}
                  className="px-3.5 py-1.5 rounded-xl text-stone-600 hover:bg-stone-100 font-bold"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleExportResourcePdf(previewResource);
                    setPreviewResource(null);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#6b1426] hover:bg-[#520e1c] text-white font-bold"
                >
                  <FileDown className="w-4 h-4" />
                  <span>Download as PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
