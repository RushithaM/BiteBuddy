# Illustration assets

Drop the final artwork into this folder using the exact filenames below
(`.png`, `.webp`, `.svg` or `.jpg`). The `<Illustration>` component picks
them up automatically; until a file exists it renders an emoji placeholder.

| File name          | Used on                                            |
| ------------------ | -------------------------------------------------- |
| `logo-heart`       | Splash / Welcome / Login — heart logo above "Nutri" |
| `splash-mascot`    | Splash screen — waving avocado mascot at bottom     |
| `welcome-hero`     | Welcome screen — veggie bowl with tomato & avocado |
| `login-mascot`     | Login / Signup — avocado mascot illustration       |
| `login-bowl`       | Legacy — smiling salad bowl (unused)               |
| `mascot-avocado`   | Day Plan banner, Profile avatar                    |
| `mascot-broccoli`  | Weekly Planner tip banner                          |
| `avatar-user`      | Profile screen avatar (legacy)                     |
| `avatar-apple`     | Profile avatar option (cropped from mascot sheet)  |
| `avatar-orange`    | Profile avatar option                              |
| `avatar-strawberry`| Profile avatar option                              |
| `avatar-watermelon`| Profile avatar option                              |
| `avatar-peach`     | Profile avatar option                              |
| `avatar-grapes`    | Profile avatar option                              |
| `avatar-corn`      | Profile avatar option                              |
| `avatar-broccoli`  | Profile avatar option                              |
| `avatar-blueberry` | Profile avatar option                              |
| `avatar-lemon`     | Profile avatar option                              |
| `avatar-carrot`    | Profile avatar option                              |
| `avatar-avocado`   | Profile avatar option                              |
| `avatar-banana`    | Profile avatar option                              |
| `avatar-garlic`    | Profile avatar option                              |
| `avatar-tomato`    | Profile avatar option                              |
| `avatar-pineapple` | Profile avatar option                              |
| `avatar-pepper`    | Profile avatar option                              |
| `avatar-onion`     | Profile avatar option                              |
| `avatar-cucumber`  | Profile avatar option                              |
| `meal-breakfast`   | Home meal card — dosa on leaf, sun scene             |
| `meal-lunch`       | Home meal card — rice plate, day-sky scene           |
| `meal-snack`       | Home meal card — chai + cookie, sunset scene         |
| `meal-dinner`      | Home meal card — curry bowl, moonlit scene           |
| `today-day-end`    | Home screen — avocado in hammock below dinner cards  |
| `today-progress-scene` | Home screen — landscape behind today's progress card |
| `plus-menu-scene`  | Plus menu sheet — avocado on grass footer scene      |
| `item-detail-frame` | Item detail screen — decorative frame behind food art |
| `item-detail-footer` | Item detail screen — rolling hills footer scene   |
| `profile-scene`    | Profile tab — hills, trees and clouds hero background |

Regenerate all four with `node scripts/compose-meal-scenes.mjs`. Dish cutouts
live in `src/assets/source-art/dish-*.png`; scene frames are `scene-*.png`.
Run `npm run meal-scenes:cutout` to strip near-white outer margins from the
final `meal-*.png` files so they blend on the cream UI.

Food icons for Day Plan rows and the Add Food picker live in
`src/assets/food-icons/` (see that folder's README). Catalog defaults are set
in `src/data/foods.ts` via each food's `iconId`.
