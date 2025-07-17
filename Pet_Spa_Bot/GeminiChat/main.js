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
        "Bạn là một chuyên gia sáng tạo nội dung cho một spa thú cưng cao cấp có tên là PetSpa - Dịch vụ chăm sóc thú cưng. Hãy viết một đoạn giới thiệu thân thiện và chuyên nghiệp để sử dụng trên website hoặc tài liệu quảng bá. Spa chuyên cung cấp các dịch vụ chăm sóc, tắm rửa, cắt tỉa lông, vệ sinh và thư giãn cho chó mèo. Mục tiêu là giúp khách hàng cảm thấy yên tâm tuyệt đối khi gửi gắm thú cưng của mình. Nhấn mạnh các yếu tố như: đội ngũ nhân viên tận tâm và có chuyên môn, môi trường sạch sẽ – an toàn – thân thiện, quy trình chăm sóc nhẹ nhàng và chất lượng dịch vụ cao. Văn phong nên ấm áp, tạo cảm giác tin tưởng và hài lòng cho khách hàng. Hãy sử dụng giọng điệu thân thiện, chuyên nghiệp và dễ hiểu.`, ngoài các chuyện liên quan đến các chuyên môn về dịch vụ chăm sóc thú cưng và các cách nuôi thú cưng ra thì không được nói về các vấn đề khác. Hãy trả lời bằng tiếng Việt. Viết chỉ cần đủ hoặc dưới 200 token và đủ ý.`,"
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
  if (!prompt) return alert("Vui lòng nhập lệnh");

  // Add user message
  message_area.innerHTML += `
  <div class="message user-message">
    <div class="text">${prompt}</div>
    <div class="img"><img class="user" src="/corki-dog.jpg" alt=""></div>
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
        return `<a href="${cleanedUrl}" style="color: #FB632B;" target="_blank">${cleanedUrl}</a>`;
      });

    // Add AI message
    message_area.innerHTML += `
    <div class="message ai-message">
      <div class="img"><img src="/pal.png" alt=""></div>
      <div class="text">${text}</div>
    </div>`;

  } catch (error) {
    // Handle error
    message_area.innerHTML += `
    <div class="message ai-message">
      <div class="img"><img src="/pal.png" alt=""></div>
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
