import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit, CheckCircle, Clock, XCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import Footer from '../components/Footer';

interface Idea {
  id: string;
  user_id: string;
  title: string;
  content: string;
  status: 'new' | 'in_review' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export default function Ideas() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | Idea['status']>('all');

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        setIsLoading(true);
        console.log('[DEBUG] Fetching ideas from Supabase...');
        const { data, error } = await supabase
          .from('ideas')
          .select('*')
          .order('created_at', { ascending: false });

        console.log('[DEBUG] Ideas response - data:', data, 'error:', error);

        if (error) throw error;
        console.log('[DEBUG] Ideas loaded:', data?.length || 0, 'items');
        setIdeas(data || []);
      } catch (error) {
        console.error('[ERROR] Failed to fetch ideas:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchIdeas();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('ideas_updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ideas' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setIdeas((prev) => [payload.new as Idea, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setIdeas((prev) =>
              prev.map((i) => (i.id === payload.new.id ? (payload.new as Idea) : i))
            );
          } else if (payload.eventType === 'DELETE') {
            setIdeas((prev) => prev.filter((i) => i.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const filteredIdeas = ideas.filter((idea) => {
    const matchesSearch = idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      idea.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || idea.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusInfo = (status: Idea['status']) => {
    switch (status) {
      case 'new':
        return {
          label: 'Nouvelle',
          color: 'bg-blue-100 text-blue-700',
          icon: Clock,
        };
      case 'in_review':
        return {
          label: 'En examen',
          color: 'bg-yellow-100 text-yellow-700',
          icon: Clock,
        };
      case 'approved':
        return {
          label: 'Approuvée',
          color: 'bg-green-100 text-green-700',
          icon: CheckCircle,
        };
      case 'rejected':
        return {
          label: 'Rejetée',
          color: 'bg-red-100 text-red-700',
          icon: XCircle,
        };
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} userName="Chef Principal" />

      <div className="flex flex-1">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="section-title">Idées Proposées</h1>
              <p className="text-gray-600">
                {filteredIdeas.length} idée{filteredIdeas.length !== 1 ? 's' : ''} au total
              </p>
            </div>
            <button className="bg-gradient-to-r from-shm-red to-shm-purple text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2">
              <Plus size={20} />
              Proposer une Idée
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher une idée..."
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
              <p className="ml-2 text-gray-600">Chargement des idées...</p>
            </div>
          )}

          {/* Ideas List */}
          {!isLoading && (
            <div className="space-y-4">
              {filteredIdeas.length > 0 ? (
                filteredIdeas.map((idea) => {
                  const statusInfo = getStatusInfo(idea.status);
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <div
                      key={idea.id}
                      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {idea.title}
                            </h3>
                            <div className={`flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full ${statusInfo.color}`}>
                              <StatusIcon size={14} />
                              <span>{statusInfo.label}</span>
                            </div>
                          </div>
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {idea.content}
                          </p>
                          <time className="text-xs text-gray-500">
                            {formatDate(idea.created_at)}
                          </time>
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors">
                          <Edit size={18} />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="bg-white rounded-lg shadow-md px-6 py-12 text-center">
                  <p className="text-gray-500 text-sm">
                    {searchTerm || filterStatus !== 'all'
                      ? 'Aucune idée ne correspond à votre recherche'
                      : 'Aucune idée proposée'}
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
