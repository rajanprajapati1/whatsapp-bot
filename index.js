import OpenAI from "openai";
import dotenv from "dotenv";
import { Client } from "whatsapp-web.js";
import qrcode  from "qrcode-terminal";
import pkg from 'whatsapp-web.js';
const { LocalAuth } = pkg;
dotenv.config();

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true, 
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    },
});

client.on("disconnected", (reason) => {
    console.error("WhatsApp disconnected:", reason);
    process.exit(1);
});

const openai = new OpenAI({
});


client.on('qr',(qr) =>{
    qrcode.generate(qr,{small:true});
});

client.on('ready',() =>{
    console.log("Client is ready");
});

client.initialize();
async function runCompletion(message) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
            role: "system",
            content: `
              Hu ek vyavsayik sahayak chu. 
              Guidelines for responses:
              - Use proper romanized Gujarati (English letters for Gujarati words)
              - Maintain professional and respectful tone
              - Provide accurate and helpful information
              - Use clear and simple language
              - Avoid slang or overly casual expressions
              - Be polite and courteous
              - Format responses clearly with proper punctuation
            `
          },
          {
            role: "assistant",
            content: "Namaste. Hu tamari seva ma hazaar chu. Tamne shi madad joi che te kaho."
          },
          { role: "user", content: message }
      ],
    });
    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Error fetching AI response:", error);
    return "Arey re! Kain gadbad thai gayi, pachi try karje! 😜";
  }
}


client.on('message',message => {
    console.log(message.body);
    runCompletion(message.body).then(result => message.reply(result));
})

