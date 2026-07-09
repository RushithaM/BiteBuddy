# Food icon assets

Predefined food illustrations used on the Day Plan page and in the Add Food
flow. Users always pick from this set — catalog foods ship with a default icon,
and custom foods require an explicit choice.

Drop `.png`, `.webp`, or `.jpg` files here using the exact ids below. The
`<FoodIcon>` component loads them automatically; until a file exists it renders
an emoji placeholder.

| File name            | Label         | Typical use                          |
| -------------------- | ------------- | ------------------------------------ |
| `icon-raspberries`   | Berries       | Fruits, nuts                         |
| `icon-pancakes`      | Pancakes      | Paratha, pancakes                    |
| `icon-milk`          | Milk          | Chai, milk, curd rice                |
| `icon-oatmeal-bowl`  | Oatmeal bowl  | Poha, oats, upma, khichdi            |
| `icon-egg`           | Egg           | Egg dishes                           |
| `icon-sandwich`      | Sandwich      | Dosa, roti, sandwiches               |
| `icon-soup`          | Soup          | Dal, rajma, curries                  |
| `icon-avocado-bowl`  | Bowl          | Rice, pulao, salads                  |
| `icon-burger`        | Burger        | Paneer, burgers                      |
| `icon-pizza`         | Pizza         | Samosa, biscuits, pizza              |
| `icon-chicken`       | Chicken       | Chicken dishes                       |

Catalog defaults live in `src/data/foods.ts` (`iconId` on each food).
The picker options are listed in `src/data/food-icons.ts`.

Run `npm run food-icons:cutout` after adding or replacing icons to strip
near-white backgrounds (border flood-fill via `scripts/cutout-food-icons.mjs`).
