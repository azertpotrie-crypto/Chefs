import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, ArrowLeft, AlertCircle } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ReportView() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [pdfUrl] = useState(
    new URLSearchParams(window.location.search).get('url') || ''
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    if (!pdfUrl) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(pdfUrl);
      const blob = await response.blob();
      
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `rapport-${reportId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!pdfUrl) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header onMenuClick={() => {}} userName="Chef Principal" />
        <main className="flex-1 container mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
            <div className="flex gap-4 items-start">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-1" size={24} />
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-2">
                  URL du PDF non disponible
                </h2>
                <p className="text-gray-600 mb-4">
                  Le lien vers le fichier PDF n'a pas pu être chargé.
                </p>
                <button
                  onClick={() => navigate('/reports')}
                  className="px-4 py-2 bg-shm-red text-white rounded-lg hover:to-shm-purple transition-colors"
                >
                  Retour aux rapports
                </button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header onMenuClick={() => {}} userName="Chef Principal" />

      <main className="flex-1 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/reports')}
            className="flex items-center gap-2 text-shm-red hover:text-shm-purple transition-colors font-semibold"
          >
            <ArrowLeft size={20} />
            Retour aux rapports
          </button>
          <button
            onClick={handleDownload}
            disabled={isLoading}
            className="flex items-center gap-2 bg-gradient-to-r from-shm-red to-shm-purple text-white font-semibold py-2 px-4 rounded-lg hover:shadow-lg transition-all disabled:opacity-50"
          >
            <Download size={20} />
            {isLoading ? 'Téléchargement...' : 'Télécharger'}
          </button>
        </div>

        {/* PDF Viewer */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
            className="w-full h-screen md:h-[800px]"
            title="PDF Viewer"
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
