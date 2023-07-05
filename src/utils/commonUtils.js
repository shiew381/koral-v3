export function generateRandomCode(length) {
  let randomCode = "";
  // removed 'I' and 'l' from characters list, since these look identical with the website font and may cause confusion
  const characters = "ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
  const charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    randomCode += characters.charAt(
      Math.floor(Math.random() * charactersLength)
    );
  }
  return randomCode;
}

export function copyArray(arr) {
  return JSON.parse(JSON.stringify(arr));
}
