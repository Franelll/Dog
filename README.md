# 🐕 Psiarze - Aplikacja dla właścicieli psów

Aplikacja społecznościowa dla właścicieli psów, która pozwala:

- **Czatować** ze znajomymi psiarzami
- **Ogłosić spacer** jednym kliknięciem ("Za 20 min będę w parku!")
- **Zobaczyć na mapie** gdzie są Twoi znajomi z psami
- **Zarządzać listą znajomych** psiarzy

## 🚀 Jak uruchomić

```bash
# Zainstaluj zależności
npm install

# Uruchom serwer developerski
npm run dev
```

Aplikacja będzie dostępna pod adresem: **http://localhost:3000**

Wejdź na **http://localhost:3000/psiarze** żeby zobaczyć MVP!

## 📱 Funkcje MVP

### Zakładka "Czat"
- Grupowy czat ze znajomymi
- Szybkie przyciski "Za 10/20/30 min" do ogłoszenia spaceru
- Wiadomości statusowe wyróżnione kolorem

### Zakładka "Mapa"  
- Wizualizacja lokalizacji znajomych
- Twoja pozycja (z Geolocation API)
- Status dostępności znajomych

### Zakładka "Znajomi"
- Lista znajomych psiarzy
- Informacje o psach
- Możliwość dodania nowych znajomych (placeholder)

## 🛠 Technologie

- [Next.js 15](https://nextjs.org/) (App Router + Turbopack)
- [HeroUI v2](https://heroui.com/) - komponenty UI
- [Tailwind CSS](https://tailwindcss.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Framer Motion](https://www.framer.com/motion/)

## 📝 TODO (rozwój aplikacji)

- [ ] Backend z bazą danych (Prisma + PostgreSQL)
- [ ] Autoryzacja użytkowników (NextAuth.js)
- [ ] Real-time chat (WebSockets / Pusher)
- [ ] Prawdziwa mapa (Leaflet / Google Maps)
- [ ] Push notifications
- [ ] Profil użytkownika i psa
- [ ] Wyszukiwanie parków w okolicy

## License

Licensed under the [MIT license](https://github.com/heroui-inc/next-app-template/blob/main/LICENSE).
