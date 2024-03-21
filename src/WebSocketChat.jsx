// Import React and other necessary dependencies
import React, { useState, useEffect, useRef } from 'react';
import './styles/styles.css'; // Import CSS styles

// Define the WebSocketChat component
const WebSocketChat = () => {
  // State variables for managing messages, input message, name, and name set status
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [name, setName] = useState('');
  const [isNameSet, setIsNameSet] = useState(false);
  const [ws, setWs] = useState(null);
  const chatContainerRef = useRef(null);

  // Function to handle setting the name
  const handleSetName = (event) => {
    setName(event.target.value);
  };

  // Function to handle opening the chat
  const handleOpenChat = () => {
    setIsNameSet(true);
  };

  // Effect hook to establish WebSocket connection
  useEffect(() => {
    // Create a WebSocket connection
    const ws = new WebSocket('wss://beneficial-southern-rule.glitch.me');

    // Event listener for when the connection is established
    ws.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    // Event listener for incoming messages
    ws.onmessage = (event) => {
      const message = event.data;

      // Check if the message is a Blob
      if (message instanceof Blob) {
        handleBlobMessage(message);
      } else {
        // Handle JSON message
        try {
          const parsedMessage = JSON.parse(message);
          parsedMessage.className = 'Left';
          setMessages((prevMessages) => [...prevMessages, parsedMessage]);
          console.log('Received JSON data:', parsedMessage);
          scrollToBottom();
        } catch (error) {
          console.error('Error parsing JSON message:', error);
        }
      }
    };

    // Event listener for when the connection is closed
    ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
    };

    setWs(ws);

    // Clean up WebSocket connection on component unmount
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  // Function to handle Blob messages
  const handleBlobMessage = (blob) => {
    const reader = new FileReader();
    reader.onload = function(event) {
      const textData = event.target.result;
      // Process the Blob data as needed
      try {
        const parsedMessage = JSON.parse(textData);
        setMessages((prevMessages) => [...prevMessages, parsedMessage]);
        console.log('Received parsed JSON data:', parsedMessage);
        scrollToBottom();
      } catch (error) {
        console.error('Error parsing JSON message:', error);
      }
    };
    reader.readAsText(blob);
  };

  // Function to handle message change
  const handleMessageChange = (event) => {
    setInputMessage(event.target.value);
  };

  // Function to send a message
  const sendMessage = () => {
    if (inputMessage.trim() !== '') {
      // Send the message to the WebSocket server
      const newMessage = { name: name, message: inputMessage, className:'other' };
      ws.send(JSON.stringify(newMessage));
      newMessage.className = 'self';
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInputMessage('');
    }
  };

  const handleKeyDown = (event) => {

    if (event.keyCode === 13) { // Check if Enter key is pressed
      if( isNameSet ){
        sendMessage();
      } else {
        handleOpenChat();
      }
    }
  };

  // Function to scroll to the bottom of the chat container
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  };

  // Render the chat interface
  return (
    <div className="chat-container">
      {!isNameSet ? (
        <div className="name-setter">
          <h1>Welcome to WebSocket Chat</h1>
          <input
            type="text"
            value={name}
            onChange={handleSetName}
            onKeyDown={handleKeyDown}
            placeholder="Enter your Name..."
          />
          <button onClick={handleOpenChat}>Start</button>
        </div>
      ) : (
        <div className="chat">
          <div className="chat-messages" ref={chatContainerRef}>
            {messages.map((message, index) => (
              <div key={index} className={message.className}>
                <div className="message-text">{message.message}</div>
                <div className="message-sender">{message.name}</div>
              </div>
            ))}
          </div>
          <div className="input-container">
            <input
              type="text"
              value={inputMessage}
              onChange={handleMessageChange}
              onKeyDown={handleKeyDown}
              placeholder="Enter your message..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      )}
    </div>
  );
};

// Export the WebSocketChat component
export default WebSocketChat;