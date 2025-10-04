# Event Builder

## Запуск в Docker

```bash
docker compose up --build
```

- UI: http://localhost:8080/#/admin/events
- API: проксируется через Nginx по `/api` → FastAPI на 8000
- MongoDB: localhost:27017 (volume `mongo_data`)

## Стек backend
- FastAPI + Motor (MongoDB)
- Эндпоинты:
  - GET `/api/events` — список
  - POST `/api/events` — upsert по `id`
  - GET `/api/events/{id}` — получить
  - DELETE `/api/events/{id}` — удалить
  - POST `/api/uploads` — загрузить изображение, ответ `{ url }`
  - GET `/api/uploads/{name}` — получить файл

## Публичные страницы
- URL вида `#/p/{eventId}/{pageId}` отображает опубликованную страницу.
- В редакторе можно вставлять изображения из хранилища и ссылки на страницы мероприятия.

# zmsh