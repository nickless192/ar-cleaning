import React from 'react';
import { Button } from 'react-bootstrap';

const ChatTool = () => {

    const handleQuestion = async (e) => {
        e.preventDefault();
        let input = document.getElementById('input').value;
        let chatArea = document.getElementById('chat-area');

         // Display user's question
        let p = document.createElement('p');
        p.innerHTML = input;
        p.classList.add('user-question');
        chatArea.appendChild(p);
        document.getElementById('input').value = '';

        // Send the question to the server
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question: input }),
        });

        const data = await response.json();
        console.log(data);
        
        let answer = document.createElement('div');
        answer.innerHTML = data.message;
        answer.classList.add('box', "answer");
        chatArea.appendChild(answer);


    }


    return (
        <div className="chat-tool-container">
            {/* Chat tool content */}
            <div id="chat-area">
                {/* Chat messages will appear here */}
            </div>
    
            <div className="submit-form">
                <div className="input">
                    <textarea name="input" id="input" cols="20" rows="3" placeholder="Type your message..."></textarea>
                    <Button id="btn" onClick={handleQuestion}>Submit</Button>
                </div>
            </div>
        </div>
    );
    
};

export default ChatTool;