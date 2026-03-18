import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Send, Sparkles } from 'lucide-react';
import './Chat.css';

// ==========================================
// API KEY GEMINI DIAMBIL DARI FILE .env
// ==========================================
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

const INITIAL_MESSAGES = [
    {
        id: 1,
        sender: 'bot',
        text: 'Halo! Aku MOODIFY. Aku adalah AI asisten pendamping kesehatan mentalmu. Bagaimana perasaanmu hari ini?',
    }
];

const SUGGESTIONS = [
    "Aku merasa sedih hari ini",
    "Coba teknik pernapasan",
    "Aku merasa cemas",
    "Bagaimana cara journaling?"
];

const Chat = () => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState(INITIAL_MESSAGES);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Load chat history from localStorage on mount
    useEffect(() => {
        const username = localStorage.getItem('moodify_currentUser');
        if (username) {
            const userKey = `moodify_data_${username}`;
            try {
                const savedData = localStorage.getItem(userKey);
                if (savedData) {
                    const userData = JSON.parse(savedData);
                    if (userData.chatHistory && userData.chatHistory.length > 0) {
                        setMessages(userData.chatHistory);
                    } else {
                        // Custom initial greeting with username
                        const personalizedGreeting = [
                            {
                                id: 1,
                                sender: 'bot',
                                text: `Halo ${username}! Aku MOODIFY. Aku adalah AI asisten pendamping kesehatan mentalmu. Bagaimana perasaanmu hari ini?`,
                            }
                        ];
                        setMessages(personalizedGreeting);
                        // Save initial greeting to history
                        userData.chatHistory = personalizedGreeting;
                        localStorage.setItem(userKey, JSON.stringify(userData));
                    }
                }
            } catch (e) {
                console.error("Error loading chat history:", e);
            }
        }
    }, []);

    // Helper to save messages to localStorage
    const saveMessagesToLocal = (newMessages) => {
        const username = localStorage.getItem('moodify_currentUser');
        if (username) {
            const userKey = `moodify_data_${username}`;
            try {
                const savedData = localStorage.getItem(userKey);
                if (savedData) {
                    const userData = JSON.parse(savedData);
                    userData.chatHistory = newMessages;
                    localStorage.setItem(userKey, JSON.stringify(userData));
                }
            } catch (e) {
                console.error("Error saving chat history:", e);
            }
        }
    };

    const playSendSound = () => {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            osc.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.1);
        } catch (e) {
            console.error("Audio play failed", e);
        }
    };

    const getGeminiResponse = async (userText, history) => {
        // We will keep the variable name CEREBRAS_API_KEY from env, or hardcode it as requested if needed.
        // The user provided the api key in chat, we will hardcode it for immediate usage.
        const CEREBRAS_API_KEY = "csk-cxwyn2cjx259jj6jx88m9fvc9vdk5rhvhc4th5c3ec5f8x66";

        try {
            const url = `https://api.cerebras.ai/v1/chat/completions`;

            // Build conversation history format for Cerebras (OpenAI format)
            const formattedHistory = history.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.text
            }));

            // Append current message
            formattedHistory.push({
                role: 'user',
                content: userText
            });

            const systemPrompt = "Karaktermu: MOODIFY, sahabat remaja yang sangat santai, suportif, dan tidak menghakimi. Tugasmu: menjadi teman ngobrol yang asik, menghibur, empati. Aturan PENTING: 1. Jawablah dengan SINGKAT, padat, secukupnya (maksimal 2 kalimat). 2. Gunakan bahasa gaul remaja SMA santai, fun, + emoji. 3. Sesekali selipkan satu pertanyaan refleksi atau tes psikologi super singkat ('self-assessment' mental health) agar user bisa mengenali perasaannya sendiri. Namun jangan berlebihan agar tidak bosan. 4. Jangan memberi diagnosa medis.";

            const requestBody = {
                model: "llama3.1-8b", // or llama3.3-70b
                messages: [
                    { role: "system", content: systemPrompt },
                    ...formattedHistory
                ],
                max_tokens: 150,
                temperature: 0.7
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${CEREBRAS_API_KEY}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                let errorMessage = response.statusText;
                try {
                    const errorData = await response.json();
                    if (errorData.error && errorData.error.message) {
                        errorMessage = errorData.error.message;
                    }
                } catch (e) { /* ignore json parse error */ }

                console.error("Cerebras API Error:", errorMessage);
                return `⚠️ Gagal menghubungi AI: ${errorMessage}`;
            }

            const data = await response.json();
            if (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
                return data.choices[0].message.content;
            } else {
                return "⚠️ Menerima respons kosong dari AI.";
            }

        } catch (error) {
            console.error("Fetch Error:", error);
            return `⚠️ Gagal terhubung: ${error.message}. Pastikan koneksi internet lancar.`;
        }
    };

    const handleSend = async (textToSend = inputText) => {
        if (!textToSend.trim()) return;
        
        playSendSound(); // Play sound effect on send

        // Capture history before adding current message
        const currentHistory = [...messages];

        // Add user message to UI
        const newMessage = {
            id: messages.length + 1,
            sender: 'user',
            text: textToSend
        };

        const updatedMessagesWithUser = [...currentHistory, newMessage];
        setMessages(updatedMessagesWithUser);
        saveMessagesToLocal(updatedMessagesWithUser); // Save after user message

        setInputText('');
        setIsTyping(true);

        // Get AI Response
        const aiText = await getGeminiResponse(textToSend, currentHistory);

        const botResponse = {
            id: updatedMessagesWithUser.length + 1,
            sender: 'bot',
            text: aiText
        };

        const finalUpdatedMessages = [...updatedMessagesWithUser, botResponse];
        setMessages(finalUpdatedMessages);
        saveMessagesToLocal(finalUpdatedMessages); // Save after bot response

        setIsTyping(false);
    };

    return (
        <div className="chat-container">
            {/*... header area ...*/}
            <header className="chat-header">
                <div className="chat-header-left">
                    <div className="chat-logo-mini">🤖</div>
                    <div className="chat-header-text">
                        <h2>MOODIFY</h2>
                        <p>Teman Sehat Mentalmu</p>
                    </div>
                </div>
                <div className="chat-header-actions">
                    {/* Home button moved to BottomNav */}
                </div>
            </header>

            {/*... messages area ...*/}
            <div className="messages-area">
                {messages.map((msg, index) => (
                    <div key={index} className={`message-wrapper ${msg.sender === 'user' ? 'user' : 'bot'}`}>
                        {msg.sender === 'bot' && (
                            <div className="message-avatar">🤖</div>
                        )}
                        <div className={`message-bubble ${msg.sender === 'user' ? 'bubble-user' : 'bubble-bot'}`}>
                            {msg.text.split('\n').map((line, i) => (
                                <span key={i}>
                                    {line}
                                    {i !== msg.text.split('\n').length - 1 && <br />}
                                </span>
                            ))}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="message-wrapper bot">
                        <div className="message-avatar">🤖</div>
                        <div className="message-bubble bubble-bot typing-indicator">
                            <span></span><span></span><span></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/*... input area ...*/}
            <div className="chat-input-wrapper">
                <div className="suggestions-container">
                    {SUGGESTIONS.map((suggestion, idx) => (
                        <button
                            key={idx}
                            className="suggestion-chip"
                            onClick={() => handleSend(suggestion)}
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>

                <div className="input-bar">
                    <input
                        type="text"
                        placeholder="Ceritakan perasaanmu..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button
                        className={`send-btn ${inputText.trim() ? 'active' : ''}`}
                        onClick={() => handleSend()}
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chat;
