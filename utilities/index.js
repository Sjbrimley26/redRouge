export const get_random_letter = () => {
  return String.fromCharCode(
    Math.random() <= 0.5
      ? get_random_number(65, 91)
      : get_random_number(97, 123)
  );
};

/**
 * Returns a random integer between min and max (max excluded)
 * @param {int} min - The minimum possible returned value
 * @param {int} max - The maxium return value is this - 1
 */
export const get_random_number = (min, max) => {
  return Math.floor(Math.random() * (max - min) + min);
};

export const get_new_id = () => {
  let i = 0;
  let id = "";
  do {
    id += get_random_letter();
    i++;
  } while (i < 5);
  id += new Date().getMilliseconds();
  return id;
};
