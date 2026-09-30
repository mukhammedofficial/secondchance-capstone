# SecondChance user stories

## Overview

SecondChance is a community marketplace for passing useful pre-loved items on to another person. It reduces waste by helping neighbors discover items they can reuse.

## Stories

- As a visitor, I want to see a welcoming landing page and browse available items so that I can quickly understand the service.
- As a visitor, I want to search item titles and descriptions with ordinary words so that I can find relevant listings without knowing an exact category.
- As a visitor, I want to filter items by category so that I can focus on a type of item.
- As a member, I want to create an account and sign in so that I can use a personal account.
- As a member, I want to update my account details using an authenticated request so that my profile stays current.
- As a member, I want to create, view, edit, and delete item listings so that I can manage items I offer.
- As a member, I want to attach an item photo so that other people can identify the listing.
- As an operator, I want a repeatable seed script and health endpoint so that I can set up and monitor the service.

## Acceptance notes

Listings contain a title, description, category, condition, price, image URL, and location. The seed script provides 16 example listings. API evidence must be captured from a running application backed by a real MongoDB instance; deployment and CI evidence must come from their real services.
