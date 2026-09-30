# SecondChance user stories

SecondChance helps people in a community give useful pre-owned belongings another life. Members can discover items by category, location, and ordinary search words, and can post and manage their own listings.

## Stories

1. As a visitor, I want to browse the available items so that I can find something useful in my community.
2. As a visitor, I want to filter listings by category so that I can focus on the kind of item I need.
3. As a visitor, I want to search using ordinary words so that I can find a listing without knowing its exact title.
4. As a visitor, I want to see an item's details and photo so that I can decide whether it meets my needs.
5. As a member, I want to register and sign in securely so that I can use a personal account.
6. As a member, I want to update my profile so that my account information stays current.
7. As a member, I want to add, edit, and remove an item listing so that I can manage what I offer.
8. As a member, I want to add a photo and location to a listing so that neighbors can identify and find the item.

## Acceptance criteria

- Listings expose an identifier, title, description, category, condition, price, location, image URL when present, and timestamps.
- Visitors can list and search items, filter by category, and retrieve an individual item's details.
- Listing creation supports JSON and multipart form data with an optional image file.
- Registration hashes passwords; login issues a signed, expiring token; profile updates require that token and can modify only its owner's record.
- Invalid input returns an appropriate client error, missing records return 404, and duplicate email addresses return 409.
- The seed script replaces the demo item collection with exactly 16 sample listings and reports the real inserted count.
- Evidence files contain actual command output or screenshots only after a real database/API/deployment/CI run.
