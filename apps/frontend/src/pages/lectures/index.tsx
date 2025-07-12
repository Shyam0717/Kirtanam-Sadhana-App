import { useEffect, useState } from 'react';
import { Play, Pause, Bookmark, BookOpen, Brain, FileText, Volume2, VolumeX, ChevronDown, ChevronRight, Search, Filter } from 'lucide-react';

// Type definitions
type Lecture = {
  id: number;
  chapter: number;
  verseRange: string;
  location: string;
  date: string;
  title: string;
  filename: string;
  audioUrl: string;
  listened: boolean;
  bookmarked: boolean;
  notes: string;
  summary: string;
};

type LectureStats = {
  total: number;
  listened: number;
  bookmarked: number;
};

type NotesModalProps = {
  isOpen: boolean;
  notes: string;
  onClose: () => void;
  onSave: (notes: string) => void;
};

type AudioPlayerProps = {
  src: string;
  onPlay: () => void;
  onPause: () => void;
  isPlaying: boolean;
};

type ChapterNavigationProps = {
  chapters: number[];
  selectedChapter: number | null;
  onChapterSelect: (chapter: number | null) => void;
  lectureStats: Record<number, LectureStats>;
};

type LectureCardProps = {
  lecture: Lecture;
  onUpdate: (id: number, updates: Partial<Lecture>) => Promise<void>;
  onPlay: (lecture: Lecture) => void;
  onPause: () => void;
  isPlaying: boolean;
  onOpenNotes: (lecture: Lecture) => void;
};

// API functions
const fetchLectures = async (): Promise<Lecture[]> => {
  const res = await fetch('http://localhost:4000/lectures');
  return res.json();
};

const updateLecture = async (id: number, updates: Partial<Lecture>): Promise<Lecture> => {
  const res = await fetch(`http://localhost:4000/lectures/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  return res.json();
};

const summarizeLecture = async (id: number): Promise<{ summary: string }> => {
  const res = await fetch(`http://localhost:4000/lectures/${id}/summarize`, {
    method: 'POST',
  });
  return res.json();
};

// NotesModal component
function NotesModal({ isOpen, notes, onClose, onSave }: NotesModalProps) {
  const [noteText, setNoteText] = useState(notes);

  useEffect(() => {
    setNoteText(notes);
  }, [notes]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Lecture Notes
          </h3>
        </div>
        <div className="p-6">
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Write your notes here..."
            className="w-full h-64 p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(noteText);
              onClose();
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
          >
            Save Notes
          </button>
        </div>
      </div>
    </div>
  );
}

// Audio Player Component
function AudioPlayer({ src, onPlay, onPause, isPlaying }: AudioPlayerProps) {
  const [audio] = useState(new Audio());
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioLoaded, setIsAudioLoaded] = useState(false);

  useEffect(() => {
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', onPause);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', onPause);
    };
  }, [audio, onPause]);

  useEffect(() => {
    if (isPlaying) {
      if (!isAudioLoaded) {
        audio.src = src;
        audio.preload = 'metadata';
        setIsAudioLoaded(true);
      }
      audio.play().catch(console.error);
    } else {
      audio.pause();
    }
  }, [isPlaying, audio, src, isAudioLoaded]);

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isAudioLoaded || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * duration;
  };

  const toggleMute = () => {
    audio.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    audio.volume = newVolume;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <button
          onClick={isPlaying ? onPause : onPlay}
          className="w-10 h-10 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center transition-colors"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>
        
        <div className="flex-1">
          <div
            className={`h-2 bg-gray-200 rounded-full ${isAudioLoaded ? 'cursor-pointer' : 'cursor-not-allowed'}`}
            onClick={handleSeek}
          >
            <div
              className="h-full bg-orange-500 rounded-full transition-all"
              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
            />
          </div>
        </div>
        
        <div className="text-xs text-gray-500 min-w-[80px]">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button onClick={toggleMute} className="text-gray-500 hover:text-gray-700">
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolumeChange}
          className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
      </div>
    </div>
  );
}

// Chapter Navigation Component
function ChapterNavigation({ chapters, selectedChapter, onChapterSelect, lectureStats }: ChapterNavigationProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Chapters
        </h2>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>
      
      {!isCollapsed && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          <button
            onClick={() => onChapterSelect(null)}
            className={`w-full text-left p-3 rounded-xl transition-colors ${
              selectedChapter === null
                ? 'bg-orange-100 text-orange-700 border-2 border-orange-200'
                : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">All Chapters</span>
              <span className="text-sm bg-gray-200 px-2 py-1 rounded-full">
                {Object.values(lectureStats).reduce((sum, stats) => sum + stats.total, 0)}
              </span>
            </div>
          </button>
          
          {chapters.map(chapter => (
            <button
              key={chapter}
              onClick={() => onChapterSelect(chapter)}
              className={`w-full text-left p-3 rounded-xl transition-colors ${
                selectedChapter === chapter
                  ? 'bg-orange-100 text-orange-700 border-2 border-orange-200'
                  : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">Chapter {chapter}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm bg-gray-200 px-2 py-1 rounded-full">
                    {lectureStats[chapter]?.total || 0}
                  </span>
                  {lectureStats[chapter]?.listened > 0 && (
                    <span className="text-xs bg-green-200 text-green-700 px-2 py-1 rounded-full">
                      {lectureStats[chapter].listened} listened
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Lecture Card Component with enhanced features
function LectureCard({ lecture, onUpdate, onPlay, onPause, isPlaying, onOpenNotes }: LectureCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Generate Vedabase link based on chapter
  const getVedabaseLink = () => {
    const baseUrl = 'https://vedabase.io/en/library/bg';
    return `${baseUrl}/${lecture.chapter}/`;
  };

  // Generate BhagavadGita.com link
  const getBgWebsiteLink = () => {
    return `https://www.bhagavadgita.com/chapter-${lecture.chapter}/`;
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 ${
      lecture.listened ? 'border-green-200' : 'border-gray-100'
    }`}>
      <div className="p-6">
        {/* Card Header (clickable area) */}
        <div 
          className="cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-orange-600 bg-orange-100 px-3 py-1 rounded-full">
              Chapter {lecture.chapter} ({lecture.verseRange})
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdate(lecture.id, { bookmarked: !lecture.bookmarked });
                }}
                className={`p-2 rounded-full transition-colors ${
                  lecture.bookmarked
                    ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
              >
                <Bookmark className="w-4 h-4" />
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(!isExpanded);
                }}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
            {lecture.title}
          </h3>

          <div className="mb-4 space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">📍 {lecture.location}</span>
              <span>•</span>
              <span>{new Date(lecture.date).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Always visible audio player */}
        <AudioPlayer
          src={lecture.audioUrl}
          onPlay={() => onPlay(lecture)}
          onPause={onPause}
          isPlaying={isPlaying}
        />

        {/* Always visible listened checkbox */}
        <div className="mt-4 flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={lecture.listened}
              onChange={() => onUpdate(lecture.id, { listened: !lecture.listened })}
              className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
            />
            <span className={lecture.listened ? 'line-through' : ''}>
              Listened
            </span>
          </label>
          {lecture.listened && (
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          )}
        </div>

        {/* Expandable content */}
        {isExpanded && (
          <div className="mt-4 space-y-4">
            {/* Summary section */}
            {lecture.summary ? (
              <div className="p-3 bg-blue-50 rounded-xl">
                <div className="flex items-start gap-2">
                  <Brain className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-blue-900 mb-1">Summary</p>
                    <p className="text-sm text-blue-700 leading-relaxed">
                      {lecture.summary}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    const result = await summarizeLecture(lecture.id);
                    await onUpdate(lecture.id, { summary: result.summary });
                  } catch (error) {
                    console.error('Failed to generate summary:', error);
                  }
                }}
                className="w-full flex items-center justify-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-xl transition-colors"
              >
                <Brain className="w-4 h-4" />
                Generate Summary
              </button>
            )}

            {/* Notes section */}
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenNotes(lecture);
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-colors"
              >
                <FileText className="w-4 h-4" />
                {lecture.notes ? 'View Notes' : 'Add Notes'}
              </button>
            </div>

            {lecture.notes && (
              <div className="p-3 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-700 line-clamp-3">
                  {lecture.notes}
                </p>
              </div>
            )}

            {/* External links section */}
            <div className="pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Related Resources</h4>
              <div className="flex flex-wrap gap-2">
                <a
                  href={getVedabaseLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-orange-100 text-orange-700 rounded-full text-xs hover:bg-orange-200 transition-colors flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <BookOpen className="w-3 h-3" />
                  Vedabase Chapter {lecture.chapter}
                </a>
                <a
                  href={getBgWebsiteLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs hover:bg-blue-200 transition-colors flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <BookOpen className="w-3 h-3" />
                  BhagavadGita.org
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Main Lecture List Page
export default function LectureListPage() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'listened' | 'unlistened' | 'bookmarked'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [activeLecture, setActiveLecture] = useState<Lecture | null>(null);
  const [playingLecture, setPlayingLecture] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLectures()
      .then(data => {
        setLectures(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Failed to fetch lectures:', error);
        setLoading(false);
      });
  }, []);

  const update = async (id: number, updates: Partial<Lecture>) => {
    try {
      await updateLecture(id, updates);
      setLectures(prev =>
        prev.map(l => (l.id === id ? { ...l, ...updates } : l))
      );
    } catch (error) {
      console.error('Failed to update lecture:', error);
    }
  };

  const handlePlay = (lecture: Lecture) => {
    if (playingLecture && playingLecture !== lecture.id) {
      setPlayingLecture(null);
    }
    
    setPlayingLecture(lecture.id);
    if (!lecture.listened) {
      update(lecture.id, { listened: true });
    }
  };

  const handlePause = () => {
    setPlayingLecture(null);
  };

  // Group lectures by chapter
  const lecturesByChapter = lectures.reduce((acc: Record<number, Lecture[]>, lecture) => {
    const chapter = lecture.chapter;
    if (!acc[chapter]) {
      acc[chapter] = [];
    }
    acc[chapter].push(lecture);
    return acc;
  }, {});

  // Get unique chapters sorted numerically
  const chapters = Object.keys(lecturesByChapter)
    .map(Number)
    .sort((a, b) => a - b);

  // Calculate lecture statistics by chapter
  const lectureStats = chapters.reduce((acc: Record<number, LectureStats>, chapter) => {
    const chapterLectures = lecturesByChapter[chapter] || [];
    acc[chapter] = {
      total: chapterLectures.length,
      listened: chapterLectures.filter(l => l.listened).length,
      bookmarked: chapterLectures.filter(l => l.bookmarked).length,
    };
    return acc;
  }, {});

  // Filter lectures
  const filteredLectures = lectures.filter(lecture => {
    const matchesChapter = selectedChapter === null || lecture.chapter === selectedChapter;
    const matchesSearch = searchTerm === '' || 
      lecture.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecture.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lecture.verseRange.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterType === 'all' ||
      (filterType === 'listened' && lecture.listened) ||
      (filterType === 'unlistened' && !lecture.listened) ||
      (filterType === 'bookmarked' && lecture.bookmarked);
    
    return matchesChapter && matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            📖 Srila Prabhupada's Gita Lectures
          </h1>
          <p className="text-gray-600">
            Timeless wisdom from the Bhagavad Gita As It Is
          </p>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-80 flex-shrink-0">
            <ChapterNavigation
              chapters={chapters}
              selectedChapter={selectedChapter}
              onChapterSelect={setSelectedChapter}
              lectureStats={lectureStats}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Search and Filter Bar */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search lectures..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as 'all' | 'listened' | 'unlistened' | 'bookmarked')}
                    className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="all">All Lectures</option>
                    <option value="listened">Listened</option>
                    <option value="unlistened">Not Listened</option>
                    <option value="bookmarked">Bookmarked</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Results Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedChapter ? `Chapter ${selectedChapter} Lectures` : 'All Lectures'}
                </h2>
                <span className="text-gray-600">
                  {filteredLectures.length} lecture{filteredLectures.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Lectures Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredLectures.map(lecture => (
                <LectureCard
                  key={lecture.id}
                  lecture={lecture}
                  onUpdate={update}
                  onPlay={handlePlay}
                  onPause={handlePause}
                  isPlaying={playingLecture === lecture.id}
                  onOpenNotes={(lecture) => {
                    setActiveLecture(lecture);
                    setModalOpen(true);
                  }}
                />
              ))}
            </div>

            {filteredLectures.length === 0 && (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No lectures found</h3>
                <p className="text-gray-500">
                  Try adjusting your search terms or filters
                </p>
              </div>
            )}
          </div>
        </div>

        <NotesModal
          isOpen={modalOpen}
          notes={activeLecture?.notes || ''}
          onClose={() => setModalOpen(false)}
          onSave={(notes) => {
            if (activeLecture) update(activeLecture.id, { notes });
          }}
        />
      </div>
    </div>
  );
}