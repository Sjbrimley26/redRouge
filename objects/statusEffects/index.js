import effects from "./effects";
import messages from "./messages";
import MessageBoard from "../../classes/MessageBoard";

const instantEffects = ["gold"];

const triggerStatusEffect = (target, effect) => {
  MessageBoard.log(messages[effect.name](target.name));
  if (instantEffects.includes(effect.name)) {
    triggerInstantEffect(target, effect);
    return;
  }

  target.addMovementListener(
    effect.name,
    effects[effect.type](effect.strength),
    effect.duration
  );
};

const triggerInstantEffect = (target, effect) => {
  switch (effect.name) {
    case "gold":
      target.gold += effect.strength;
      MessageBoard.log(`${target.name} has ${target.gold} gold.`);
      break;
  }
};

module.exports = {
  triggerStatusEffect,
};
