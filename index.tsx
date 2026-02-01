
import React, { useState, useMemo, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Users, 
  Calendar, 
  Clock, 
  AlertCircle,
  X,
  Info,
  GripVertical,
  Plus,
  Trash2,
  Settings2,
  Pencil,
  RotateCcw,
  LayoutDashboard,
  UserCheck,
  Zap,
  Search,
  Star,
  MousePointer2,
  Save,
  Check,
  CheckCircle2,
  XCircle,
  Download,
  FileText
} from 'lucide-react';

// --- Types ---
interface TimeRange {
  start: string;
  end: string;
  title?: string;
}

interface Student {
  id: string;
  name: string;
  unavailable: Record<string, TimeRange[]>; 
  preferences: Record<string, TimeRange[]>;
}

type MentoringStatus = 'PENDING' | 'DONE' | 'MISSED';

interface Assignment {
  studentId: string;
  day: string;
  startTime: string;
  status: MentoringStatus;
  reason?: string;
}

interface TeacherSchedule {
  start: string;
  end: string;
}

// --- Constants ---
const DAY_LABELS: Record<string, string> = {
  Monday: '월', Tuesday: '화', Wednesday: '수', Thursday: '목', Friday: '금', Saturday: '토', Sunday: '일'
};

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const INITIAL_TEACHER_SCHEDULE: Record<string, TeacherSchedule> = {
  Tuesday: { start: '13:30', end: '16:30' },
  Friday: { start: '13:30', end: '17:30' },
  Saturday: { start: '09:00', end: '12:00' },
};

const INITIAL_STUDENTS: Student[] = [
  { "id": "s26", "name": "공지원(26)", "unavailable": { "Tuesday": [{ "start": "17:40", "end": "22:00", "title": "수학학원" }], "Thursday": [{ "start": "18:20", "end": "22:00", "title": "수학학원" }], "Friday": [{ "start": "17:20", "end": "19:30", "title": "영어학원" }], "Saturday": [{ "start": "12:50", "end": "14:30", "title": "영어학원" }] }, "preferences": {} },
  { "id": "s68", "name": "곽민기(68)", "unavailable": { "Monday": [{ "start": "16:00", "end": "18:50", "title": "수학과외" }], "Tuesday": [{ "start": "17:40", "end": "22:00", "title": "영어과외" }], "Wednesday": [{ "start": "16:00", "end": "22:00", "title": "수학과외, 국어학원" }], "Thursday": [{ "start": "17:40", "end": "22:00", "title": "영어과외" }], "Friday": [{ "start": "19:00", "end": "22:00", "title": "국어학원" }] }, "preferences": {} },
  { "id": "s108", "name": "김민겸(108)", "unavailable": {}, "preferences": {} },
  { "id": "s87", "name": "김지후(87)", "unavailable": { "Monday": [{ "start": "19:00", "end": "22:00", "title": "영어과외" }], "Thursday": [{ "start": "19:00", "end": "22:00", "title": "수학과외" }], "Friday": [{ "start": "19:00", "end": "22:00", "title": "영어과외" }], "Saturday": [{ "start": "16:00", "end": "22:00", "title": "수학과외" }] }, "preferences": {} },
  { "id": "s40", "name": "김하은(40)", "unavailable": { "Monday": [{ "start": "15:00", "end": "18:00", "title": "수학과외" }], "Tuesday": [{ "start": "18:00", "end": "22:00", "title": "수학학원" }], "Thursday": [{ "start": "18:00", "end": "22:00", "title": "수학학원" }] }, "preferences": {} },
  { "id": "s29", "name": "박수빈(29)", "unavailable": { "Monday": [{ "start": "18:40", "end": "22:00", "title": "수학학원" }], "Tuesday": [{ "start": "13:30", "end": "15:40", "title": "수학특강" }], "Wednesday": [{ "start": "18:40", "end": "22:00", "title": "수학학원" }], "Thursday": [{ "start": "13:30", "end": "15:40", "title": "수학특강" }], "Friday": [{ "start": "18:40", "end": "22:00", "title": "수학학원" }] }, "preferences": {} },
  { "id": "s64", "name": "박지오(64)", "unavailable": { "Monday": [{ "start": "14:50", "end": "18:00", "title": "영어학원" }], "Wednesday": [{ "start": "10:30", "end": "22:00", "title": "수학학원" }], "Friday": [{ "start": "10:30", "end": "22:00", "title": "수학학원, 영어학원" }], "Saturday": [{ "start": "10:30", "end": "22:00", "title": "수학학원, 국어학원" }] }, "preferences": {} },
  { "id": "s46", "name": "변지원(46)", "unavailable": {}, "preferences": {} },
  { "id": "s45", "name": "서지아(45)", "unavailable": { "Tuesday": [{ "start": "13:30", "end": "17:40", "title": "수학학원" }], "Wednesday": [{ "start": "19:00", "end": "22:00", "title": "영어학원" }], "Thursday": [{ "start": "13:30", "end": "17:40", "title": "수학학원" }], "Friday": [{ "start": "19:00", "end": "22:00", "title": "영어학원" }], "Saturday": [{ "start": "13:30", "end": "22:00", "title": "수학학원" }] }, "preferences": {} },
  { "id": "s78", "name": "신효원(78)", "unavailable": { "Monday": [{ "start": "14:35", "end": "22:00", "title": "병원" }], "Tuesday": [{ "start": "16:00", "end": "22:00", "title": "수학학원" }], "Thursday": [{ "start": "17:40", "end": "22:00", "title": "과외" }], "Saturday": [{ "start": "08:40", "end": "22:00", "title": "수학학원" }] }, "preferences": {} },
  { "id": "s82", "name": "유진이(82)", "unavailable": { "Monday": [{ "start": "19:20", "end": "22:00", "title": "수학학원" }], "Wednesday": [{ "start": "19:20", "end": "22:00", "title": "수학학원" }], "Thursday": [{ "start": "13:30", "end": "16:00", "title": "영어학원" }], "Friday": [{ "start": "19:20", "end": "22:00", "title": "수학학원" }], "Saturday": [{ "start": "13:30", "end": "16:00", "title": "영어학원" }] }, "preferences": {} },
  { "id": "s77", "name": "유채민(77)", "unavailable": { "Monday": [{ "start": "19:00", "end": "22:00", "title": "수학학원" }], "Tuesday": [{ "start": "19:00", "end": "22:00", "title": "영어학원" }], "Thursday": [{ "start": "19:00", "end": "22:00", "title": "수학학원" }], "Friday": [{ "start": "19:00", "end": "22:00", "title": "국어학원" }] }, "preferences": {} },
  { "id": "s63", "name": "윤주찬(63)", "unavailable": { "Monday": [{ "start": "16:00", "end": "22:00", "title": "수학학원, 영어학원" }], "Tuesday": [{ "start": "19:30", "end": "22:00", "title": "영어학원" }], "Wednesday": [{ "start": "17:30", "end": "22:00", "title": "수학학원, 국어학원" }], "Friday": [{ "start": "19:30", "end": "22:00", "title": "국어학원" }], "Saturday": [{ "start": "12:00", "end": "22:00", "title": "수학학원, 영어학원" }] }, "preferences": {} },
  { "id": "s88", "name": "이수현(88)", "unavailable": { "Wednesday": [{ "start": "17:40", "end": "22:00", "title": "수학학원" }], "Thursday": [{ "start": "17:40", "end": "22:00", "title": "영어학원" }], "Friday": [{ "start": "17:40", "end": "22:00", "title": "수학학원" }], "Saturday": [{ "start": "17:40", "end": "22:00", "title": "국어학원" }] }, "preferences": {} },
  { "id": "s65", "name": "이수호(65)", "unavailable": { "Monday": [{ "start": "18:00", "end": "21:00", "title": "영어학원" }], "Wednesday": [{ "start": "18:00", "end": "21:00", "title": "영어학원" }], "Thursday": [{ "start": "20:30", "end": "22:00", "title": "영어학원" }], "Friday": [{ "start": "17:30", "end": "22:00", "title": "국어학원" }], "Sunday": [{ "start": "18:00", "end": "21:00", "title": "영어학원" }] }, "preferences": {} },
  { "id": "s18", "name": "임준영(18)", "unavailable": { "Monday": [{ "start": "15:50", "end": "20:00", "title": "수학학원" }], "Wednesday": [{ "start": "16:50", "end": "22:00", "title": "수학학원" }], "Saturday": [{ "start": "13:00", "end": "16:30", "title": "수학학원" }] }, "preferences": {} },
  { "id": "s42", "name": "조서형(42)", "unavailable": { "Tuesday": [{ "start": "18:30", "end": "22:00", "title": "영어학원" }], "Thursday": [{ "start": "18:30", "end": "22:00", "title": "영어학원" }] }, "preferences": {} },
  { "id": "s59", "name": "한서준(59)", "unavailable": { "Tuesday": [{ "start": "19:30", "end": "22:00", "title": "영어학원" }], "Saturday": [{ "start": "12:00", "end": "16:00", "title": "영어학원" }] }, "preferences": {} },
  { "id": "s107", "name": "한승무(107)", "unavailable": {}, "preferences": {} },
  { "id": "s55", "name": "현우석(55)", "unavailable": { "Monday": [{ "start": "20:50", "end": "22:00", "title": "과외" }], "Tuesday": [{ "start": "20:50", "end": "22:00", "title": "국어학원" }], "Wednesday": [{ "start": "20:50", "end": "22:00", "title": "과외" }], "Thursday": [{ "start": "20:50", "end": "22:00", "title": "국어학원" }] }, "preferences": {} }
];

// --- Utils ---
const timeToMin = (time: string) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

const minToTime = (min: number) => {
  const h = Math.floor(min / 60).toString().padStart(2, '0');
  const m = (min % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

const isOverlapping = (start1: number, end1: number, start2: number, end2: number) => {
  return Math.max(start1, start2) < Math.min(end1, end2);
};

export function StudentScheduler() {
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('mentoring_students_v5');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });
  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem('mentoring_assignments_v5');
    return saved ? JSON.parse(saved) : [];
  });
  const [teacherSchedule, setTeacherSchedule] = useState<Record<string, TeacherSchedule>>(() => {
    const saved = localStorage.getItem('mentoring_teacher_v5');
    return saved ? JSON.parse(saved) : INITIAL_TEACHER_SCHEDULE;
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [draggingStudentId, setDraggingStudentId] = useState<string | null>(null);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(students[0]?.id || "");
  const [isSavedVisual, setIsSavedVisual] = useState(false);

  const [editTDay, setEditTDay] = useState('Monday');
  const [editTStart, setEditTStart] = useState('13:30');
  const [editTEnd, setEditTEnd] = useState('17:30');

  const [newDay, setNewDay] = useState('Monday');
  const [newStart, setNewStart] = useState('14:00');
  const [newEnd, setNewEnd] = useState('16:00');
  const [newTitle, setNewTitle] = useState('');
  const [editMode, setEditMode] = useState<'UNAVAILABLE' | 'PREFERENCE'>('UNAVAILABLE');

  // Persistence
  useEffect(() => {
    localStorage.setItem('mentoring_students_v5', JSON.stringify(students));
    localStorage.setItem('mentoring_assignments_v5', JSON.stringify(assignments));
    localStorage.setItem('mentoring_teacher_v5', JSON.stringify(teacherSchedule));
    setIsSavedVisual(true);
    const timer = setTimeout(() => setIsSavedVisual(false), 2000);
    return () => clearTimeout(timer);
  }, [students, assignments, teacherSchedule]);

  const slotsByDay = useMemo(() => {
    const result: Record<string, string[]> = {};
    Object.entries(teacherSchedule).forEach(([day, range]) => {
      const slots = [];
      let current = timeToMin(range.start);
      const end = timeToMin(range.end);
      while (current + 30 <= end) {
        slots.push(minToTime(current));
        current += 30;
      }
      result[day] = slots;
    });
    return result;
  }, [teacherSchedule]);

  const teacherDays = useMemo(() => {
    return Object.keys(teacherSchedule).sort((a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b));
  }, [teacherSchedule]);

  const selectedStudent = useMemo(() => students.find(s => s.id === selectedStudentId), [students, selectedStudentId]);

  const getStudentById = (id: string) => students.find(s => s.id === id);

  const checkSlotStatus = (studentId: string, day: string, startTime: string) => {
    const student = getStudentById(studentId);
    if (!student) return { status: 'NONE' as const, reason: null };
    const startMin = timeToMin(startTime);
    const endMin = startMin + 30;

    const unavailableConflict = (student.unavailable[day] || []).find(range => isOverlapping(startMin, endMin, timeToMin(range.start), timeToMin(range.end)));
    if (unavailableConflict) return { status: 'CONFLICT' as const, reason: unavailableConflict.title };

    const preferenceMatch = (student.preferences[day] || []).find(range => isOverlapping(startMin, endMin, timeToMin(range.start), timeToMin(range.end)));
    if (preferenceMatch) return { status: 'PREFERRED' as const, reason: '선호' };

    return { status: 'AVAILABLE' as const, reason: null };
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggingStudentId(id);
    e.dataTransfer.setData('studentId', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent, day: string, startTime: string) => {
    e.preventDefault();
    const studentId = e.dataTransfer.getData('studentId');
    if (!studentId) return;

    const { status } = checkSlotStatus(studentId, day, startTime);
    const isOccupied = assignments.some(a => a.day === day && a.startTime === startTime && a.studentId !== studentId);

    if (status !== 'CONFLICT' && !isOccupied) {
      setAssignments(prev => {
        const filtered = prev.filter(a => a.studentId !== studentId);
        return [...filtered, { studentId, day, startTime, status: 'PENDING' }];
      });
    }
  };

  const autoAssign = () => {
    let current = [...assignments];
    const unassignedStudents = students.filter(s => !current.some(a => a.studentId === s.id));
    
    unassignedStudents.forEach(student => {
      let assigned = false;
      outer: for (const day of teacherDays) {
        for (const time of (slotsByDay[day] || [])) {
          const { status } = checkSlotStatus(student.id, day, time);
          const isOccupied = current.some(a => a.day === day && a.startTime === time);
          if (status === 'PREFERRED' && !isOccupied) {
            current.push({ studentId: student.id, day, startTime: time, status: 'PENDING' });
            assigned = true;
            break outer;
          }
        }
      }
      if (!assigned) {
        outer2: for (const day of teacherDays) {
          for (const time of (slotsByDay[day] || [])) {
            const { status } = checkSlotStatus(student.id, day, time);
            const isOccupied = current.some(a => a.day === day && a.startTime === time);
            if (status === 'AVAILABLE' && !isOccupied) {
              current.push({ studentId: student.id, day, startTime: time, status: 'PENDING' });
              assigned = true;
              break outer2;
            }
          }
        }
      }
    });
    setAssignments(current);
  };

  // FIXED: Ensure resetAllAssignments logic is bulletproof and updates state immediately
  const resetAllAssignments = (e?: React.MouseEvent) => {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    const confirmed = window.confirm("배정된 모든 학생을 목록으로 되돌리시겠습니까?");
    if (confirmed) {
      setAssignments([]);
    }
  };

  const updateAssignmentStatus = (day: string, startTime: string) => {
    setAssignments(prev => prev.map(a => {
      if (a.day === day && a.startTime === startTime) {
        const statuses: MentoringStatus[] = ['PENDING', 'DONE', 'MISSED'];
        const nextIdx = (statuses.indexOf(a.status) + 1) % statuses.length;
        return { ...a, status: statuses[nextIdx], reason: statuses[nextIdx] === 'MISSED' ? '' : undefined };
      }
      return a;
    }));
  };

  const updateMissedReason = (day: string, startTime: string, reason: string) => {
    setAssignments(prev => prev.map(a => {
      if (a.day === day && a.startTime === startTime) return { ...a, reason };
      return a;
    }));
  };

  const deleteStudentEntry = (type: 'UNAVAILABLE' | 'PREFERENCE', day: string, index: number) => {
    setStudents(prev => prev.map(s => {
      if (s.id !== selectedStudentId) return s;
      const key = type === 'UNAVAILABLE' ? 'unavailable' : 'preferences';
      const section = s[key];
      const dayEntries = section[day];
      if (!dayEntries) return s;
      const newDayEntries = dayEntries.filter((_, i) => i !== index);
      const newSection = { ...section };
      if (newDayEntries.length > 0) newSection[day] = newDayEntries;
      else delete newSection[day];
      return { ...s, [key]: newSection };
    }));
  };

  const exportData = () => {
    const data = { students, assignments, teacherSchedule };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mentoring_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // FIXED: Correct unassigned filtering logic to properly handle search independently from assignment check
  const unassigned = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase());
      const isNotAssigned = !assignments.some(a => a.studentId === s.id);
      return matchesSearch && isNotAssigned;
    });
  }, [students, assignments, searchQuery]);

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans text-slate-900 overflow-hidden select-none">
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-xl z-30">
        <div className="p-7 bg-indigo-700 text-white shadow-lg relative overflow-hidden">
          <div className="flex items-center gap-3 mb-1 relative z-10">
            <LayoutDashboard size={24} className="text-indigo-200" />
            <h1 className="text-xl font-black tracking-tighter">주간 멘토링 Pro v5</h1>
          </div>
          <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-[0.2em] relative z-10">Mentoring Results Tracker</p>
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
        </div>

        <div className="p-5 space-y-5 flex-1 overflow-y-auto custom-scrollbar">
          <div className="flex flex-col gap-2">
            <button onClick={() => setIsManageModalOpen(true)} className="w-full py-3.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-2xl flex items-center justify-center gap-2 text-indigo-700 font-black text-sm transition-all shadow-sm">
              <Settings2 size={18} /> 학생 정보 관리
            </button>
            <button onClick={autoAssign} className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 rounded-2xl flex items-center justify-center gap-2 text-white font-black text-sm shadow-lg transition-all active:scale-95">
              <Zap size={18} /> 스마트 자동 배정
            </button>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={exportData} className="py-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-600 font-bold text-xs transition-all shadow-sm">
                <Download size={14} /> 데이터 백업
              </button>
              {/* FIXED: resetAllAssignments trigger */}
              <button type="button" onClick={resetAllAssignments} className="py-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-2xl flex items-center justify-center gap-2 text-rose-600 font-bold text-xs transition-all shadow-sm">
                <RotateCcw size={14} /> 배정 초기화
              </button>
            </div>
          </div>

          <div className="relative group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
             <input type="text" placeholder="학생 이름 검색..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
               className="w-full bg-slate-100 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl py-3 pl-11 pr-4 text-sm font-semibold transition-all outline-none" />
          </div>

          <section>
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 px-1 mb-4">
              <Users size={14} /> 미배정 학생 ({unassigned.length})
            </h2>
            <div className="grid gap-2">
              {unassigned.map(s => (
                <div key={s.id} draggable onDragStart={(e) => handleDragStart(e, s.id)} onDragEnd={() => setDraggingStudentId(null)}
                  className="bg-white border-2 border-slate-100 p-4 rounded-2xl cursor-grab active:cursor-grabbing hover:border-indigo-400 hover:shadow-xl transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <GripVertical size={16} className="text-slate-300 group-hover:text-indigo-500" />
                    <span className="font-black text-slate-700 text-sm tracking-tight">{s.name}</span>
                  </div>
                  {Object.keys(s.preferences).length > 0 && <Star size={14} className="text-amber-500 fill-amber-500" />}
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="p-6 bg-slate-900 text-white m-5 rounded-[2rem] shadow-2xl border border-slate-800">
           <div className="flex items-center justify-between mb-4">
             <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2"><Calendar size={14} /> 내 근무 요일</h3>
             <button onClick={() => setIsTeacherModalOpen(true)} className="p-2 bg-indigo-500/20 hover:bg-indigo-500/40 rounded-xl transition-all text-indigo-300"><Pencil size={14}/></button>
           </div>
           <div className="space-y-2 text-[12px]">
             {teacherDays.map(day => (
               <div key={day} className="flex justify-between items-center bg-slate-800/50 p-2.5 rounded-xl border border-slate-800">
                 <span className="text-indigo-200 font-black">{DAY_LABELS[day]}요일</span>
                 <span className="text-slate-400 font-medium tracking-tighter">{teacherSchedule[day].start} - {teacherSchedule[day].end}</span>
               </div>
             ))}
           </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative overflow-hidden">
        {isSavedVisual && (
          <div className="absolute top-24 right-10 z-50 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-emerald-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 font-bold text-xs">
              <Check size={14} strokeWidth={3} /> 실시간 저장 완료
            </div>
          </div>
        )}

        <header className="h-20 bg-white border-b border-slate-200 px-10 flex items-center justify-between shadow-sm z-20">
          <div className="flex items-center gap-4">
             <div className="bg-indigo-100 text-indigo-600 p-3 rounded-2xl shadow-inner"><Clock size={24} strokeWidth={2.5}/></div>
             <h2 className="text-2xl font-black text-slate-800 tracking-tight">주간 멘토링 현황판</h2>
          </div>
          <div className="flex items-center gap-10">
             <div className="flex gap-6">
                <div className="flex items-center gap-2.5 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <div className="w-4 h-4 bg-rose-500 rounded-lg shadow-lg shadow-rose-200" /> 불가능
                </div>
                <div className="flex items-center gap-2.5 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <div className="w-4 h-4 bg-emerald-500 rounded-lg shadow-lg shadow-emerald-200" /> 선호시간
                </div>
                <div className="flex items-center gap-2.5 text-[10px] font-black text-slate-400 uppercase tracking-wider">
                  <div className="w-4 h-4 bg-blue-500 rounded-lg shadow-lg shadow-blue-200" /> 가능시간
                </div>
             </div>
             <div className="text-right">
               <span className="text-[10px] font-black text-slate-400 block uppercase tracking-widest mb-0.5">배정 진행도</span>
               <span className="text-2xl font-black text-indigo-600 tabular-nums">{assignments.length} <span className="text-slate-300 text-sm">/ {students.length}</span></span>
             </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-slate-50/50">
          <div className="max-w-[1500px] mx-auto bg-white rounded-[3rem] shadow-xl border border-slate-200 overflow-hidden">
            <div className={`grid bg-slate-50 border-b border-slate-200`} style={{ gridTemplateColumns: `repeat(${teacherDays.length || 1}, 1fr)` }}>
              {teacherDays.map(day => (
                <div key={day} className="py-8 text-center border-r border-slate-200 last:border-r-0">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest block mb-1">{day}</span>
                  <span className="text-2xl font-black text-slate-800">{DAY_LABELS[day]}요일</span>
                </div>
              ))}
              {teacherDays.length === 0 && <div className="py-20 text-center col-span-full text-slate-400 font-bold">근무 요일을 먼저 추가해주세요.</div>}
            </div>

            <div className={`grid min-h-[900px] bg-white`} style={{ gridTemplateColumns: `repeat(${teacherDays.length || 1}, 1fr)` }}>
              {teacherDays.map(day => (
                <div key={day} className="p-5 space-y-6 border-r border-slate-100 last:border-r-0">
                  {(slotsByDay[day] || []).map(time => {
                    const assign = assignments.find(a => a.day === day && a.startTime === time);
                    const student = assign ? getStudentById(assign.studentId) : null;
                    const { status, reason } = draggingStudentId ? checkSlotStatus(draggingStudentId, day, time) : { status: 'NONE', reason: null };
                    const isOccupied = draggingStudentId ? !!assignments.find(a => a.day === day && a.startTime === time && a.studentId !== draggingStudentId) : false;

                    const isConflict = draggingStudentId && (status === 'CONFLICT' || isOccupied);
                    const isPref = draggingStudentId && status === 'PREFERRED' && !isOccupied;
                    const isNormal = draggingStudentId && status === 'AVAILABLE' && !isOccupied;

                    // Results status
                    const isDone = assign?.status === 'DONE';
                    const isMissed = assign?.status === 'MISSED';

                    return (
                      <div key={time} onDragOver={e => e.preventDefault()} onDrop={e => handleDrop(e, day, time)}
                        className={`relative min-h-[140px] p-6 rounded-[2.5rem] border-2 transition-all duration-300 flex flex-col justify-center items-center group
                          ${student ? 'bg-indigo-50 border-indigo-500 shadow-lg ring-4 ring-indigo-500/5' : 'border-dashed border-slate-200 bg-slate-50/30'}
                          ${isPref ? 'bg-emerald-50 border-emerald-500 border-solid ring-8 ring-emerald-500/10' : ''}
                          ${isNormal ? 'bg-blue-50 border-blue-500 border-solid ring-8 ring-blue-500/10' : ''}
                          ${isConflict ? 'bg-rose-100 border-rose-500 border-solid ring-8 ring-rose-500/10' : ''}
                        `}>
                        <span className={`absolute top-5 left-7 text-[10px] font-black tracking-tighter ${student ? 'text-indigo-400' : 'text-slate-300'}`}>{time}</span>
                        
                        {student ? (
                          <div draggable onDragStart={(e) => handleDragStart(e, student.id)} onDragEnd={() => setDraggingStudentId(null)}
                            className="w-full flex flex-col items-center gap-3 cursor-grab active:cursor-grabbing">
                            <div className="flex items-center gap-2">
                              {isDone && <CheckCircle2 size={16} className="text-emerald-500" />}
                              {isMissed && <XCircle size={16} className="text-rose-500" />}
                              <span className={`text-lg font-black tracking-tight ${isDone ? 'line-through text-slate-400' : 'text-slate-800'}`}>{student.name}</span>
                            </div>
                            
                            <div className="flex gap-2">
                               <button onClick={() => updateAssignmentStatus(day, time)} 
                                 className={`px-3 py-1.5 rounded-full text-[10px] font-black transition-all shadow-sm
                                   ${isDone ? 'bg-emerald-500 text-white' : isMissed ? 'bg-rose-500 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}
                                 `}>
                                 {assign?.status === 'PENDING' ? '결과 체크' : assign?.status === 'DONE' ? '완료' : '미진행'}
                               </button>
                               <button onClick={() => setAssignments(prev => prev.filter(a => a.studentId !== student.id))}
                                 className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-white rounded-full transition-all border border-transparent shadow-sm">
                                 <X size={14} />
                               </button>
                            </div>

                            {isMissed && (
                              <input type="text" placeholder="미진행 사유 입력..." value={assign.reason || ''} onChange={e => updateMissedReason(day, time, e.target.value)}
                                className="w-full mt-2 bg-white border border-rose-200 rounded-xl px-3 py-2 text-[11px] font-bold focus:border-rose-500 outline-none text-rose-700" />
                            )}
                          </div>
                        ) : (
                          <div className={`text-center transition-all mt-3 ${draggingStudentId ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                            {isConflict ? (
                              <div className="text-rose-600 flex flex-col items-center gap-1.5 font-black">
                                <AlertCircle size={24} />
                                <span className="text-[10px] font-black uppercase">{reason || '중복'}</span>
                              </div>
                            ) : isPref ? (
                              <div className="text-emerald-600 flex flex-col items-center gap-1.5 font-black animate-bounce">
                                <Star size={24} className="fill-emerald-500" />
                                <span className="text-[10px] font-black uppercase">추천</span>
                              </div>
                            ) : (
                              <div className={`${isNormal ? 'text-blue-600' : 'text-slate-400'} flex flex-col items-center gap-1.5 font-black`}>
                                <Plus size={24} strokeWidth={3} />
                                <span className="text-[10px] uppercase font-black">배정</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Teacher Modal */}
      {isTeacherModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
             <div className="bg-slate-800 p-10 text-white flex justify-between items-center shadow-xl">
               <h2 className="text-2xl font-black flex items-center gap-3"><UserCheck size={28} className="text-indigo-400" /> 근무 일정 마스터</h2>
               <button onClick={() => setIsTeacherModalOpen(false)} className="p-4 bg-white/10 hover:bg-white/20 rounded-full transition-all"><X size={28} /></button>
             </div>
             <div className="p-10 space-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <section className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-slate-100 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 block">요일</label>
                      <select value={editTDay} onChange={e => setEditTDay(e.target.value)} className="w-full p-4 rounded-2xl border-2 font-bold outline-none bg-white shadow-sm">
                        {DAY_ORDER.map(d => <option key={d} value={d}>{DAY_LABELS[d]}요일</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 block">시작</label>
                      <input type="time" value={editTStart} onChange={e => setEditTStart(e.target.value)} className="w-full p-4 rounded-2xl border-2 font-bold outline-none bg-white shadow-sm" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 block">종료</label>
                      <input type="time" value={editTEnd} onChange={e => setEditTEnd(e.target.value)} className="w-full p-4 rounded-2xl border-2 font-bold outline-none bg-white shadow-sm" />
                    </div>
                  </div>
                  <button onClick={() => {
                     setTeacherSchedule(prev => ({ ...prev, [editTDay]: { start: editTStart, end: editTEnd } }));
                     setIsTeacherModalOpen(false);
                  }} className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-indigo-700 transition-all">근무 요일 업데이트</button>
                </section>
                <section className="space-y-3">
                  {teacherDays.map(day => (
                    <div key={day} className="flex items-center justify-between p-5 bg-white border-2 border-slate-100 rounded-2xl group shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black">{DAY_LABELS[day]}</div>
                        <div>
                          <p className="font-black text-slate-800">{DAY_LABELS[day]}요일 근무</p>
                          <p className="text-xs font-bold text-slate-400">{teacherSchedule[day].start} ~ {teacherSchedule[day].end}</p>
                        </div>
                      </div>
                      <button onClick={() => {
                        const next = {...teacherSchedule}; delete next[day]; setTeacherSchedule(next); setAssignments(prev => prev.filter(a => a.day !== day));
                      }} className="p-3 bg-rose-50 text-rose-400 hover:text-rose-600 rounded-xl transition-all"><Trash2 size={18}/></button>
                    </div>
                  ))}
                </section>
             </div>
          </div>
        </div>
      )}

      {/* Student Modal */}
      {isManageModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl rounded-[3.5rem] shadow-[0_0_100px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-indigo-700 p-10 text-white flex justify-between items-center shadow-xl">
               <h2 className="text-3xl font-black flex items-center gap-3"><Settings2 size={32} className="text-indigo-200" /> 학생 데이터 마스터</h2>
               <button onClick={() => setIsManageModalOpen(false)} className="p-4 bg-white/10 hover:bg-white/20 rounded-full transition-all"><X size={28} /></button>
            </div>
            <div className="p-12 grid grid-cols-1 md:grid-cols-2 gap-12 max-h-[75vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-8">
                <section>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">편집할 학생 선택</label>
                  <select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)}
                    className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-[1.5rem] font-black text-slate-800 outline-none focus:border-indigo-500 transition-all shadow-sm">
                    {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </section>
                <section className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-slate-100 space-y-6 shadow-inner">
                   <div className="flex gap-2 p-1.5 bg-white rounded-2xl border-2 border-slate-100">
                      <button onClick={() => setEditMode('UNAVAILABLE')} className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${editMode === 'UNAVAILABLE' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>불가능 등록</button>
                      <button onClick={() => setEditMode('PREFERENCE')} className={`flex-1 py-3 text-xs font-black rounded-xl transition-all ${editMode === 'PREFERENCE' ? 'bg-amber-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}>선호 등록</button>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1 block mb-2">요일 선택</label>
                        <select value={newDay} onChange={e => setNewDay(e.target.value)} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold outline-none shadow-sm bg-white">
                          {Object.keys(DAY_LABELS).map(d => <option key={d} value={d}>{DAY_LABELS[d]}요일</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1 block mb-2">시작</label>
                        <input type="time" value={newStart} onChange={e => setNewStart(e.target.value)} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold outline-none shadow-sm bg-white" />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase ml-1 block mb-2">종료</label>
                        <input type="time" value={newEnd} onChange={e => setNewEnd(e.target.value)} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold outline-none shadow-sm bg-white" />
                      </div>
                      {editMode === 'UNAVAILABLE' && (
                        <div className="col-span-2">
                          <input type="text" placeholder="예: 수학학원" value={newTitle} onChange={e => setNewTitle(e.target.value)} className="w-full p-4 rounded-2xl border-2 border-slate-100 font-bold outline-none shadow-sm bg-white" />
                        </div>
                      )}
                   </div>
                   <button onClick={() => {
                     setStudents(prev => prev.map(s => {
                       if (s.id !== selectedStudentId) return s;
                       const key = editMode === 'UNAVAILABLE' ? 'unavailable' : 'preferences';
                       const newData = { ...s[key] };
                       newData[newDay] = [...(newData[newDay] || []), { start: newStart, end: newEnd, title: newTitle || '선호' }];
                       return { ...s, [key]: newData };
                     }));
                     setNewTitle('');
                   }} className={`w-full py-5 text-white font-black rounded-2xl shadow-xl transition-all ${editMode === 'UNAVAILABLE' ? 'bg-rose-500' : 'bg-amber-500'}`}>데이터 등록</button>
                </section>
              </div>
              <div className="space-y-6">
                 <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">등록된 데이터 리스트</h3>
                 <div className="space-y-4">
                   {selectedStudent && (
                     <>
                       {Object.entries(selectedStudent.unavailable).map(([day, evs]) => evs.map((e, i) => (
                         <div key={`un-${day}-${i}`} className="p-5 rounded-[1.5rem] bg-white border-2 border-rose-100 flex items-center justify-between shadow-sm group">
                           <div><span className="text-[10px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-lg mr-3">불가능</span><span className="text-sm font-black text-slate-700">{DAY_LABELS[day]} {e.start}-{e.end}</span><p className="text-[11px] font-bold text-rose-400 mt-1">{e.title}</p></div>
                           <button onClick={() => deleteStudentEntry('UNAVAILABLE', day, i)} className="p-2 text-rose-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18}/></button>
                         </div>
                       )))}
                       {Object.entries(selectedStudent.preferences).map(([day, evs]) => evs.map((e, i) => (
                         <div key={`pre-${day}-${i}`} className="p-5 rounded-[1.5rem] bg-white border-2 border-amber-100 flex items-center justify-between shadow-sm group">
                           <div><span className="text-[10px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-lg mr-3">선호</span><span className="text-sm font-black text-slate-700">{DAY_LABELS[day]} {e.start}-{e.end}</span></div>
                           <button onClick={() => deleteStudentEntry('PREFERENCE', day, i)} className="p-2 text-amber-300 hover:text-amber-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={18}/></button>
                         </div>
                       )))}
                     </>
                   )}
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        [draggable="true"] { -webkit-user-drag: element; user-select: none; }
      `}</style>
    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<StudentScheduler />);
}
