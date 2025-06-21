# AI-Powered IT Support Ticket Prioritization System

Bu proje, yapay zeka destekli IT destek talebi önceliklendirme sistemidir. Sistem, gelen destek taleplerini AI analizi ile değerlendirerek otomatik olarak öncelik seviyesi belirler ve uygun destek seviyesine (L1/L2) atar.

## 🚀 Özellikler

### Backend (Node.js + Express + MongoDB)

- **AI Destekli Önceliklendirme**: Ollama ile entegre AI analizi
- **Otomatik Seviye Atama**: AI ve SLA kriterlerine göre L1/L2 ataması
- **RESTful API**: Tam CRUD operasyonları
- **Dashboard İstatistikleri**: Gerçek zamanlı analitikler
- **MongoDB Entegrasyonu**: Veri kalıcılığı ve performans

### Frontend (React + Vite + Tailwind CSS)

- **Modern UI/UX**: Responsive tasarım
- **Dashboard**: Gerçek zamanlı istatistikler ve grafikler
- **Ticket Yönetimi**: Oluşturma, listeleme, güncelleme
- **AI Analiz**: Gerçek zamanlı karmaşıklık analizi
- **Filtreleme**: Durum, seviye ve SLA bazlı filtreleme

## 🛠️ Teknolojiler

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Veritabanı
- **Mongoose** - ODM
- **Ollama** - AI model entegrasyonu

### Frontend

- **React 19** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **Lucide React** - Icons

## 📋 Gereksinimler

- Node.js (v18+)
- MongoDB (local veya Atlas)
- Ollama (AI model için)

## 🚀 Kurulum

### 1. Projeyi Klonlayın

```bash
git clone <repository-url>
cd IT_Helpdesk_System
```

### 2. Backend Kurulumu

```bash
# Bağımlılıkları yükleyin
npm install

# Environment değişkenlerini ayarlayın
cp env.example .env
# .env dosyasını düzenleyin

# MongoDB'yi başlatın (local)
brew install mongodb-community
brew services start mongodb-community

# Ollama'yı kurun ve modeli indirin
brew install ollama
ollama pull llama3
```

### 3. Frontend Kurulumu

```bash
cd client
npm install --legacy-peer-deps
```

### 4. Uygulamayı Başlatın

```bash
# Backend (ana dizinde)
npm run dev

# Frontend (yeni terminal)
cd client
npm run dev

# Veya her ikisini birden
npm run dev:full
```

## 🌐 Erişim

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 📊 API Endpoints

### Tickets

- `GET /api/tickets` - Tüm ticket'ları listele
- `GET /api/tickets/:id` - Tek ticket getir
- `POST /api/tickets` - Yeni ticket oluştur
- `PUT /api/tickets/:id` - Ticket güncelle
- `GET /api/tickets/stats/dashboard` - Dashboard istatistikleri

### AI

- `POST /api/ai/analyze` - AI analizi yap
- `GET /api/ai/health` - AI servis durumu

### Health

- `GET /api/health` - Sistem durumu

## 🎯 Kullanım

### 1. Dashboard

- Sistem genel durumunu görüntüle
- Ticket dağılımını analiz et
- AI karmaşıklık dağılımını incele

### 2. Yeni Ticket Oluşturma

- Müşteri bilgilerini gir
- Sorun açıklamasını yaz
- AI analiz butonuna tıkla
- Otomatik önceliklendirmeyi gör
- Ticket'ı oluştur

### 3. Ticket Yönetimi

- Mevcut ticket'ları listele
- Filtreleme seçeneklerini kullan
- Durum güncellemelerini yap
- Detayları incele

## 🤖 AI Önceliklendirme Sistemi

Sistem, gelen destek taleplerini 1-5 arası karmaşıklık seviyesinde değerlendirir:

- **1**: Çok basit (şifre sıfırlama, basit yazıcı sorunu)
- **2**: Basit (yazıcı bağlantısı, e-posta senkronizasyonu)
- **3**: Orta seviye (VPN kesintisi, uygulama hatası)
- **4**: Karmaşık (ağ konfigürasyonu, firewall ayarları)
- **5**: Çok karmaşık (sistem çökmesi, veri kaybı)

### Seviye Atama Kriterleri

- **L2**: AI ≥ 4, SLA ≥ 3, veya network sorunu
- **L1**: Diğer tüm durumlar

## 📈 Dashboard Metrikleri

- Toplam talep sayısı
- Açık/İşlemde/Çözüldü dağılımı
- L1/L2 seviye dağılımı
- AI karmaşıklık dağılımı
- Çözüm oranı

## 🔧 Geliştirme

### Proje Yapısı

```
IT_Helpdesk_System/
├── client/                 # Frontend
│   ├── src/
│   │   ├── components/     # React bileşenleri
│   │   ├── pages/         # Sayfa bileşenleri
│   │   ├── services/      # API servisleri
│   │   └── ...
├── models/                # MongoDB modelleri
├── routes/                # API route'ları
├── utils/                 # Yardımcı fonksiyonlar
├── prompt/                # AI prompt'ları
└── server.js             # Ana sunucu dosyası
```

### Environment Değişkenleri

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/it-support-system
```

## 🧪 Test

### API Testleri

```bash
# Health check
curl http://localhost:5000/api/health

# AI health check
curl http://localhost:5000/api/ai/health

# Ticket oluştur
curl -X POST http://localhost:5000/api/tickets \
  -H "Content-Type: application/json" \
  -d '{"customer_name":"Test","issue_description":"VPN sorunu","issue_type":"network","ticket_source":"email"}'

# Dashboard stats
curl http://localhost:5000/api/tickets/stats/dashboard
```

## 🚀 Deployment

### Backend (Heroku/Railway)

```bash
# Environment variables
MONGODB_URI=<your-mongodb-atlas-uri>
PORT=<port>

# Build
npm run build
```

### Frontend (Vercel/Netlify)

```bash
cd client
npm run build
```

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 🆘 Destek

Herhangi bir sorun yaşarsanız:

1. Issues bölümünü kontrol edin
2. Yeni issue oluşturun
3. Detaylı hata açıklaması ekleyin

## 🔮 Gelecek Özellikler

- [ ] E-posta entegrasyonu
- [ ] Slack/Discord bot entegrasyonu
- [ ] Gelişmiş raporlama
- [ ] Kullanıcı yetkilendirme sistemi
- [ ] Mobile app
- [ ] Çoklu dil desteği
- [ ] Otomatik SLA takibi
- [ ] Machine learning ile öncelik tahmini

---

**Not**: Bu sistem, IT destek süreçlerini otomatikleştirmek ve verimliliği artırmak için tasarlanmıştır. AI analizi, insan müdahalesini azaltırken, doğru önceliklendirme sağlar.
