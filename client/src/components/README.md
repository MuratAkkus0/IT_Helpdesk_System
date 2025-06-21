# Component Architecture - Atomic Design

Bu proje Atomic Design metodolojisi kullanılarak organize edilmiştir. Bu yaklaşım, UI componentlerini hiyerarşik bir yapıda organize ederek daha sürdürülebilir ve ölçeklenebilir bir kod tabanı sağlar.

## Dizin Yapısı

```
components/
├── atoms/           # Temel UI elementleri
├── molecules/       # Atomların kombinasyonları
├── organisms/       # Karmaşık UI bileşenleri
├── templates/       # Sayfa şablonları
└── index.js        # Merkezi export dosyası
```

## Atomic Design Seviyeler

### 🔸 Atoms (Atomlar)

Temel, bölünemeyen UI elementleri. Bunlar projenin en küçük yapı taşlarıdır.

- **Button.jsx** - Tüm buton varyantları
- **Input.jsx** - Form input elementleri
- **Select.jsx** - Dropdown seçim elementleri
- **Badge.jsx** - Durum ve etiket gösterimi

### 🔹 Molecules (Moleküller)

Atomların anlamlı kombinasyonları. Belirli bir işlevi yerine getiren küçük bileşenler.

- **SearchBar.jsx** - Arama input'u ve ikonu
- **FilterGroup.jsx** - Filtreleme kontrolleri

### 🔷 Organisms (Organizmalar)

Moleküller ve atomlardan oluşan karmaşık UI bileşenleri. Sayfanın belirli bölümlerini temsil eder.

- **Header.jsx** - Üst navigasyon çubuğu
- **Sidebar.jsx** - Yan navigasyon menüsü
- **Dashboard.jsx** - Ana dashboard bileşeni
- **TicketForm.jsx** - Ticket oluşturma formu
- **TicketList.jsx** - Ticket listesi ve yönetimi

### 🔶 Templates (Şablonlar)

Organizmaları bir araya getiren sayfa şablonları. İçerik bağımsız layout yapıları.

- **Layout.jsx** - Ana sayfa şablonu (MainLayout)

## Kullanım

### Tek Tek Import

```javascript
import Button from "./components/atoms/Button.jsx";
import Header from "./components/organisms/Header.jsx";
```

### Merkezi Import

```javascript
import { Button, Header, Dashboard } from "./components";
```

## Best Practices

### 1. **Tek Sorumluluk İlkesi**

Her component yalnızca bir işlevden sorumlu olmalıdır.

### 2. **Props ile Yapılandırma**

Componentler props aracılığıyla yapılandırılabilir olmalıdır.

### 3. **Consistent Naming**

- Dosya adları PascalCase (TicketForm.jsx)
- Component adları PascalCase (TicketForm)
- Props adları camelCase (onClick, isVisible)

### 4. **Reusability**

Alt seviye componentler (atoms, molecules) mümkün olduğunca yeniden kullanılabilir olmalıdır.

## Component Props Patterns

### Atoms

```javascript
// Button örneği
<Button
  variant="primary"
  size="md"
  disabled={false}
  loading={false}
  onClick={handleClick}
>
  Tıkla
</Button>
```

### Organisms

```javascript
// Header örneği
<Header
  title="Dashboard"
  searchQuery={query}
  onSearchChange={setQuery}
  showSearch={true}
  onNavigate={navigate}
/>
```

## Styling

- **Tailwind CSS** kullanılmaktadır
- Consistent color palette (gray-800, blue-600, etc.)
- Responsive design first approach
- Dark theme odaklı tasarım

## Type Safety

Gelecekte TypeScript entegrasyonu için:

- Props interfaces tanımlanacak
- Generic componentler için type parametreleri
- Strict typing for API responses

Bu yapı sayesinde kodunuz daha modüler, test edilebilir ve sürdürülebilir hale gelmiştir.
