import React, { useState, useEffect } from 'react';

const WebSocketChat = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');

  const [name, setName] = useState([]);
  const [isNameSet, setIsNameSet] = useState(false);

  const [ws, setWs] = useState(null);


  const handleSetName = (event) => {
    setName(event.target.value);
  };

  const handleOpenChat = () => {
    setIsNameSet(true);
  };

  useEffect(() => {
    // Create a WebSocket connection
    const ws = new WebSocket('wss://beneficial-southern-rule.glitch.me');

    // Event listener for when the connection is established
    ws.onopen = () => {
      console.log('Connected to WebSocket server');
    };

    // Event listener for incoming messages

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        setMessages((prevMessages) => [...prevMessages, message]);
      } catch (error) {
        console.error('Error parsing message:', error);
        // Handle the error, e.g., ignore the message or display a warning
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


  const handleMessageChange = (event) => {
    setInputMessage(event.target.value);
  };

  const sendMessage = () => {
    if (inputMessage.trim() !== '') {
      // Send the message to the WebSocket server
      ws.send(JSON.stringify({ name:name, message: inputMessage }));
      setInputMessage('');
    }
  };

  return (
    <div>
      <div>
         {!isNameSet && <div>
            <h1>Welcome to WebSocket Chat</h1>
            <input
              type="text"
              value={name}
              onChange={handleSetName}
              placeholder="Enter your Name..."
            />
            <button onClick={handleOpenChat}>Start</button>
          </div>
        }
        {isNameSet && <div>
          <h1>Welcome {name}! Enter Your Message Below!</h1>
          <div>
            {messages.map((message, index) => (
              <div key={index}>{message.message}</div>
            ))}
          </div>
          <div>
            <input
              type="text"
              value={inputMessage}
              onChange={handleMessageChange}
              placeholder="Enter your message..."
            />
            <button onClick={sendMessage}>Send</button>
          </div>
        </div>
      }
      </div>
    </div>
  );
};

export default WebSocketChat;
