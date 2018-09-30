const messageBoard = () => {
  const $messageBoard = document.getElementById("messageBoard");
  const log = message => {
    const paragraph = document.createElement("p");
    const content = document.createTextNode(message);
    paragraph.appendChild(content);
    $messageBoard.appendChild(paragraph);
    $messageBoard.scrollTop = $messageBoard.scrollHeight;
    if ($messageBoard.childNodes.length > 50) {
      $messageBoard.removeChild($messageBoard.childNodes[0]);
    }
  };
  return {
    log,
  };
};

const MessageBoard = messageBoard();

export default MessageBoard;
