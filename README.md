# maz — система управления пациентами

Команда: **Бекаман, Данияр, Далел**. 

Учебный frontend-проект на **Next.js без бэкенда** с интерфейсом на **Tailwind CSS**.

- [GitHub-репозиторий](https://github.com/diko-cat/maz)
- [Техническое задание](hospital/TZ.md)
- [Подробная инструкция приложения](hospital/README.md)

## Запуск

Из корня репозитория:

```bash
cd hospital
npm ci
npm run dev
```
 я гондон я Данчик
Открыть [http://localhost:3000](http://localhost:3000). Требуется Node.js, совместимый с установленной версией Next.js; рекомендуемый вариант — Node.js 24 LTS и npm.

## Интерфейс

| Страница | Локальный адрес |
| --- | --- |
| Главная | [http://localhost:3000](http://localhost:3000) |
| Tailwind CSS | [http://localhost:3000/tailwind](http://localhost:3000/tailwind) |

Доступны обзор, пациенты, врачи и записи на приём. Маршруты `/` и `/tailwind` открывают один интерфейс. Демонстрация использует вымышленные данные; изменения пациентов и записей хранятся в `localStorage` одного браузера.

Задание охватывает интерфейс и клиентскую логику. Бэкенд, серверное API, база данных и авторизация не требуются. Исходный более широкий план сохранён в конце [ТЗ](hospital/TZ.md) как архивный материал; он не определяет объём этого задания.

## Проверки

Из папки `hospital`:

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

`npm test` проверяет даты, валидацию пациентов и конфликты расписания. Для запуска собранной версии выполнить `npm run start`.

Все проверки одной командой: `npm run check`. Она запускает ESLint, тесты, проверку TypeScript и production-сборку.

## Commit и Push в VS Code

Открыть в редакторе корневую папку `maz`. Проверку проекта можно запустить через **Terminal → Run Build Task** (`Ctrl+Shift+B`) или командой `npm run check` из папки `hospital`.

После успешной проверки открыть **Source Control** (`Ctrl+Shift+G`), добавить нужные изменения через **Stage Changes**, ввести сообщение коммита и нажать **Commit**, затем **Push**.

Те же действия через терминал из корня `maz`:

```bash
git status
git add .
git commit -m "chore: prepare project checks and Git workflow"
git push origin main
```

Перед коммитом проверить список в `git status`. Зависимости `node_modules`, сборка `.next` и локальные ZIP-архивы исключены из Git. `package-lock.json` хранится в репозитории вместе с исходниками.
