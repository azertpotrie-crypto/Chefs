import { useState, useEffect } from 'react';
import { Search, Trash2, Edit } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

interface Member {
  id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string | null;
  branch: string | null;
  patrol: string | null;
  role: string | null;
  tutor_name: string | null;
  tutor_phone: string | null;
  created_at: string;
}

export default function Members() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('[DEBUG] Fetching members from Supabase...');
        const { data, error } = await supabase
          .from('members')
          .select('*')
          .order('created_at', { ascending: false });

        console.log('[DEBUG] Members response - data:', data, 'error:', error);

        if (error) {
          const errorMsg = `[${error.code}] ${error.message}`;
          console.error('[ERROR] Supabase error:', errorMsg);
          setError(errorMsg);
          throw error;
        }

        console.log('[DEBUG] Members loaded:', data?.length || 0, 'items');
        setMembers(data || []);
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Erreur inconnue';
        console.error('[ERROR] Failed to fetch members:', msg);
        setError(`Erreur lors du chargement des membres: ${msg}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('members_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'members' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMembers((prev) => [payload.new as Member, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setMembers((prev) =>
              prev.map((m) => (m.id === payload.new.id ? (payload.new as Member) : m))
            );
          } else if (payload.eventType === 'DELETE') {
            setMembers((prev) => prev.filter((m) => m.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const filteredMembers = members.filter(
    (member) =>
      member.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.patrol && member.patrol.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} userName="Chef Principal" />

      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 container mx-auto px-4 py-8">
          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Header */}
          <div className="mb-8">
            <h1 className="section-title">Gestion des Membres</h1>
            <p className="text-gray-600">
              {filteredMembers.length} membre{filteredMembers.length !== 1 ? 's' : ''} au total
            </p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher par nom, prénom ou patrouille..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-shm-red"
              />
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-shm-red"></div>
              <p className="ml-2 text-gray-600">Chargement des membres...</p>
            </div>
          )}

          {/* Members Table */}
          {!isLoading && (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              {filteredMembers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Nom
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Prénom
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Patrouille
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Branche
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Rôle
                        </th>
                        <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredMembers.map((member) => (
                        <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {member.last_name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {member.first_name}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {member.patrol || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {member.branch || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {member.role || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm space-x-2 flex">
                            <button className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors">
                              <Edit size={18} />
                            </button>
                            <button className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors">
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-6 py-12 text-center">
                  <p className="text-gray-500 text-sm">
                    {searchTerm ? 'Aucun membre ne correspond à votre recherche' : 'Aucun membre enregistré'}
                  </p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      <Footer />
    </div>
  );
}
