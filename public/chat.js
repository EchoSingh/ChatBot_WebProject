if (HTMLScriptElement.supports('importmap')) {
    // The importmap feature is supported.
}

// Access your API key (see "Set up your API key" above)
const output = document.getElementById("output");
const buttonClick = document.getElementById("clickable");

document.addEventListener('DOMContentLoaded', () => {
    const inputField = document.querySelector('.input-field');
    const sendButton = document.querySelector('.send-button');
    const chatWindow = document.querySelector('.chat-window');
    
    const appendMessage = (message, className) => {
        const messageDiv = document.createElement('div');
        messageDiv.textContent = message;
        messageDiv.className = className;
        chatWindow.appendChild(messageDiv);
        chatWindow.scrollTop = chatWindow.scrollHeight;
    };
    
    const sendMessage = async () => {
        let message = inputField.value.trim();
        message = message.charAt(0).toUpperCase() + message.slice(1);
        if (message) {
            appendMessage(message, 'user-message');
            inputField.value = '';
            await saveMessage(1, message, 'user');  // Assuming user_id = 1 for simplicity
            await run(message);
        }
    };

    sendButton.addEventListener('click', sendMessage);
    
    inputField.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    async function saveMessage(userId, message, sender) {
        try {
            const response = await fetch('/api/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user_id: userId, message: message, sender: sender })
            });
            const data = await response.json();
            console.log('Message saved:', data);
        } catch (error) {
            console.error('Error saving message:', error);
        }
    }

    async function run(message) {
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-pro" });
            const result = await model.generateContent(message);
            const response = await result.response;
            const text = await response.text();
            appendMessage(text, 'response-message');
            await saveMessage(1, text, 'ai');  // Save AI response
        } catch (error) {
            console.error("Error fetching AI response:", error);
            const errorMessage = "Sorry, I'm having trouble understanding you right now. Please try again later.";
            appendMessage(errorMessage, 'response-message');
            await saveMessage(1, errorMessage, 'ai');  // Save error response
        }
    }
});
