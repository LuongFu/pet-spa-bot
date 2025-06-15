import { GoogleGenerativeAI } from "@google/generative-ai";

// DOM Elements
const button = document.querySelector(".send");
const input = document.querySelector(".input");
const output = document.querySelector(".ai-message");
const message_area = document.querySelector(".message_area");
const loader = document.querySelector(".loading");

// Initialize model and chat globally
const genAi = new GoogleGenerativeAI(import.meta.env.VITE_API_KEY);
const model = genAi.getGenerativeModel({ model: "gemini-2.0-flash" });

let chat = null; // Global chat session

// Init chat once
async function initializeChat() {
  if (!chat) {
    chat = await model.startChat({
      systemInstruction: `

`,
      history: [
    {
      role: "user",
      parts: [
        "You are a certified expert in Japanese academic culture and industrial automation. You always must say english to explain of your major unless the user requires you to change language. You must always behave like a domain expert, answering clearly, confidently, and with contextual depth.Use Japanese language and honorifics when required. Never say I am not an expert.Translate and explain Japanese academic phrases when requested.From now on, always respond with expert-level tone. Explain to a beginner but never oversimplify."
        // "You are a certified expert in Japanese academic culture and industrial automation. You must always behave like a domain expert, answering clearly, confidently, and with contextual depth.\n" +
        // "Use Japanese language and honorifics when required. Never say 'I am not an expert'.\n" +
        // "Translate and explain Japanese academic phrases when requested.\n" +
        // "From now on, always respond with expert-level tone. Explain to a beginner but never oversimplify."
      ]
    },
  ],
      generationConfig: {
        maxOutputTokens: 200, // increase if needed
      },
    });
  }
}

// Send message logic
async function sendMessage() {
  const prompt = input.value.trim();
  if (!prompt) return alert("Please enter a prompt");

  // Add user message
  message_area.innerHTML += `
  <div class="message user-message">
    <div class="text">${prompt}</div>
    <div class="img"><img class="user" src="/Teto-kasane-nig.gif" alt=""></div>
  </div>`;
  input.value = "";
  loader.style.visibility = "visible";
  message_area.scrollTop = message_area.scrollHeight;

  await initializeChat();

  try {
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    let text = await response.text();

    // Format output
    text = text
      .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
      .replace(/\*(.*?)\*/g, "<i>$1</i>")
      .replace(/(https?:\/\/[^\s]+)/g, (match) => {
        const cleanedUrl = match.replace(/\.*$/, ""); // remove trailing dots
        return `<a href="${cleanedUrl}" style="color: blue;" target="_blank">${cleanedUrl}</a>`;
      });

    // Add AI message
    message_area.innerHTML += `
    <div class="message ai-message">
      <div class="img"><img src="/logo.png" alt=""></div>
      <div class="text">${text}</div>
    </div>`;

  } catch (error) {
    // Handle error
    message_area.innerHTML += `
    <div class="message ai-message">
      <div class="img"><img src="/logo.png" alt=""></div>
      <div class="text" style="color:red;"><b>Error:</b> ${error.message}</div>
    </div>`;
  } finally {
    loader.style.visibility = "hidden";
    message_area.scrollTop = message_area.scrollHeight;
  }
}

// Event listeners
button.addEventListener("click", sendMessage);
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    button.click();
  }
});
