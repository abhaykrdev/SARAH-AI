const chatInput = document.getElementById('chat-input');
const sendButton = document.getElementById('send-button');
const chatMessages = document.getElementById('chat-messages');

const userAvatar = 'images/user.png';
const sarahAvatar = 'images/sarah.png';

let typingIndicatorElement = null;

function appendMessage(sender, message, isUser) {
    const messageRow = document.createElement('div');
    messageRow.classList.add('message-row');
    if (isUser) {
        messageRow.classList.add('user');
    } else {
        messageRow.classList.add('ai');
    }

    const avatar = document.createElement('div');
    avatar.classList.add('message-avatar');
    if (isUser) {
        avatar.classList.add('user-avatar-msg');
        const img = document.createElement('img');
        img.src = userAvatar;
        img.alt = 'User Avatar';
        img.classList.add('user-img-msg');
        avatar.appendChild(img);
    } else {
        avatar.classList.add('ai-avatar-msg');
        const img = document.createElement('img');
        img.src = sarahAvatar;
        img.alt = 'SARAH AI Avatar';
        img.classList.add('sarah-img-msg');
        avatar.appendChild(img);
    }

    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content');

    if (isUser) {
        messageContent.textContent = message;
    } else {
        try {
            messageContent.innerHTML = marked.parse(message);
            
            if (typeof renderMathInElement !== 'undefined') {
                renderMathInElement(messageContent, {
                    delimiters: [
                        {left: '$$', right: '$$', display: true},
                        {left: '$', right: '$', display: false},
                        {left: '\\(', right: '\\)', display: false},
                        {left: '\\[', right: '\\]', display: true}
                    ],
                    throwOnError: false
                });
            } else {
                console.warn("KaTeX renderMathInElement is not defined. Math will not be rendered.");
            }

        } catch (e) {
            console.error("Error parsing Markdown for AI message or rendering Math:", e);
            messageContent.textContent = message;
        }
    }

    if (isUser) {
        messageRow.appendChild(messageContent);
        messageRow.appendChild(avatar);
    } else {
        messageRow.appendChild(avatar);
        messageRow.appendChild(messageContent);
    }

    chatMessages.appendChild(messageRow);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
    if (typingIndicatorElement) {
        return;
    }

    const messageRow = document.createElement('div');
    messageRow.classList.add('message-row', 'ai', 'typing-indicator-row');

    const avatar = document.createElement('div');
    avatar.classList.add('message-avatar', 'ai-avatar-msg');
    const img = document.createElement('img');
    img.src = sarahAvatar;
    img.alt = 'SARAH AI Avatar';
    img.classList.add('sarah-img-msg');
    avatar.appendChild(img);

    const messageContent = document.createElement('div');
    messageContent.classList.add('message-content', 'typing-indicator');

    messageContent.innerHTML = `
        <span>SARAH AI is thinking</span>
        <span class="dot"></span>
        <span class="dot"></span>
        <span class="dot"></span>
    `;

    messageRow.appendChild(avatar);
    messageRow.appendChild(messageContent);

    chatMessages.appendChild(messageRow);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    typingIndicatorElement = messageRow;
}

function hideTypingIndicator() {
    if (typingIndicatorElement && chatMessages.contains(typingIndicatorElement)) {
        chatMessages.removeChild(typingIndicatorElement);
        typingIndicatorElement = null;
    }
}

async function sendMessage() {
    const message = chatInput.value.trim();
    if (message === '') return;

    appendMessage('You', message, true);
    chatInput.value = '';
    chatInput.style.height = 'auto';

    showTypingIndicator();

    try {
        const aiResponse = await sendMessageToSARAH(message);
        hideTypingIndicator();
        appendMessage('SARAH AI', aiResponse, false);

    } catch (error) {
        console.error('Error sending message to SARAH AI:', error);
        hideTypingIndicator();
        appendMessage('SARAH AI', 'Oops! My circuits are a bit tangled. Try again later, handsome!', false);
    }
}

async function sendMessageToSARAH(userMessage) {
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: userMessage }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.reply;
    } catch (error) {
        console.error('Error fetching from SARAH AI backend:', error);
        throw error;
    }
}

sendButton.addEventListener('click', sendMessage);

chatInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});

chatInput.addEventListener('input', () => {
    chatInput.style.height = 'auto';
    chatInput.style.height = chatInput.scrollHeight + 'px';
});

chatInput.style.height = chatInput.scrollHeight + 'px';