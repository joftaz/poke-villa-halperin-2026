# House Bowls (`קערות הבית`)

## User flow

After entering a name, the customer chooses between:

1. `קערות הבית` — opens the Sheet-driven preset list.
2. `הרכבה אישית` — opens the existing builder at the base step.

Choosing a House Bowl always opens the review screen. The customer can submit it unchanged or choose `עריכת מרכיבים`, which opens the existing builder at the base step with every recipe ingredient already selected. Editing never removes the stored House Bowl name.

## Sheet configuration

Spreadsheet: `Villa_poke_2026_ingredients`

Tab: `menu-template` (`gid=65408799`)

Columns A–F describe ingredients. Columns G onward describe House Bowls. Add a new bowl by adding a non-empty header after `active` and checking its ingredient rows.

A recipe is visible only when it has exactly one active base. It can contain any number of toppings, proteins, and sauces. Inactive rows are excluded from both the menu and recipes.

Initial recipes:

| Bowl | Base | Toppings | Protein | Sauces |
| --- | --- | --- | --- | --- |
| הירוקה של הווילה | rice | wakame, avocado, alfalfa, edamame, green_onion | tofu | soy |
| קראנץ׳ בטטה | mixed | sweet_potato, carrot, corn, green_onion, peanuts | egg_strip | teriyaki, spicy_mayo |
| האדומה החריפה | noodles | nori, avocado, beet, ginger, edamame | tofu | sriracha, spicy_mayo |

The client downloads the public CSV once per page load. There is no separate cache or hardcoded recipe fallback.

## Images

Known bowl names map to local optimized WebP files in `src/data/presetImages.js`. A newly added Sheet column works without a deployment; until an image mapping is added, the UI renders the existing dynamic `BowlIllustration` component.

## Database

`public.orders.preset_name text null` stores the selected header text. A custom order stores `null`. The snapshot remains unchanged if ingredients are edited, which keeps kitchen and customer views understandable even if the Sheet recipe changes later.
