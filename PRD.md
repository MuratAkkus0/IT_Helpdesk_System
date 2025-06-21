Prompt:

Sen bir full-stack yazılım geliştiricisisin. Aşağıda detayları verilen bir IT destek sistemi projesini gerçekleştireceksin. Bu sistem destek taleplerini SLA (Service Level Agreement) ve AI içerik analizine göre önceliklendirip, uygun seviyedeki destek ekibine (L1 veya L2) yönlendirecek. Proje React frontend, MongoDB backend ve Local Ollama AI ile geliştirilecek.

🧱 Proje Adı:
AI-Powered IT Support Ticket Prioritization System

🔧 Kullanılacak Teknolojiler:
Frontend: React + TailwindCSS

Backend: Node.js + Express

Veritabanı: MongoDB (mongoose ile)

AI: Local Ollama (localhost:11434)

Model: LLaMA3 (veya başka bir metin analiz modeli)

Tool: Cursor AI üzerinde geliştirilecek

✅ Uygulama Özeti:
Kullanıcı e-posta, telefon veya form ile destek talebi (ticket) oluşturur.

Kullanıcının SLA seviyesine göre manuel öncelik puanı atanır (0–4).

Ticket içeriği Local Ollama’ya gönderilerek AI içerik analizi ile karmaşıklık seviyesi puanı alınır (1–5).

İki puana göre ticket:

L1 (basit işler, düşük maliyetli personel)

L2 (karmaşık işler, uzman personel)
ekiplerine atanır.

Ticket’ın çözüm yöntemi (telefon, e-posta, portal) belirlenir.

Ticket'ın çözüm durumu güncellenebilir (open → in_progress → resolved).

📦 MongoDB Ticket Modeli (ticket.js)
js
Copy
Edit
const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema({
customer_name: String,
sla_level: String, // Gold, Silver, Bronze
issue_description: String,
issue_type: String, // network, software, access vs.
ticket_source: String, // email, phone, manual
created_at: { type: Date, default: Date.now },
sla_priority: Number, // 0–4
ai_priority: Number, // 1–5
assigned_level: String, // L1 veya L2
resolution_method: String, // phone, email, portal
status: { type: String, default: "open" } // open, in_progress, resolved
});

module.exports = mongoose.model("Ticket", ticketSchema);
🧠 Ollama API – System Prompt (AI Karmaşıklık Skoru)
txt
Copy
Edit
Sen bir IT destek sisteminde çalışan bir yapay zekasın. Görevin, destek taleplerinin metinsel açıklamasına göre bu taleplerin teknik karmaşıklık düzeyini analiz etmektir.

Lütfen aşağıdaki kurallara kesinlikle uy:

1. Karmaşıklığı 1 ile 5 arasında sayısal bir puanla değerlendir:

   - 1: Çok basit (örneğin şifre sıfırlama)
   - 2: Basit (örneğin yazıcı bağlantısı)
   - 3: Orta seviye (örneğin VPN sorunu)
   - 4: Karmaşık (örneğin ağ erişimi, domain)
   - 5: Çok karmaşık (örneğin veri kaybı, sistem çökmesi)

2. Sadece sayı cevabı ver. Açıklama veya başka karakter yazma. Örn: `3`

3. Emin olamadığında `3` puanı ver.

Yanıtın sadece 1, 2, 3, 4 ya da 5 olmalı. Başka hiçbir şey yazma.
🔁 Ollama API çağrısı (Backend örneği)
js
Copy
Edit
const getAIPriority = async (ticketText) => {
const response = await fetch("http://localhost:11434/api/generate", {
method: "POST",
headers: { "Content-Type": "application/json" },
body: JSON.stringify({
model: "llama3",
system: systemPromptText,
prompt: `Destek talebi: "${ticketText}"`,
stream: false
})
});
const data = await response.json();
return parseInt(data.response.trim());
};
⚙️ SLA Önceliği Hesabı (Backend)
js
Copy
Edit
const slaMap = {
Gold: 4,
Silver: 2,
Bronze: 1,
None: 0
};
ticket.sla_priority = slaMap[ticket.sla_level];
🎯 Destek Seviyesi Yönlendirme (L1 / L2)
js
Copy
Edit
ticket.assigned_level = ticket.ai_priority >= 4 || ticket.sla_priority >= 3
? "L2"
: "L1";
🧩 API Uçları (Express)
http
Copy
Edit
GET /api/tickets → Tüm ticket’ları getir
POST /api/tickets → Yeni ticket oluştur
GET /api/tickets/:id → Belirli ticket’ı getir
PUT /api/tickets/:id → Ticket güncelle (durum vb.)
POST /api/analyze → Ollama üzerinden AI analizi al
🖥️ React Sayfa ve Bileşenler
TicketForm: Yeni ticket oluşturma

TicketList: Tüm ticket’ların listesi (status, priority vs.)

TicketDetails: Tek ticket detayları

Dashboard: Öncelikli ve önemsiz ticket ayrımı

AdminPanel: SLA seviyesi ve müşteri yönetimi (isteğe bağlı)

🧪 Örnek Ticket JSON
json
Copy
Edit
{
"customer_name": "XYZ Ltd.",
"sla_level": "Gold",
"issue_description": "Firewall kullanıcıları VPN bağlantısı kuramıyor.",
"ticket_source": "email",
"issue_type": "network"
}
🗃️ Dosya Yapısı Önerisi
bash
Copy
Edit
/client (React)
├── /components
├── /pages
├── App.jsx
└── main.jsx

/server (Node.js)
├── /models/ticket.js
├── /routes/tickets.js
├── /controllers/ai.js
└── server.js

/prompt
└── system.txt (Ollama system prompt)
