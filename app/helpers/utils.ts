export const isValidBase64 = (string: string) => {
  const base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;

  return base64Regex.test(string);
};

export const isValidDate = (string: string) => {
  return !isNaN(new Date(string).getTime());
};
