import effects from "./effects";
import messages from "./messages";

const triggerStatusEffect = (target, effect) => {
  console.log(messages[effect.name](target.name));

  target.addMovementListener(
    effect.name,
    effects[effect.type](effect.strength),
    effect.duration
  );
};

module.exports = {
  triggerStatusEffect,
};
