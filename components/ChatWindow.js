import React, { useState, useEffect, useRef } from 'react';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const INITIAL_MESSAGE = {
  role: 'system',
  content: `Eres un asistente virtual de la Tienda Taller, especializado en soporte técnico y ayuda de ventas. 
  La Tienda Taller es una tienda en línea que vende productos artesanales innovadores que combinan artesanía y tecnología. 
  Ofrece ayuda amable y profesional, responde preguntas sobre productos, procesos de compra, envíos, devoluciones y cualquier problema técnico que los clientes puedan tener con los productos o el sitio web.`
};

const ChatWindow = ({ onClose }) => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([INITIAL_MESSAGE]);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = { role: 'user', content: message };
    setChatHistory(prev => [...prev, userMessage]);
    setMessage('');
    setIsLoading(true);

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [...chatHistory, userMessage],
      });

      const aiMessage = { role: 'assistant', content: response.choices[0].message.content };
      setChatHistory(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error al procesar el mensaje:', error);
      setChatHistory(prev => [...prev, { role: 'assistant', content: 'Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo más tarde.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 w-80 rounded-lg shadow-xl z-50 overflow-hidden">
      <div className="absolute inset-0 bg-[#5D6C8C] bg-opacity-60 backdrop-filter backdrop-blur-sm"></div>
      <div className="relative">
        <div className="flex justify-between items-center bg-[#5D6C8C] bg-opacity-80 text-white p-3 rounded-t-lg">
          <h3 className="font-bold">Asistente de Tienda Taller</h3>
          <button onClick={onClose} className="text-xl hover:text-gray-200">&times;</button>
        </div>
        <div ref={chatContainerRef} className="h-64 overflow-y-auto p-3">
          {chatHistory.slice(1).map((msg, index) => (
            <div key={index} className={`mb-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
              <span className={`inline-block p-2 rounded-lg ${
                msg.role === 'user' 
                  ? 'bg-blue-100 bg-opacity-80 text-gray-800' 
                  : 'bg-gray-200 bg-opacity-80 text-gray-800'
              }`}>
                {msg.content}
              </span>
            </div>
          ))}
          {isLoading && <div className="text-center text-white">Procesando...</div>}
        </div>
        <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200 bg-opacity-80">
          <div className="flex">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="flex-grow px-3 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#5D6C8C] bg-white bg-opacity-80 text-gray-900"
            />
            <button
              type="submit"
              className="bg-[#5D6C8C] hover:bg-[#4A5670] text-white px-4 py-2 rounded-r-lg transition duration-300 disabled:opacity-50"
              disabled={isLoading}
            >
              Enviar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;