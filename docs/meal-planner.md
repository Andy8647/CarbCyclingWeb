# Meal Planner Notes

- The food selector in each meal slot supports quick-adding new ingredients directly from the dropdown. Choose "Quick add food" to create an item without leaving the planner.
- Every food entry captures whether macros were recorded at a raw or cooked weight so users can match their tracking preference.
- Foods can include an emoji to improve scanning in the dropdown, library, and assigned meal slots.
- the day column now starts with a slim breakfast / lunch / dinner template; users can add or remove any meal slot via the "+" menu so the column stays tidy by default
- the food library is not i18n yet
- to add a new option, I want to use a Popup instead of the current solution
- on desktop view, user can also toggle to see/hide the day meal slots
- the "Day X" on mobile view is wrong, it should always be the index+1 of the postion of that card no matter how user drag it
- for the food option, we also want to enable user to set the unit, might be per 100g/ml, per piece, per half piece, but per cup or per bowl is too vague
- chnage the three emojis that represent carb, fat, and protein based on the locale,
  - en: 🍞, avacado, steak
  - zh: rice, peanut, meat
- improve meal slot header UI:
  - align emoji with meal name, add button and delete button