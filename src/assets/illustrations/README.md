# Illustration assets

Drop the final artwork into this folder using the exact filenames below
(`.png`, `.webp`, `.svg` or `.jpg`). The `<Illustration>` component picks
them up automatically; until a file exists it renders an emoji placeholder.

| File name          | Used on                                            |
| ------------------ | -------------------------------------------------- |
| `logo-heart`       | Welcome / Login — heart logo above "Nutri"         |
| `welcome-hero`     | Welcome screen — veggie bowl with tomato & avocado |
| `login-bowl`       | Login / Signup — smiling salad bowl                |
| `mascot-avocado`   | Day Plan banner, Profile avatar                    |
| `mascot-broccoli`  | Weekly Planner tip banner                          |
| `avatar-user`      | Profile screen avatar (legacy)                     |
| `avatar-avocado`   | Profile avatar option                              |
| `avatar-tomato`    | Profile avatar option                              |
| `avatar-carrot`    | Profile avatar option                              |
| `avatar-blueberry` | Profile avatar option                              |
| `avatar-broccoli`  | Profile avatar option                              |
| `avatar-banana`    | Profile avatar option                              |
| `meal-breakfast`   | Home meal card — dosa on leaf, sun scene             |
| `meal-lunch`       | Home meal card — rice plate, day-sky scene           |
| `meal-snack`       | Home meal card — chai + cookie, sunset scene         |
| `meal-dinner`      | Home meal card — curry bowl, moonlit scene           |
| `today-day-end`    | Home screen — avocado in hammock below dinner cards  |

Regenerate all four with `node scripts/compose-meal-scenes.mjs`. Dish cutouts
live in `src/assets/source-art/dish-*.png`; scene frames are `scene-*.png`.

Food images go into `src/assets/foods/<food-id>.png` (ids in
`src/data/foods.ts`); the emoji tiles are used as fallback.
