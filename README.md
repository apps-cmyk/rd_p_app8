# IMDb Movie App

Приложение для поиска и просмотра информации о фильмах и сериалах, использующее IMDb API.

## Особенности

- 🎬 **Топ-250 фильмов** - лучшие фильмы по рейтингу IMDb
- 🔍 **Поиск** - поиск фильмов и сериалов с автодополнением
- 📂 **Категории** - различные категории фильмов (популярные, рейтинговые, Box Office)
- ⭐ **Избранное** - сохранение фильмов в личные списки
- 🎭 **Детали фильма** - полная информация о фильме, актерах, режиссерах
- 🌙 **Темная тема** - стиль Netflix с черным фоном и красными акцентами

## Технологии

- React Native
- TypeScript
- React Navigation
- IMDb API (RapidAPI)

## Установка и запуск

### Предварительные требования

- Node.js (версия 16 или выше)
- React Native CLI
- Android Studio (для Android)
- Xcode (для iOS)

### Установка зависимостей

```bash
npm install
```

### Запуск на Android

```bash
npx react-native run-android
```

### Запуск на iOS

```bash
npx react-native run-ios
```

### Запуск Metro Bundler

```bash
npx react-native start
```

## Структура проекта

```
src/
├── components/          # Переиспользуемые компоненты
│   ├── MovieCard.tsx   # Карточка фильма
│   ├── SearchBar.tsx   # Поисковая строка
│   ├── RatingStars.tsx # Рейтинг со звездами
│   └── CategoryCard.tsx # Карточка категории
├── screens/            # Экраны приложения
│   ├── HomeScreen.tsx  # Главная страница
│   ├── SearchScreen.tsx # Поиск
│   ├── CategoriesScreen.tsx # Категории
│   ├── FavoritesScreen.tsx # Избранное
│   └── MovieDetailsScreen.tsx # Детали фильма
├── navigation/         # Навигация
│   ├── TabNavigator.tsx # Таб навигация
│   └── StackNavigator.tsx # Стек навигация
├── services/          # API сервисы
│   └── imdbApi.ts     # IMDb API клиент
├── hooks/            # React хуки
│   ├── useMovies.ts  # Хук для работы с фильмами
│   ├── useSearch.ts  # Хук для поиска
│   └── useMovieDetails.ts # Хук для деталей фильма
├── types/            # TypeScript типы
│   ├── movie.ts      # Типы для фильмов
│   └── navigation.ts # Типы для навигации
└── theme/            # Тема приложения
    ├── colors.ts     # Цвета
    ├── typography.ts # Типографика
    └── spacing.ts    # Отступы
```

## API

Приложение использует IMDb API через RapidAPI:

- **Base URL**: `https://imdb236.p.rapidapi.com/api/imdb`
- **API Key**: `636c9a41bfmsh2572ee98638b998p1bb352jsnf6f57f60e997`

### Основные эндпоинты:

- `GET /search` - поиск фильмов
- `GET /top250` - топ-250 фильмов
- `GET /mostPopular` - популярные фильмы
- `GET /details/{id}` - детали фильма
- `GET /cast/{id}` - актеры фильма

## Цветовая схема

- **Черный**: `#000000` - основной фон
- **Серый**: `#2C2C2E` - карточки и элементы
- **Белый**: `#FFFFFF` - текст
- **Красный акцент**: `#E10101` - кнопки и акценты

## Навигация

Приложение использует комбинацию таб и стек навигации:

- **Tab Navigator**: Главная, Поиск, Категории, Избранное
- **Stack Navigator**: Детали фильма, Профиль персоны

## Разработка

### Добавление нового экрана

1. Создайте компонент в `src/screens/`
2. Добавьте типы в `src/types/navigation.ts`
3. Зарегистрируйте экран в навигаторе

### Добавление нового API эндпоинта

1. Добавьте метод в `src/services/imdbApi.ts`
2. Создайте хук в `src/hooks/` если необходимо
3. Используйте в компонентах

## Лицензия

MIT