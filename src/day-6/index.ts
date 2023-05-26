import fs from "node:fs";
import path from "node:path";

function containsMarker(buffer: string[]) {
  const allCharsUnique = new Set(buffer).size === buffer.length;
  const fourChars = buffer.length === 4;
  return allCharsUnique && fourChars;
}

function containsStartOfMessage(buffer: string[]) {
  const allCharsUnique = new Set(buffer).size === buffer.length;
  const fourChars = buffer.length === 14;
  return allCharsUnique && fourChars;
}

function main() {
  const content = fs.readFileSync(path.join(__dirname, "./input"), "utf-8");

  const bufferPacketStart = [];
  const bufferMessageStart = [];

  let packetStart: number | null = null;
  let messageStart: number | null = null;

  for (let i = 0; i < content.length; i++) {
    const char = content[i];

    bufferPacketStart.push(char);
    bufferMessageStart.push(char);

    if (bufferPacketStart.length > 4) {
      bufferPacketStart.shift();
    }

    if (bufferMessageStart.length > 14) {
      bufferMessageStart.shift();
    }

    if (packetStart == null && containsMarker(bufferPacketStart)) {
      packetStart = i + 1;
    }

    if (messageStart == null && containsStartOfMessage(bufferMessageStart)) {
      messageStart = i + 1;
    }
  }

  console.log("Found packet start", packetStart);
  console.log("Found message start", messageStart);
}

main();
