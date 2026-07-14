import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

interface DailyReport {
  id: string;
  patrol: string;
  morning_rating: number | null;
  afternoon_rating: number | null;
  evening_rating: number | null;
  food_rating: number | null;
  relations_rating: number | null;
  remarks: string | null;
  created_at: string;
}

const StarRating = ({ rating }: { rating: number | null }) => {
  if (rating === null) return <span className="text-gray-400">—</span>;
  const stars = Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      size={24}
      className={i < rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
    />
  ));
  return <div className="flex gap-1">{stars}</div>;
};

export default function DailyReportDetail() {
  const navigate = useNavigate();
  const { patrol } = useParams<{ patrol: string }>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setIsLoading(true);
        console.log('[DEBUG] Fetching reports for patrol:', patrol);
        const { data, error } = await supabase
          .from('daily_camp_reports')
          .select('*')
          .eq('patrol', patrol)
          .order('created_at', { ascending: false });

        console.log('[DEBUG] Reports for patrol response - data:', data, 'error:', error);

        if (error) {
          console.error('[ERROR] Supabase error:', error.message);
          throw error;
        }

        setReports(data || []);
      } catch (error) {
        console.error('[ERROR] Failed to fetch reports:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (patrol) {
      fetchReports();
    }
  }, [patrol]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <button
              onClick={() => navigate('/daily-reports')}
              className="mb-6 flex items-center gap-2 text-shm-red hover:text-red-700 font-semibold"
            >
              <ArrowLeft size={20} />
              Retour aux rapports
            </button>

            {/* Title */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">{patrol}</h1>
              <p className="text-gray-600 mt-1">Détail des rapports quotidiens</p>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-shm-red"></div>
                <p className="ml-2 text-gray-600">Chargement des rapports...</p>
              </div>
            )}

            {/* Reports Detail */}
            {!isLoading && (
              <div className="space-y-6">
                {reports.length > 0 ? (
                  reports.map((report) => (
                    <div
                      key={report.id}
                      className="bg-white rounded-lg shadow-md p-8"
                    >
                      <div className="mb-6 pb-6 border-b border-gray-200">
                        <p className="text-lg font-semibold text-gray-900 mb-2">
                          📅 {formatDate(report.created_at)}
                        </p>
                        <p className="text-sm text-gray-500">
                          Enregistré le {new Date(report.created_at).toLocaleString('fr-FR')}
                        </p>
                      </div>

                      {/* Ratings Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        {/* Morning */}
                        <div className="bg-orange-50 rounded-lg p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">🌅</span>
                            <h3 className="text-lg font-semibold text-gray-900">Matin</h3>
                          </div>
                          <div className="ml-11">
                            <StarRating rating={report.morning_rating} />
                            <p className="text-sm text-gray-600 mt-2">
                              Note: {report.morning_rating || '—'}/5
                            </p>
                          </div>
                        </div>

                        {/* Afternoon */}
                        <div className="bg-yellow-50 rounded-lg p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">☀️</span>
                            <h3 className="text-lg font-semibold text-gray-900">Après-midi</h3>
                          </div>
                          <div className="ml-11">
                            <StarRating rating={report.afternoon_rating} />
                            <p className="text-sm text-gray-600 mt-2">
                              Note: {report.afternoon_rating || '—'}/5
                            </p>
                          </div>
                        </div>

                        {/* Evening */}
                        <div className="bg-indigo-50 rounded-lg p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">🌙</span>
                            <h3 className="text-lg font-semibold text-gray-900">Soir</h3>
                          </div>
                          <div className="ml-11">
                            <StarRating rating={report.evening_rating} />
                            <p className="text-sm text-gray-600 mt-2">
                              Note: {report.evening_rating || '—'}/5
                            </p>
                          </div>
                        </div>

                        {/* Food */}
                        <div className="bg-green-50 rounded-lg p-6">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">🍽</span>
                            <h3 className="text-lg font-semibold text-gray-900">Alimentation</h3>
                          </div>
                          <div className="ml-11">
                            <StarRating rating={report.food_rating} />
                            <p className="text-sm text-gray-600 mt-2">
                              Note: {report.food_rating || '—'}/5
                            </p>
                          </div>
                        </div>

                        {/* Relations */}
                        <div className="bg-pink-50 rounded-lg p-6 md:col-span-2">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">👨‍🏫</span>
                            <h3 className="text-lg font-semibold text-gray-900">
                              Relation avec les chefs
                            </h3>
                          </div>
                          <div className="ml-11">
                            <StarRating rating={report.relations_rating} />
                            <p className="text-sm text-gray-600 mt-2">
                              Note: {report.relations_rating || '—'}/5
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Remarks */}
                      {report.remarks && (
                        <div className="bg-gray-50 rounded-lg p-6">
                          <h4 className="font-semibold text-gray-900 mb-3">Remarques</h4>
                          <p className="text-gray-700 whitespace-pre-line">{report.remarks}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <p className="text-gray-500">Aucun rapport trouvé pour cette patrouille</p>
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
