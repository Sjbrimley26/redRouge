const effects = {
  poison: strength => target => {
    console.log(`${target.name} is poisoned for ${strength} damage!`);
  },
};

export default effects;
