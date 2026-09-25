import {
  Learner,
  MarkEntry,
  AttendanceRecord,
  Announcement,
  CalendarEvent,
  SchoolDocument,
  AuditLog,
  UserProfile,
  TeacherActivity,
} from '../types';
import { DateService } from '../utils/dateService';

export const SCHOOL_INFO = {
  name: 'REBERWET JUNIOR SECONDARY SCHOOL',
  shortName: 'Reberwet JSS',
  motto: 'Together we can make a difference',
  get currentYear() {
    return DateService.getCurrentYear();
  },
  get currentTerm() {
    return DateService.getCurrentTerm();
  },
  termDates: 'August 25, 2026 – November 13, 2026',
  get currentDateFormatted() {
    return DateService.getFormattedCurrentDate();
  },
  county: 'Kericho County',
  subCounty: 'Siongiroi',
  postalAddress: 'P.O BOX 52-20423 SIONGIROI KENYA',
  portalVersion: 'v2.6 Teacher Edition',
  curriculum: 'CBC (Competency-Based Curriculum)',
};

export const DEFAULT_USERS: UserProfile[] = [
  {
    id: 'user-admin-1',
    name: 'Brian Bett',
    username: 'brian',
    password: 'reberwet2026',
    biometricsEnrolled: true,
    email: 'b.bett@reberwet.ac.ke',
    role: 'super_admin',
    phone: '+254 722 341 890',
    designation: 'School Administrator & JSS Teacher',
    tscNumber: 'TSC/742189',
    nationalId: '28456123',
    qualifications: 'B.Ed (Science & Mathematics) - Egerton University, Diploma in Education Management (KEMI)',
    specialization: 'Mathematics & Applied Sciences',
    teachingExperienceYears: 9,
    joiningDate: '2018-05-10',
    department: 'Mathematics & Technical Studies',
    primarySubject: 'Mathematics',
    assignedClass: 'Grade 8',
    backgroundBio: 'Championing digital record-keeping, CBC competency assessment frameworks, and practical STEM problem-solving across junior secondary grades.',
    emergencyContact: '+254 722 000 111',
    assignments: [
      { grade: 'Grade 8', subject: 'Mathematics' },
      { grade: 'Grade 7', subject: 'Mathematics' },
      { grade: 'Grade 9', subject: 'Pre-Technical Studies' },
    ],
  },
  {
    id: 'user-super-1',
    name: 'Mr John Koech',
    username: 'koech',
    password: 'reberwet2026',
    biometricsEnrolled: true,
    email: 'j.koech@reberwet.ac.ke',
    role: 'school_admin',
    phone: '+254 710 889 123',
    designation: 'Head Teacher / Head of Institution',
    tscNumber: 'TSC/489102',
    nationalId: '14589201',
    qualifications: 'M.Ed in Educational Administration & Planning (Kenyatta University), B.Ed (Arts)',
    specialization: 'Institutional Leadership & CBC Curriculum Implementation',
    teachingExperienceYears: 18,
    joiningDate: '2015-01-08',
    department: 'Administration & Humanities',
    primarySubject: 'Administration & Social Sciences',
    assignedClass: 'All Grades',
    backgroundBio: 'Dedicated institutional administrator with over 18 years of transformative leadership in basic education, community partnerships, and learner-centered pedagogy.',
    emergencyContact: '+254 710 112 233',
    assignments: [],
  },
  {
    id: 'user-teacher-8',
    name: 'Madam Faith Chepkirui',
    username: 'faith',
    password: 'reberwet2026',
    biometricsEnrolled: true,
    email: 'f.chepkirui@reberwet.ac.ke',
    role: 'teacher',
    phone: '+254 721 556 789',
    designation: 'Class Teacher (Grade 8) & Senior Languages Mistress',
    tscNumber: 'TSC/812034',
    nationalId: '30129485',
    qualifications: 'B.Ed (Arts - English & Literature) - Moi University',
    specialization: 'English Language, Literature & CRE',
    teachingExperienceYears: 7,
    joiningDate: '2020-09-01',
    department: 'Languages & Humanities',
    primarySubject: 'English',
    assignedClass: 'Grade 8',
    backgroundBio: 'Passionate language coach fostering critical reading, creative debating, and moral instruction through CBC values-based education.',
    emergencyContact: '+254 721 998 877',
    assignments: [
      { grade: 'Grade 8', subject: 'English' },
      { grade: 'Grade 8', subject: 'CRE (Religious Education)' },
      { grade: 'Grade 7', subject: 'English' },
    ],
  },
  {
    id: 'user-teacher-9',
    name: 'Mr Bore N.',
    username: 'bore',
    password: 'reberwet2026',
    biometricsEnrolled: true,
    email: 'b.bore@reberwet.ac.ke',
    role: 'teacher',
    phone: '+254 723 445 667',
    designation: 'Class Teacher (Grade 9) & Science Lead',
    tscNumber: 'TSC/793451',
    nationalId: '29871234',
    qualifications: 'B.Sc (Agricultural Education & Extension) - Egerton University',
    specialization: 'Integrated Science & Agriculture',
    teachingExperienceYears: 8,
    joiningDate: '2019-01-14',
    department: 'Pure & Applied Sciences',
    primarySubject: 'Integrated Science',
    assignedClass: 'Grade 9',
    backgroundBio: 'Leading agricultural practicals, laboratory safety protocols, school tree nursery projects, and junior secondary science fairs.',
    emergencyContact: '+254 723 334 455',
    assignments: [
      { grade: 'Grade 9', subject: 'Integrated Science' },
      { grade: 'Grade 9', subject: 'Agriculture & Nutrition' },
      { grade: 'Grade 8', subject: 'Integrated Science' },
    ],
  },
  {
    id: 'user-teacher-7',
    name: 'Madam Nelly Korir',
    username: 'nelly',
    password: 'reberwet2026',
    biometricsEnrolled: true,
    email: 'n.korir@reberwet.ac.ke',
    role: 'teacher',
    phone: '+254 725 778 990',
    designation: 'Class Teacher (Grade 7) & Humanities Mistress',
    tscNumber: 'TSC/834512',
    nationalId: '31245678',
    qualifications: 'B.Ed (Kiswahili & Social Studies) - University of Nairobi',
    specialization: 'Kiswahili Lugha na Fasihi, Social Studies',
    teachingExperienceYears: 6,
    joiningDate: '2021-02-10',
    department: 'Languages & Social Sciences',
    primarySubject: 'Kiswahili',
    assignedClass: 'Grade 7',
    backgroundBio: 'Promoting cultural heritage, environmental conservation, and linguistic excellence through active CBC clubs and student debates.',
    emergencyContact: '+254 725 667 788',
    assignments: [
      { grade: 'Grade 7', subject: 'Kiswahili' },
      { grade: 'Grade 7', subject: 'Social Studies' },
      { grade: 'Grade 8', subject: 'Social Studies' },
    ],
  },
];

// Grade class teacher mapping
export const CLASS_TEACHERS: Record<string, string> = {
  'Grade 7': 'Madam Nelly Korir',
  'Grade 8': 'Madam Faith Chepkirui',
  'Grade 9': 'Mr Bore N.',
};

// No streams - exactly 3 classes: Grade 7, Grade 8, Grade 9
export const GRADES = [
  { id: 'Grade 7', name: 'Grade 7', streams: [] as string[] },
  { id: 'Grade 8', name: 'Grade 8', streams: [] as string[] },
  { id: 'Grade 9', name: 'Grade 9', streams: [] as string[] },
];

export const SUBJECT_FACULTY: Record<string, string> = {
  'Mathematics': 'Brian Bett',
  'English': 'Madam Faith Chepkirui',
  'Kiswahili': 'Madam Nelly Korir',
  'Integrated Science': 'Mr Bore N.',
  'Social Studies': 'Madam Mercy Cherotich',
  'Agriculture & Nutrition': 'Mr Bore N.',
  'Pre-Technical Studies': 'Brian Bett',
  'CRE (Religious Education)': 'Madam Faith Chepkirui',
  'Creative Arts & Sports': 'Mr. Patrick Ronoh',
};

export const SUBJECTS = [
  'Mathematics',
  'English',
  'Kiswahili',
  'Integrated Science',
  'Social Studies',
  'Agriculture & Nutrition',
  'Pre-Technical Studies',
  'CRE (Religious Education)',
  'Creative Arts & Sports',
];

export const TERMS = ['Term 1', 'Term 2', 'Term 3'] as const;

// Helper to generate photo avatar URL
const getAvatarUrl = (gender: 'M' | 'F', seed: string) => {
  return `https://api.dicebear.com/7.x/micah/svg?seed=${seed}&backgroundColor=fed7aa,fde68a,ffedd5`;
};

export const INITIAL_LEARNERS: Learner[] = [
  // Grade 8 Class
  {
    id: 'l-088',
    admNo: '088',
    firstName: 'Chastern',
    lastName: 'Kiprotich',
    fullName: 'Chastern Kiprotich',
    grade: 'Grade 8',
    gender: 'M',
    academicYear: '2026',
    attendanceRate: 97,
    status: 'Active',
    photo: getAvatarUrl('M', 'Chastern'),
    guardianName: 'Richard Kiprotich',
    guardianPhone: '+254 723 100 088',
    comments: {
      generalComment: 'Chastern demonstrates keen analytical skill and is consistently active during STEM discussions.',
      classTeacherComment: 'A well-behaved, dependable class prefect who leads by example. Outstanding effort in all subjects.',
      updatedAt: '2026-09-18',
      updatedBy: 'MR Bett Brian',
    },
  },
  {
    id: 'l-092',
    admNo: '092',
    firstName: 'Emmanuel',
    lastName: 'Kipkirui',
    fullName: 'Emmanuel Kipkirui',
    grade: 'Grade 8',
    gender: 'M',
    academicYear: '2026',
    attendanceRate: 94,
    status: 'Active',
    photo: getAvatarUrl('M', 'Emmanuel'),
    guardianName: 'Sammy Kipkirui',
    guardianPhone: '+254 722 200 092',
    comments: {
      generalComment: 'Strong conceptual understanding in mathematics and pre-technical studies.',
      classTeacherComment: 'Very polite learner; shows tremendous curiosity in science experiments.',
      updatedAt: '2026-09-18',
      updatedBy: 'MR Bett Brian',
    },
  },
  {
    id: 'l-093',
    admNo: '093',
    firstName: 'Faith',
    lastName: 'Jepkemboi',
    fullName: 'Faith Jepkemboi',
    grade: 'Grade 8',
    gender: 'F',
    academicYear: '2026',
    attendanceRate: 98,
    status: 'Active',
    photo: getAvatarUrl('F', 'Faith'),
    guardianName: 'Beatrice Jepkemboi',
    guardianPhone: '+254 721 300 093',
    comments: {
      generalComment: 'Remarkable aptitude across languages and science.',
      classTeacherComment: 'Active in science club and environmental conservation projects. Exemplary focus.',
      updatedAt: '2026-09-18',
      updatedBy: 'MR Bett Brian',
    },
  },
  {
    id: 'l-094',
    admNo: '094',
    firstName: 'Brian',
    lastName: 'Kipkoech',
    fullName: 'Brian Kipkoech',
    grade: 'Grade 8',
    gender: 'M',
    academicYear: '2026',
    attendanceRate: 91,
    status: 'Active',
    photo: getAvatarUrl('M', 'Brian'),
    comments: {
      generalComment: 'Shows steady progress; encouraged to practice problem-solving daily.',
      classTeacherComment: 'Good sportsmanship during inter-house games. Keep pushing higher.',
      updatedAt: '2026-09-18',
      updatedBy: 'MR Bett Brian',
    },
  },
  {
    id: 'l-095',
    admNo: '095',
    firstName: 'Mercy',
    lastName: 'Chepchirchir',
    fullName: 'Mercy Chepchirchir',
    grade: 'Grade 8',
    gender: 'F',
    academicYear: '2026',
    attendanceRate: 96,
    status: 'Active',
    photo: getAvatarUrl('F', 'Mercy'),
    comments: {
      generalComment: 'Consistent high performer with outstanding coursework presentation.',
      classTeacherComment: 'Very disciplined and supportive of study group peers. Well done!',
      updatedAt: '2026-09-18',
      updatedBy: 'MR Bett Brian',
    },
  },
  {
    id: 'l-096',
    admNo: '096',
    firstName: 'Kelvin',
    lastName: 'Kipruto',
    fullName: 'Kelvin Kipruto',
    grade: 'Grade 8',
    gender: 'M',
    academicYear: '2026',
    attendanceRate: 88,
    status: 'Active',
    photo: getAvatarUrl('M', 'Kelvin'),
    comments: {
      generalComment: 'Capable learner who benefits from regular revision of core concepts.',
      classTeacherComment: 'Attendance improved notably this term. Capable of higher competency levels.',
      updatedAt: '2026-09-18',
      updatedBy: 'MR Bett Brian',
    },
  },
  {
    id: 'l-097',
    admNo: '097',
    firstName: 'Sharon',
    lastName: 'Chelangat',
    fullName: 'Sharon Chelangat',
    grade: 'Grade 8',
    gender: 'F',
    academicYear: '2026',
    attendanceRate: 95,
    status: 'Active',
    photo: getAvatarUrl('F', 'Sharon'),
    comments: {
      generalComment: 'Enthusiastic participant in agricultural projects and group discussions.',
      classTeacherComment: 'Shows dependable teamwork skills and neat work presentation.',
      updatedAt: '2026-09-18',
      updatedBy: 'MR Bett Brian',
    },
  },
  {
    id: 'l-098',
    admNo: '098',
    firstName: 'Dominic',
    lastName: 'Kibet',
    fullName: 'Dominic Kibet',
    grade: 'Grade 8',
    gender: 'M',
    academicYear: '2026',
    attendanceRate: 92,
    status: 'Active',
    photo: getAvatarUrl('M', 'Dominic'),
    comments: {
      generalComment: 'Demonstrates consistent interest in technical drawing and computing.',
      classTeacherComment: 'Good attitude and regular class participation throughout Term 3.',
    },
  },
  {
    id: 'l-099',
    admNo: '099',
    firstName: 'Cynthia',
    lastName: 'Cherotich',
    fullName: 'Cynthia Cherotich',
    grade: 'Grade 8',
    gender: 'F',
    academicYear: '2026',
    attendanceRate: 97,
    status: 'Active',
    photo: getAvatarUrl('F', 'Cynthia'),
    comments: {
      generalComment: 'High competency in language arts and social studies.',
      classTeacherComment: 'A very attentive and cooperative learner.',
    },
  },
  {
    id: 'l-100',
    admNo: '100',
    firstName: 'Collins',
    lastName: 'Kipkemoi',
    fullName: 'Collins Kipkemoi',
    grade: 'Grade 8',
    gender: 'M',
    academicYear: '2026',
    attendanceRate: 90,
    status: 'Active',
    photo: getAvatarUrl('M', 'Collins'),
  },
  {
    id: 'l-101',
    admNo: '101',
    firstName: 'Brenda',
    lastName: 'Chepkemoi',
    fullName: 'Brenda Chepkemoi',
    grade: 'Grade 8',
    gender: 'F',
    academicYear: '2026',
    attendanceRate: 96,
    status: 'Active',
    photo: getAvatarUrl('F', 'Brenda'),
  },
  {
    id: 'l-102',
    admNo: '102',
    firstName: 'Geoffrey',
    lastName: 'Kipngetich',
    fullName: 'Geoffrey Kipngetich',
    grade: 'Grade 8',
    gender: 'M',
    academicYear: '2026',
    attendanceRate: 93,
    status: 'Active',
    photo: getAvatarUrl('M', 'Geoffrey'),
  },
  {
    id: 'l-103',
    admNo: '103',
    firstName: 'Diana',
    lastName: 'Cherono',
    fullName: 'Diana Cherono',
    grade: 'Grade 8',
    gender: 'F',
    academicYear: '2026',
    attendanceRate: 99,
    status: 'Active',
    photo: getAvatarUrl('F', 'Diana'),
  },
  {
    id: 'l-104',
    admNo: '104',
    firstName: 'Dennis',
    lastName: 'Kipyegon',
    fullName: 'Dennis Kipyegon',
    grade: 'Grade 8',
    gender: 'M',
    academicYear: '2026',
    attendanceRate: 91,
    status: 'Active',
    photo: getAvatarUrl('M', 'Dennis'),
  },
  {
    id: 'l-105',
    admNo: '105',
    firstName: 'Mercy',
    lastName: 'Jepkorir',
    fullName: 'Mercy Jepkorir',
    grade: 'Grade 8',
    gender: 'F',
    academicYear: '2026',
    attendanceRate: 94,
    status: 'Active',
    photo: getAvatarUrl('F', 'MercyJ'),
  },
  {
    id: 'l-106',
    admNo: '106',
    firstName: 'Victor',
    lastName: 'Kipchirchir',
    fullName: 'Victor Kipchirchir',
    grade: 'Grade 8',
    gender: 'M',
    academicYear: '2026',
    attendanceRate: 85,
    status: 'Active',
    photo: getAvatarUrl('M', 'Victor'),
  },
  {
    id: 'l-107',
    admNo: '107',
    firstName: 'Sheila',
    lastName: 'Chebet',
    fullName: 'Sheila Chebet',
    grade: 'Grade 8',
    gender: 'F',
    academicYear: '2026',
    attendanceRate: 92,
    status: 'Active',
    photo: getAvatarUrl('F', 'Sheila'),
  },

  // Grade 7 Class Learners
  {
    id: 'l-120',
    admNo: '120',
    firstName: 'Patrick',
    lastName: 'Kiprono',
    fullName: 'Patrick Kiprono',
    grade: 'Grade 7',
    gender: 'M',
    academicYear: '2026',
    attendanceRate: 95,
    status: 'Active',
    photo: getAvatarUrl('M', 'Patrick'),
    comments: {
      generalComment: 'Settled well into Junior Secondary CBC learning strands.',
      classTeacherComment: 'Active and enthusiastic in mathematics and science.',
    },
  },
  {
    id: 'l-121',
    admNo: '121',
    firstName: 'Joy',
    lastName: 'Cherotich',
    fullName: 'Joy Cherotich',
    grade: 'Grade 7',
    gender: 'F',
    academicYear: '2026',
    attendanceRate: 96,
    status: 'Active',
    photo: getAvatarUrl('F', 'Joy'),
  },
  {
    id: 'l-122',
    admNo: '122',
    firstName: 'Kevin',
    lastName: 'Kiprotich',
    fullName: 'Kevin Kiprotich',
    grade: 'Grade 7',
    gender: 'M',
    academicYear: '2026',
    attendanceRate: 93,
    status: 'Active',
    photo: getAvatarUrl('M', 'Kevin'),
  },
  {
    id: 'l-123',
    admNo: '123',
    firstName: 'Daisy',
    lastName: 'Chepkirui',
    fullName: 'Daisy Chepkirui',
    grade: 'Grade 7',
    gender: 'F',
    academicYear: '2026',
    attendanceRate: 98,
    status: 'Active',
    photo: getAvatarUrl('F', 'Daisy'),
  },
  {
    id: 'l-124',
    admNo: '124',
    firstName: 'Allan',
    lastName: 'Kipkoech',
    fullName: 'Allan Kipkoech',
    grade: 'Grade 7',
    gender: 'M',
    academicYear: '2026',
    attendanceRate: 90,
    status: 'Active',
    photo: getAvatarUrl('M', 'Allan'),
  },
  {
    id: 'l-125',
    admNo: '125',
    firstName: 'Mercy',
    lastName: 'Cheptoo',
    fullName: 'Mercy Cheptoo',
    grade: 'Grade 7',
    gender: 'F',
    academicYear: '2026',
    attendanceRate: 94,
    status: 'Active',
    photo: getAvatarUrl('F', 'Cheptoo'),
  },

  // Grade 9 Class Learners
  {
    id: 'l-140',
    admNo: '140',
    firstName: 'Brian',
    lastName: 'Kiprono',
    fullName: 'Brian Kiprono',
    grade: 'Grade 9',
    gender: 'M',
    academicYear: '2026',
    attendanceRate: 97,
    status: 'Active',
    photo: getAvatarUrl('M', 'Brian9'),
    comments: {
      generalComment: 'Preparing commendably for national senior secondary transitions.',
      classTeacherComment: 'Excellent leadership and analytical competencies.',
    },
  },
  {
    id: 'l-141',
    admNo: '141',
    firstName: 'Beatrice',
    lastName: 'Chebet',
    fullName: 'Beatrice Chebet',
    grade: 'Grade 9',
    gender: 'F',
    academicYear: '2026',
    attendanceRate: 98,
    status: 'Active',
    photo: getAvatarUrl('F', 'Beatrice9'),
  },
  {
    id: 'l-142',
    admNo: '142',
    firstName: 'Gideon',
    lastName: 'Kipchirchir',
    fullName: 'Gideon Kipchirchir',
    grade: 'Grade 9',
    gender: 'M',
    academicYear: '2026',
    attendanceRate: 92,
    status: 'Active',
    photo: getAvatarUrl('M', 'Gideon9'),
  },
  {
    id: 'l-143',
    admNo: '143',
    firstName: 'Brenda',
    lastName: 'Chelangat',
    fullName: 'Brenda Chelangat',
    grade: 'Grade 9',
    gender: 'F',
    academicYear: '2026',
    attendanceRate: 95,
    status: 'Active',
    photo: getAvatarUrl('F', 'Brenda9'),
  },
  {
    id: 'l-144',
    admNo: '144',
    firstName: 'Ian',
    lastName: 'Kipkemoi',
    fullName: 'Ian Kipkemoi',
    grade: 'Grade 9',
    gender: 'M',
    academicYear: '2026',
    attendanceRate: 91,
    status: 'Active',
    photo: getAvatarUrl('M', 'Ian9'),
  },
  {
    id: 'l-145',
    admNo: '145',
    firstName: 'Vivian',
    lastName: 'Chepkemoi',
    fullName: 'Vivian Chepkemoi',
    grade: 'Grade 9',
    gender: 'F',
    academicYear: '2026',
    attendanceRate: 96,
    status: 'Active',
    photo: getAvatarUrl('F', 'Vivian9'),
  },
];

// Helper to determine CBC level from points 1 to 8
const getLevelFromPoints = (points: number): string => {
  switch (points) {
    case 8: return 'EE1';
    case 7: return 'EE2';
    case 6: return 'ME1';
    case 5: return 'ME2';
    case 4: return 'AE1';
    case 3: return 'AE2';
    case 2: return 'BE1';
    default: return 'BE2';
  }
};

// Generate realistic marks for Grade 8, Grade 7, Grade 9 learners
const generateInitialMarks = (): MarkEntry[] => {
  const result: MarkEntry[] = [];

  // Seeded subject performance baseline for Grade 8 learners
  const learnerProfiles: Record<string, number[]> = {
    'l-088': [8, 7, 7, 8, 7, 8, 8, 8, 7], // Chastern (68/72 - EE1)
    'l-092': [7, 7, 6, 7, 6, 7, 8, 7, 6], // Emmanuel (61/72 - EE2)
    'l-093': [8, 8, 8, 8, 7, 7, 7, 8, 8], // Faith (69/72 - EE1)
    'l-094': [5, 6, 5, 6, 5, 6, 5, 6, 5], // Brian (49/72 - ME2)
    'l-095': [8, 7, 8, 7, 8, 7, 8, 7, 8], // Mercy (68/72 - EE1)
    'l-096': [4, 5, 4, 5, 4, 5, 4, 5, 5], // Kelvin (41/72 - ME2)
    'l-097': [7, 6, 7, 6, 7, 8, 7, 6, 7], // Sharon (61/72 - EE2)
    'l-098': [6, 6, 5, 6, 6, 7, 7, 6, 6], // Dominic (55/72 - ME1)
    'l-099': [8, 8, 7, 7, 8, 7, 7, 8, 8], // Cynthia (68/72 - EE1)
    'l-100': [5, 5, 6, 5, 5, 6, 6, 5, 5], // Collins (48/72 - ME2)
    'l-101': [7, 7, 7, 6, 7, 7, 6, 8, 7], // Brenda (62/72 - EE2)
    'l-102': [6, 5, 6, 6, 5, 6, 6, 6, 5], // Geoffrey (51/72 - ME1)
    'l-103': [8, 8, 8, 8, 8, 7, 8, 8, 8], // Diana (71/72 - EE1)
    'l-104': [5, 6, 5, 5, 6, 5, 6, 5, 5], // Dennis (48/72 - ME2)
    'l-105': [7, 6, 7, 7, 6, 7, 6, 7, 7], // Mercy J (60/72 - EE2)
    // l-106 and l-107 will intentionally miss Mathematics in Term 3 to preserve "15 / 17 completed = 88%"
    'l-106': [null as any, 4, 5, 4, 5, 4, 5, 4, 5], // Victor Kipchirchir (Missing math)
    'l-107': [null as any, 6, 7, 6, 6, 6, 5, 7, 6], // Sheila Chebet (Missing math)
  };

  // Grade 8 marks for Term 3
  Object.entries(learnerProfiles).forEach(([lId, pointsList]) => {
    const lrn = INITIAL_LEARNERS.find(l => l.id === lId);
    if (!lrn) return;

    SUBJECTS.forEach((subj, idx) => {
      const pt = pointsList[idx];
      if (pt === null || pt === undefined) return; // Leave unentered for missing demo
      const lvl = getLevelFromPoints(pt);
      result.push({
        id: `m-${lrn.admNo}-${subj.slice(0, 4).toLowerCase()}-t3`,
        learnerId: lrn.id,
        admNo: lrn.admNo,
        grade: 'Grade 8',
        subject: subj,
        term: 'Term 3',
        academicYear: '2026',
        markOutOf72: pt * 8.5,
        points: pt,
        assessmentLevel: lvl,
        lastModifiedBy: SUBJECT_FACULTY[subj] || 'MR Bett Brian',
        lastModifiedAt: '2026-09-18 10:30',
      });
    });
  });

  // Grade 7 marks for Term 3
  const g7Learners = INITIAL_LEARNERS.filter(l => l.grade === 'Grade 7');
  g7Learners.forEach(lrn => {
    SUBJECTS.forEach((subj, i) => {
      const basePt = (i % 3 === 0 ? 7 : i % 2 === 0 ? 8 : 6);
      result.push({
        id: `m-${lrn.admNo}-${subj.slice(0, 4).toLowerCase()}-t3`,
        learnerId: lrn.id,
        admNo: lrn.admNo,
        grade: 'Grade 7',
        subject: subj,
        term: 'Term 3',
        academicYear: '2026',
        markOutOf72: basePt * 8.5,
        points: basePt,
        assessmentLevel: getLevelFromPoints(basePt),
        lastModifiedBy: SUBJECT_FACULTY[subj] || 'MR Bett Brian',
        lastModifiedAt: '2026-09-19 14:20',
      });
    });
  });

  // Grade 9 marks for Term 3
  const g9Learners = INITIAL_LEARNERS.filter(l => l.grade === 'Grade 9');
  g9Learners.forEach(lrn => {
    SUBJECTS.forEach((subj, i) => {
      const basePt = (i % 4 === 0 ? 8 : i % 2 === 0 ? 7 : 6);
      result.push({
        id: `m-${lrn.admNo}-${subj.slice(0, 4).toLowerCase()}-t3`,
        learnerId: lrn.id,
        admNo: lrn.admNo,
        grade: 'Grade 9',
        subject: subj,
        term: 'Term 3',
        academicYear: '2026',
        markOutOf72: basePt * 8.5,
        points: basePt,
        assessmentLevel: getLevelFromPoints(basePt),
        lastModifiedBy: SUBJECT_FACULTY[subj] || 'Madam Faith Chebet',
        lastModifiedAt: '2026-09-20 09:15',
      });
    });
  });

  return result;
};

export const INITIAL_MARKS: MarkEntry[] = generateInitialMarks();

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  {
    id: 'att-2026-09-21-g8',
    date: '2026-09-21',
    grade: 'Grade 8',
    term: 'Term 3',
    academicYear: '2026',
    submittedBy: 'MR Bett Brian',
    submittedAt: '2026-09-21 08:15',
    statuses: {
      'l-088': 'present',
      'l-092': 'present',
      'l-093': 'present',
      'l-094': 'late',
      'l-095': 'present',
      'l-096': 'absent',
      'l-097': 'present',
      'l-098': 'present',
      'l-099': 'present',
      'l-100': 'present',
      'l-101': 'present',
      'l-102': 'present',
      'l-103': 'present',
      'l-104': 'present',
      'l-105': 'present',
      'l-106': 'absent',
      'l-107': 'present',
    },
  },
  {
    id: 'att-2026-09-18-g8',
    date: '2026-09-18',
    grade: 'Grade 8',
    term: 'Term 3',
    academicYear: '2026',
    submittedBy: 'MR Bett Brian',
    submittedAt: '2026-09-18 08:10',
    statuses: {
      'l-088': 'present',
      'l-092': 'present',
      'l-093': 'present',
      'l-094': 'present',
      'l-095': 'present',
      'l-096': 'present',
      'l-097': 'present',
      'l-098': 'present',
      'l-099': 'present',
      'l-100': 'late',
      'l-101': 'present',
      'l-102': 'present',
      'l-103': 'present',
      'l-104': 'present',
      'l-105': 'present',
      'l-106': 'present',
      'l-107': 'present',
    },
  },
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Term 3 Marks Entry Deadline',
    message: 'All Junior Secondary School teachers must complete and verify Term 3 assessment marks on or before Friday, October 30, 2026 at 4:00 PM for official CBC report card generation and stamp authorization.',
    category: 'Marks deadline',
    date: '2026-09-19',
    author: 'Madam Faith Chebet (Academic Registrar)',
    isNew: true,
  },
  {
    id: 'ann-2',
    title: 'Staff Academic Review Meeting',
    message: 'Briefing for all Grade 7, Grade 8, and Grade 9 teachers in the Staff Common Room this Wednesday at 3:30 PM regarding CBC rubric evaluations and report cards.',
    category: 'Meeting notice',
    date: '2026-09-20',
    author: 'Principal Ezekiel Kipruto',
    isNew: true,
  },
  {
    id: 'ann-3',
    title: 'Ministry of Education Circular on JSS Capitation',
    message: 'Please review the updated guidelines for laboratory consumables and learning resources now uploaded in the Document Centre under Circulars.',
    category: 'Important notice',
    date: '2026-09-15',
    author: 'School Administration',
    isNew: false,
  },
  {
    id: 'ann-4',
    title: 'Term 3 Inter-Classes Science & Innovation Expo',
    message: 'Integrated Science and Pre-Technical teachers are requested to guide learners on their final project presentations scheduled for next week.',
    category: 'Academic reminder',
    date: '2026-09-12',
    author: 'Science Department',
    isNew: false,
  },
];

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'cal-1',
    title: 'Term 3 Opening Date',
    category: 'Term dates',
    startDate: '2026-08-25',
    description: 'All learners reported for Term 3 academic session.',
  },
  {
    id: 'cal-2',
    title: 'Term 3 Continuous Assessment Week',
    category: 'Examinations',
    startDate: '2026-09-28',
    endDate: '2026-10-02',
    description: 'Standardized continuous assessment across all 9 JSS learning areas.',
  },
  {
    id: 'cal-3',
    title: 'Staff Academic Planning Session',
    category: 'Staff meetings',
    startDate: '2026-10-14',
    description: 'Review of assessment rubric levels and learner intervention plans.',
  },
  {
    id: 'cal-4',
    title: 'Term 3 Marks System Lock & Verification',
    category: 'Important deadlines',
    startDate: '2026-10-30',
    description: 'Final submission deadline for all subject teachers.',
  },
  {
    id: 'cal-5',
    title: 'Term 3 Closing Day & Report Collection',
    category: 'Term dates',
    startDate: '2026-11-13',
    description: 'Parents consultative meeting and issuance of authenticated CBC report cards.',
  },
];

export const INITIAL_DOCUMENTS: SchoolDocument[] = [
  {
    id: 'doc-1',
    title: '2026 Term 3 Master Timetable (Grade 7, 8, 9)',
    category: 'Timetables',
    fileName: 'Reberwet_JSS_Master_Timetable_T3_2026.pdf',
    fileSize: '412 KB',
    dateUploaded: '2026-08-26',
    uploadedBy: 'Madam Faith Chebet',
    authorizedRoles: ['teacher', 'school_admin', 'super_admin'],
    status: 'Active',
  },
  {
    id: 'doc-2',
    title: 'Grade 8 Mathematics Scheme of Work (Approved)',
    category: 'Schemes of work',
    fileName: 'Grade8_Mathematics_Scheme_T3.pdf',
    fileSize: '820 KB',
    dateUploaded: '2026-08-27',
    uploadedBy: 'MR Bett Brian',
    authorizedRoles: ['teacher', 'school_admin', 'super_admin'],
    status: 'Active',
  },
  {
    id: 'doc-3',
    title: 'Reberwet JSS Code of Conduct & Learner Policy',
    category: 'School policies',
    fileName: 'Reberwet_School_Policy_Manual_2026.pdf',
    fileSize: '1.2 MB',
    dateUploaded: '2026-01-10',
    uploadedBy: 'Principal Ezekiel Kipruto',
    authorizedRoles: ['teacher', 'school_admin', 'super_admin'],
    status: 'Active',
  },
  {
    id: 'doc-4',
    title: 'CBC Assessment Level & Rubric Guidelines (KNEC)',
    category: 'Examination documents',
    fileName: 'KNEC_JSS_Assessment_Rubric_72Points.pdf',
    fileSize: '950 KB',
    dateUploaded: '2026-08-28',
    uploadedBy: 'Madam Faith Chebet',
    authorizedRoles: ['teacher', 'school_admin', 'super_admin'],
    status: 'Active',
  },
  {
    id: 'doc-5',
    title: 'MoE Circular on JSS Capitation & Co-Curricular',
    category: 'Circulars',
    fileName: 'MoE_Circular_JSS_Capitation_2026.pdf',
    fileSize: '340 KB',
    dateUploaded: '2026-09-01',
    uploadedBy: 'Principal Ezekiel Kipruto',
    authorizedRoles: ['teacher', 'school_admin', 'super_admin'],
    status: 'Active',
  },
  {
    id: 'doc-6',
    title: 'Pre-Technical Studies Workshop Safety Rules',
    category: 'Teaching resources',
    fileName: 'PreTech_Workshop_Safety_Protocols.pdf',
    fileSize: '650 KB',
    dateUploaded: '2026-08-30',
    uploadedBy: 'MR Bett Brian',
    authorizedRoles: ['teacher', 'school_admin', 'super_admin'],
    status: 'Active',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-1',
    user: 'MR Bett Brian',
    userRole: 'teacher',
    action: 'Entered Mathematics marks for Grade 8',
    date: '2026-09-18',
    time: '10:45 AM',
    recordAffected: 'Grade 8 - Mathematics (Term 3)',
    details: 'Saved marks for 15 learners out of 72 points.',
  },
  {
    id: 'audit-2',
    user: 'Madam Faith Chebet',
    userRole: 'school_admin',
    action: 'Updated learner profile for Chastern Kiprotich',
    date: '2026-09-18',
    time: '11:15 AM',
    recordAffected: 'Chastern Kiprotich (ADM 088)',
    details: 'Verified photo and guardian phone number.',
  },
  {
    id: 'audit-3',
    user: 'Principal Ezekiel Kipruto',
    userRole: 'super_admin',
    action: 'Approved Term 3 Assessment Rubric Guidelines',
    date: '2026-08-26',
    time: '09:30 AM',
    recordAffected: 'School Academic Policy',
    details: 'Ratified 1-8 points scale (total 72) for CBC report cards.',
  },
  {
    id: 'audit-4',
    user: 'MR Bett Brian',
    userRole: 'teacher',
    action: 'Submitted Attendance for Grade 8',
    date: '2026-09-21',
    time: '08:15 AM',
    recordAffected: 'Daily Attendance Register',
    details: 'Marked 15 present, 1 late, 1 absent.',
  },
];

export const INITIAL_TEACHER_ACTIVITIES: TeacherActivity[] = [
  {
    id: 'act-1',
    action: 'Marks entered for Grade 8 Mathematics (15 learners completed)',
    time: 'Today, 10:45 AM',
    category: 'marks',
  },
  {
    id: 'act-2',
    action: 'Attendance submitted for Grade 8 (17 learners)',
    time: 'Today, 08:15 AM',
    category: 'attendance',
  },
  {
    id: 'act-3',
    action: 'Report card previewed for Chastern Kiprotich (ADM 088)',
    time: 'Yesterday, 04:20 PM',
    category: 'report',
  },
  {
    id: 'act-4',
    action: 'Viewed Master Timetable Term 3',
    time: 'Sep 18, 09:10 AM',
    category: 'document',
  },
];

export const COMMENT_TEMPLATES = [
  'Demonstrates outstanding grasp of concepts and actively supports peers.',
  'Shows consistent improvement in analytical thinking and problem solving.',
  'Satisfactorily attains core competencies; encouraged to practice regularly.',
  'Good potential shown; needs to focus on timely completion of assignments.',
  'Polite and disciplined learner who participates effectively in group work.',
  'Making steady progress; recommended for targeted guidance in difficult topics.',
  'Diligent and attentive learner with commendable enthusiasm for learning.',
];

export const HISTORICAL_LEARNER_PERFORMANCE: Record<string, {
  currentTerm: Array<{ subject: string; mark: number; level: string; points: number }>;
  previousTerm: Array<{ subject: string; mark: number; level: string; points: number }>;
  previousYear: Array<{ subject: string; mark: number; level: string; points: number }>;
}> = {
  'lrn-088': {
    currentTerm: [
      { subject: 'Mathematics', mark: 66, level: 'EE1', points: 8 },
      { subject: 'English', mark: 61, level: 'EE2', points: 7 },
      { subject: 'Kiswahili', mark: 59, level: 'EE2', points: 7 },
      { subject: 'Integrated Science', mark: 64, level: 'EE1', points: 8 },
      { subject: 'Social Studies', mark: 58, level: 'EE2', points: 7 },
      { subject: 'Agriculture & Nutrition', mark: 60, level: 'EE2', points: 7 },
      { subject: 'Pre-Technical Studies', mark: 62, level: 'EE2', points: 7 },
      { subject: 'CRE (Religious Education)', mark: 65, level: 'EE1', points: 8 },
      { subject: 'Creative Arts & Sports', mark: 63, level: 'EE2', points: 7 },
    ],
    previousTerm: [
      { subject: 'Mathematics', mark: 60, level: 'EE2', points: 7 },
      { subject: 'English', mark: 56, level: 'ME1', points: 6 },
      { subject: 'Kiswahili', mark: 54, level: 'ME1', points: 6 },
      { subject: 'Integrated Science', mark: 59, level: 'EE2', points: 7 },
      { subject: 'Social Studies', mark: 52, level: 'ME1', points: 6 },
      { subject: 'Agriculture & Nutrition', mark: 55, level: 'ME1', points: 6 },
      { subject: 'Pre-Technical Studies', mark: 58, level: 'EE2', points: 7 },
      { subject: 'CRE (Religious Education)', mark: 61, level: 'EE2', points: 7 },
      { subject: 'Creative Arts & Sports', mark: 57, level: 'ME1', points: 6 },
    ],
    previousYear: [
      { subject: 'Mathematics', mark: 55, level: 'ME1', points: 6 },
      { subject: 'English', mark: 52, level: 'ME1', points: 6 },
      { subject: 'Kiswahili', mark: 50, level: 'ME1', points: 6 },
      { subject: 'Integrated Science', mark: 54, level: 'ME1', points: 6 },
      { subject: 'Social Studies', mark: 48, level: 'ME2', points: 5 },
      { subject: 'Agriculture & Nutrition', mark: 51, level: 'ME1', points: 6 },
      { subject: 'Pre-Technical Studies', mark: 53, level: 'ME1', points: 6 },
      { subject: 'CRE (Religious Education)', mark: 56, level: 'ME1', points: 6 },
      { subject: 'Creative Arts & Sports', mark: 52, level: 'ME1', points: 6 },
    ],
  },
};

