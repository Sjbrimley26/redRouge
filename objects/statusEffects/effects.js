import MessageBoard from "../../classes/MessageBoard";

const effects = {
  poison: strength => target => {
    MessageBoard.log(`${target.name} is poisoned for ${strength} damage!`);
  },
};

export default effects;
