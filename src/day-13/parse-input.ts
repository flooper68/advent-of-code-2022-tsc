type NumberToken = { type: "Number"; value: number };
type LeftBracketToken = { type: "LeftBracket" };
type RightBracketToken = { type: "RightBracket" };
type CommaToken = { type: "Comma" };
type Token = NumberToken | LeftBracketToken | RightBracketToken | CommaToken;

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let position = 0;

  function getNextChar(): string {
    return input.charAt(position++);
  }

  function peekNextChar(): string {
    return input.charAt(position);
  }

  while (position < input.length) {
    const char = getNextChar();

    if (/\d/.test(char)) {
      let value = parseInt(char, 10);
      while (/\d/.test(peekNextChar())) {
        value = value * 10 + parseInt(getNextChar(), 10);
      }
      tokens.push({ type: "Number", value });
    } else if (char === "[") {
      tokens.push({ type: "LeftBracket" });
    } else if (char === "]") {
      tokens.push({ type: "RightBracket" });
    } else if (char === ",") {
      tokens.push({ type: "Comma" });
    }
  }

  return tokens;
}
