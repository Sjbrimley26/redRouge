const triggerKeyAction = (keyCode, player) => {
  switch (keyCode) {
    case 37:
    case 65:
    case 100:
      player.moveLeft();
      player.onMove();
      break;

    case 38:
    case 87:
    case 104:
      player.moveUp();
      player.onMove();
      break;

    case 39:
    case 68:
    case 102:
      player.moveRight();
      player.onMove();
      break;

    case 40:
    case 83:
    case 98:
      player.moveDown();
      player.onMove();
      break;

    case 97:
      player.moveDown().moveLeft();
      player.onMove();
      break;

    case 103:
      player.moveUp().moveLeft();
      player.onMove();
      break;

    case 105:
      player.moveUp().moveRight();
      player.onMove();
      break;

    case 99:
      player.moveDown().moveRight();
      player.onMove();
      break;

    default:
      // console.log(e.keyCode, "pressed!");
      break;
  }
};

export default triggerKeyAction;
