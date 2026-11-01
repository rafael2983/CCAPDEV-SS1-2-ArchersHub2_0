// chatbot.js - Injects a floating AI Chat widget into the bottom right of any page

(function() {
    // 1. Inject Chatbot CSS
    const style = document.createElement('style');
    style.innerHTML = `
        /* Chatbot Widget Container */
        .archers-chatbot-container {
            position: fixed;
            bottom: 25px;
            right: 25px;
            z-index: 9999;
            font-family: inherit;
        }

        /* Floating Toggle Button */
        .chatbot-toggle-btn {
            width: 55px;
            height: 55px;
            background-color: #004d26;
            color: white;
            border: none;
            border-radius: 50%;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            transition: transform 0.2s ease, background-color 0.2s ease;
        }

        .chatbot-toggle-btn:hover {
            background-color: #00361b;
            transform: scale(1.05);
        }

        /* Chat Window Box */
        .chatbot-window {
            position: absolute;
            bottom: 70px;
            right: 0;
            width: 340px;
            height: 460px;
            background: #ffffff;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            display: none; /* Hidden by default */
            border: 1px solid #e5e7eb;
        }

        .chatbot-window.active {
            display: flex;
        }

        /* Chat Header */
        .chatbot-header {
            background-color: #004d26;
            color: white;
            padding: 14px 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-weight: 600;
        }

        .chatbot-close-btn {
            background: none;
            border: none;
            color: white;
            font-size: 18px;
            cursor: pointer;
        }

        /* Chat Body / Messages Area */
        .chatbot-messages {
            flex: 1;
            padding: 15px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 10px;
            background: #f9fafb;
            font-size: 0.9rem;
        }

        .chat-bubble {
            max-width: 80%;
            padding: 10px 12px;
            border-radius: 8px;
            line-height: 1.4;
        }

        .chat-bubble.bot {
            background: #e5e7eb;
            color: #1f2937;
            align-self: flex-start;
        }

        .chat-bubble.user {
            background: #004d26;
            color: white;
            align-self: flex-end;
        }

        /* Chat Input Footer */
        .chatbot-input-area {
            display: flex;
            padding: 10px;
            background: white;
            border-top: 1px solid #e5e7eb;
        }

        .chatbot-input-area input {
            flex: 1;
            padding: 8px 12px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            outline: none;
            font-size: 0.9rem;
        }

        .chatbot-input-area button {
            background-color: #004d26;
            color: white;
            border: none;
            padding: 8px 14px;
            margin-left: 8px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
        }

        .chatbot-input-area button:hover {
            background-color: #00361b;
        }
    `;
    document.head.appendChild(style);

    // 2. Inject Chatbot HTML Structure
    const chatbotHTML = `
        <div class="archers-chatbot-container">
            <button class="chatbot-toggle-btn" id="chatbot-toggle" aria-label="Open AI Chat">
                💬
            </button>
            <div class="chatbot-window" id="chatbot-window">
                <div class="chatbot-header">
                    <span>ArchersHub AI Assistant</span>
                    <button class="chatbot-close-btn" id="chatbot-close">&times;</button>
                </div>
                <div class="chatbot-messages" id="chatbot-messages">
                    <div class="chat-bubble bot">Hello, Archer! I'm your AI assistant. How can I help you with enlistment, records, or schedules today?</div>
                </div>
                <div class="chatbot-input-area">
                    <input type="text" id="chatbot-input" placeholder="Type a message...">
                    <button id="chatbot-send">Send</button>
                </div>
            </div>
        </div>
    `;
    
    const wrapper = document.createElement('div');
    wrapper.innerHTML = chatbotHTML;
    document.body.appendChild(wrapper);

    // 3. Chatbot Toggle & Interaction Logic
    const toggleBtn = document.getElementById('chatbot-toggle');
    const closeBtn = document.getElementById('chatbot-close');
    const chatWindow = document.getElementById('chatbot-window');
    const sendBtn = document.getElementById('chatbot-send');
    const inputField = document.getElementById('chatbot-input');
    const messagesArea = document.getElementById('chatbot-messages');

    toggleBtn.addEventListener('click', () => {
        chatWindow.classList.toggle('active');
    });

    closeBtn.addEventListener('click', () => {
        chatWindow.classList.remove('active');
    });

    function handleUserMessage() {
        const text = inputField.value.trim();
        if (!text) return;

        // Append user bubble
        const userBubble = document.createElement('div');
        userBubble.className = 'chat-bubble user';
        userBubble.textContent = text;
        messagesArea.appendChild(userBubble);
        inputField.value = '';
        messagesArea.scrollTop = messagesArea.scrollHeight;

        // Simulate AI response after a short pause
        setTimeout(() => {
            const botBubble = document.createElement('div');
            botBubble.className = 'chat-bubble bot';
            botBubble.textContent = "Thanks for your question! Since this is a front-end prototype, my backend connection is coming soon. Let me know if you need help navigating the hub!";
            messagesArea.appendChild(botBubble);
            messagesArea.scrollTop = messagesArea.scrollHeight;
        }, 800);
    }

    sendBtn.addEventListener('click', handleUserMessage);
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleUserMessage();
    });
})();