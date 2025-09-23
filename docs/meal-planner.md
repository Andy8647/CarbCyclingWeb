# Meal Planner Notes

1. The food selector in each meal slot supports quick-adding new ingredients directly from the dropdown. Choose "Quick add food" to create an item without leaving the planner.
2. Every food entry captures whether macros were recorded at a raw or cooked weight so users can match their tracking preference.
3. Foods can include an emoji to improve scanning in the dropdown, library, and assigned meal slots.
4. the day column now starts with a slim breakfast / lunch / dinner template; users can add or remove any meal slot via the "+" menu so the column stays tidy by default
5. the food library is not i18n yet
6. to add a new option, I want to use a Popup instead of the current solution
7. on desktop view, user can also toggle to see/hide the day meal slots 
8. the "Day X" on mobile view is wrong, it should always be the index+1 of the postion of that card no matter how user drag it 
9. for the food option, we also want to enable user to set the unit, might be per 100g/ml, per piece, per half piece, but per cup or per bowl is too vague 
10. the nutrition inputs now swap emojis per locale (en: 🍞/🥑/🥩, zh: 🍚/🥜/🍖) so carb/fat/protein match local expectations
11. improve meal slot selection header UI:
  - align emoji with meal name, add button and delete button
  - when add a food option, make the search-able drodown and the serve/weight and the add button in one line
