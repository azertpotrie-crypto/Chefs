import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

export default function LoginHelpWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: 'bot',
      text: 'Bonjour! 👋 Je suis ici pour vous aider avec votre connexion. Avez-vous un problème?',
    },
  ]);
  const [input, setInput] = useState('');

  const commonIssues = [
    {
      label: "J'ai oublié mon mot de passe",
      response: 'Contactez votre administrateur SHM pour réinitialiser votre mot de passe.',
    },
    {
      label: 'Le CIN ne fonctionne pas',
      response: 'Assurez-vous que vous avez entré votre numéro CIN correctement (sans espaces). Consultez votre Carte Nationale.',
    },
    {
      label: 'Je viens de créer un compte',
      response: 'Si vous venez juste de vous inscrire, utilisez le même CIN et mot de passe que lors de l\'inscription.',
    },
    {
      label: 'Erreur de connexion',
      response: 'Vérifiez que tous les champs sont remplis correctement: Nom, Prénom, CIN et Mot de passe. La casse du nom/prénom ne doit pas importait.',
    },
  ];

  const handleQuickQuestion = (response: string) => {
    setMessages((prev) => [
      ...prev,
      { type: 'user', text: 'Question sélectionnée' },
      { type: 'bot', text: response },
    ]);
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;

    setMessages((prev) => [
      ...prev,
      { type: 'user', text: input },
      {
        type: 'bot',
        text: 'Merci de votre message. Pour plus d\'assistance, contactez votre administrateur SHM à shm@example.com',
      },
    ]);
    setInput('');
  };

  return (
    <>
      {/* Chat Widget Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-shm-red to-shm-purple text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-shadow z-40"
          aria-label="Ouvrir l'aide"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 max-h-96 bg-white rounded-lg shadow-2xl flex flex-col z-50 animate-fade-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-shm-red to-shm-purple text-white p-4 rounded-t-lg flex items-center justify-between">
            <div>
              <h3 className="font-bold">Aide - Connexion</h3>
              <p className="text-xs opacity-90">Nous sommes là pour vous aider</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.type === 'user'
                      ? 'bg-shm-red text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-900 rounded-bl-none'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          {messages.length === 1 && (
            <div className="px-4 py-3 bg-white border-t border-gray-200 space-y-2">
              <p className="text-xs font-semibold text-gray-700 mb-2">Questions fréquentes:</p>
              <div className="space-y-2">
                {commonIssues.map((issue, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickQuestion(issue.response)}
                    className="w-full text-left text-xs bg-gray-100 hover:bg-gray-200 p-2 rounded transition-colors"
                  >
                    {issue.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-gray-200 p-3 bg-white rounded-b-lg flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Votre question..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-shm-red"
            />
            <button
              onClick={handleSendMessage}
              className="bg-shm-red text-white p-2 rounded hover:bg-shm-purple transition-colors"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
