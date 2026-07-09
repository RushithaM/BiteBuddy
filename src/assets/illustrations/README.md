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
| `avatar-user`      | Profile screen avatar                              |
| `meal-breakfast`   | Home meal card thumbnail (sun + dish)              |
| `meal-lunch`       | Home meal card thumbnail (day sky + plate)         |
| `meal-snack`       | Home meal card thumbnail (sunset + chai)           |
| `meal-dinner`      | Home meal card thumbnail (moon + bowl)             |

Food images go into `src/assets/foods/<food-id>.png` (ids in
`src/data/foods.ts`); the emoji tiles are used as fallback.
