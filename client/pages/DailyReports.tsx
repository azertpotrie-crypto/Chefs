import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Search, ChevronDown, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

interface DailyReport {
  id: string;
  patrol: string;
  date: string;
  morning_rating: number | null;
  afternoon_rating: number | null;
  evening_rating: number | null;
  food_rating: number | null;
  relations_rating: number | null;
  remarks: string | null;
  created_at: string;
}

const StarRating = ({ rating, size = 'sm' }: { rating: number | null; size?: 'sm' | 'lg' }) => {
  if (rating === null) return <span className="text-gray-400">—</span>;
  const stars = Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      size={size === 'lg' ? 20 : 16}
      className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
    />
  ));
  return <div className="flex gap-0.5">{stars}</div>;
};

export default function DailyReports() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterPatrol, setFilterPatrol] = useState('');
  const [uniquePatrols, setUniquePatrols] = useState<string[]>([]);
  const [uniqueDates, setUniqueDates] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('[DEBUG] Fetching daily camp reports...');
        const { data, error } = await supabase
          .from('daily_camp_reports')
          .select('*')
          .order('date', { ascending: false });

        console.log('[DEBUG] Daily reports response - data:', data, 'error:', error);

        if (error) {
          const errorMsg = `[${error.code}] ${error.message}`;
          console.error('[ERROR] Supabase error:', errorMsg);
          setError(errorMsg);
          throw error;
        }

        setReports(data || []);

        // Extract unique dates and patrols for filters
        const patrols = Array.from(new Set((data || []).map((r) => r.patrol).filter(Boolean)));
        const dates = Array.from(new Set((data || []).map((r) => r.date).filter(Boolean)));
        console.log('[DEBUG] Unique patrols found:', patrols);
        setUniquePatrols(patrols as string[]);
        setUniqueDates(dates as string[]);
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Erreur inconnue';
        console.error('[ERROR] Failed to fetch daily reports:', msg);
        setError(`Erreur lors du chargement des rapports: ${msg}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();
  }, []);

  const filteredReports = reports.filter((report) => {
    const matchesSearch =
      report.patrol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (report.remarks?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesDate = !filterDate || report.date === filterDate;
    const matchesPatrol = !filterPatrol || report.patrol === filterPatrol;
    return matchesSearch && matchesDate && matchesPatrol;
  });

  // Group by patrol for list view
  const groupedByPatrol = filteredReports.reduce(
    (acc, report) => {
      if (!acc[report.patrol]) {
        acc[report.patrol] = [];
      }
      acc[report.patrol].push(report);
      return acc;
    },
    {} as Record<string, DailyReport[]>
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getAverageRating = (report: DailyReport) => {
    const ratings = [
      report.morning_rating,
      report.afternoon_rating,
      report.evening_rating,
      report.food_rating,
      report.relations_rating,
    ].filter((r) => r !== null) as number[];
    if (ratings.length === 0) return 0;
    return Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {/* Error Banner */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Title */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Rapports Quotidiens</h1>
              <p className="text-gray-600 mt-1">Consultez les rapports de camp par patrouille</p>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="🔍 Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-shm-red"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📅 Date
                  </label>
                  <select
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-shm-red"
                  >
                    <option value="">Toutes les dates</option>
                    {uniqueDates.map((date) => (
                      <option key={date} value={date}>
                        {formatDate(date)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🏕 Patrouille
                  </label>
                  <select
                    value={filterPatrol}
                    onChange={(e) => setFilterPatrol(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-shm-red"
                  >
                    <option value="">Toutes les patrouilles</option>
                    {uniquePatrols.map((patrol) => (
                      <option key={patrol} value={patrol}>
                        {patrol}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-shm-red"></div>
                <p className="ml-2 text-gray-600">Chargement des rapports...</p>
              </div>
            )}

            {/* Reports List */}
            {!isLoading && (
              <div className="space-y-6">
                {Object.entries(groupedByPatrol).length > 0 ? (
                  Object.entries(groupedByPatrol).map(([patrol, patrolReports]) => (
                    <div key={patrol} className="bg-white rounded-lg shadow-md overflow-hidden">
                      <div className="bg-gradient-to-r from-shm-red to-red-700 p-4">
                        <h2 className="text-xl font-bold text-white">{patrol}</h2>
                      </div>

                      <div className="p-6">
                        <div className="space-y-4">
                          {patrolReports.slice(0, 3).map((report) => (
                            <div
                              key={report.id}
                              className="pb-4 border-b border-gray-200 last:border-b-0"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <p className="text-sm text-gray-600">
                                  <strong>Date:</strong> {formatDate(report.date)}
                                </p>
                                <div className="text-right">
                                  <p className="text-xs text-gray-500">Note moyenne</p>
                                  <p className="text-lg font-bold text-shm-red">
                                    {getAverageRating(report)}/5
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-sm">
                                <div>
                                  <p className="text-gray-600 mb-1">🌅 Matin</p>
                                  <StarRating rating={report.morning_rating} />
                                </div>
                                <div>
                                  <p className="text-gray-600 mb-1">☀️ Après-midi</p>
                                  <StarRating rating={report.afternoon_rating} />
                                </div>
                                <div>
                                  <p className="text-gray-600 mb-1">🌙 Soir</p>
                                  <StarRating rating={report.evening_rating} />
                                </div>
                                <div>
                                  <p className="text-gray-600 mb-1">🍽 Alimentation</p>
                                  <StarRating rating={report.food_rating} />
                                </div>
                                <div>
                                  <p className="text-gray-600 mb-1">👨‍🏫 Chefs</p>
                                  <StarRating rating={report.relations_rating} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {patrolReports.length > 3 && (
                          <button
                            onClick={() => navigate(`/daily-reports/${patrol}`)}
                            className="mt-4 text-shm-red hover:text-red-700 font-semibold flex items-center gap-1"
                          >
                            Voir plus →
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <p className="text-gray-500">Aucun rapport trouvé</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
