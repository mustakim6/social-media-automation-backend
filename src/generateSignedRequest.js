import crypto from "crypto";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
    path: path.resolve(__dirname, "../.env"),
});

const metaUserId = "122192650982937534";

const appSecret = process.env.META_APP_SECRET;

if (!appSecret) {
    throw new Error("META_APP_SECRET was not loaded");
}

const payload = {
    algorithm: "HMAC-SHA256",
    user_id: metaUserId,
};

const payloadString = JSON.stringify(payload);

const encodedPayload = Buffer
    .from(payloadString, "utf8")
    .toString("base64url");

const signature = crypto
    .createHmac("sha256", appSecret)
    .update(encodedPayload, "utf8")
    .digest("base64url");

const signedRequest =
    `${signature}.${encodedPayload}`;

console.log("\nPayload:");
console.log(payloadString);

console.log("\nEncoded Payload:");
console.log(encodedPayload);

console.log("\nSignature:");
console.log(signature);

console.log("\nSIGNED REQUEST:");
console.log(signedRequest);