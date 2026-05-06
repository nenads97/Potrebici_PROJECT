# PROJECT_SPEC.md

## 1. Project overview

This project is a modern real estate web application for presenting and selling apartments, business apartments, commercial spaces, parking spaces and storage units in a residential building.

The main project is located at:

**Heroja Pinkija 13, Novi Sad**

The website should help potential buyers quickly understand the project, browse available units and contact the investor.

The application is built as a **modular monolith**.

---

## 2. Project goals

The main goals of the website are:

- present the residential building in a modern and trustworthy way
- highlight the location and lifestyle value
- show available apartments clearly
- make unit availability easy to understand
- allow buyers to contact the investor quickly
- keep the codebase clean, scalable and easy to maintain

The most important user action is:

**Contact the investor about a specific apartment or available unit.**

---

## 3. Business context

Investors:

- Marko Potrebić
- Milan Potrebić

Project:

- Building address: Heroja Pinkija 13, Novi Sad
- Building structure: PO + P + 3
- Construction start date: March 16, 2026
- Planned completion date: November 15, 2027

Building content:

- Basement level:
  - 15 storage units
  - 13 garage parking spaces

- Yard:
  - 10 outdoor parking spaces

- Ground floor:
  - 2 commercial spaces
  - 3 business apartments

- Floors 1, 2 and 3:
  - 5 apartments per floor
  - same apartment layout repeated on each floor

Total residential apartments:

- 15 apartments

Apartment mix per residential floor:

- 1 studio apartment
- 2 two-bedroom apartments
- 2 three-bedroom apartments

---

## 4. Target users

The website is intended for:

- people looking to buy an apartment in Novi Sad
- buyers interested in Telep and surrounding areas
- buyers looking for new construction
- buyers who want direct contact with the investor
- people interested in business apartments or commercial spaces

Users should be able to quickly answer:

- where the building is located
- what types of units are available
- which apartments are available, reserved or sold
- what the planned completion date is
- how to contact the investor

---

## 5. Core website sections

The website should include the following main sections.

### 5.1 Home page

The home page should quickly communicate:

- project name
- location
- building type
- key numbers
- available unit types
- construction timeline
- contact options

Suggested home page sections:

1. Hero section
2. Project overview
3. Location section
4. Available apartments preview
5. Building structure / floor overview
6. Construction timeline
7. Contact CTA

---

### 5.2 Apartments section

The apartments section is the most important part of the website.

It should show all residential apartments with clear filtering and status information.

Each apartment card should display:

- apartment code or number
- floor
- size in m²
- room structure
- status
- short description
- CTA button

Apartment statuses:

- Available
- Reserved
- Sold

Recommended filters:

- floor
- structure
- status

Possible structures:

- Studio
- Two-bedroom
- Three-bedroom

---

### 5.3 Commercial spaces and business apartments

Commercial spaces and business apartments should be presented separately from standard residential apartments, unless a combined units section is used.

Each unit should display:

- unit code or number
- floor
- size in m²
- type
- status
- CTA button

Unit types:

- Commercial space
- Business apartment

---

### 5.4 Parking and storage units

Parking spaces and storage units can be presented as supporting information or as separate availability sections.

Parking:

- 13 garage parking spaces in the basement
- 10 outdoor parking spaces in the yard

Storage:

- 15 storage units in the basement

If individual availability is needed, each parking space and storage unit should have:

- code
- type
- status
- optional size
- optional price
- description

---

### 5.5 Location section

The location section should explain why the project location is attractive.

Known location advantages:

- Novi Sad
- beginning of Telep
- Heroja Pinkija 13
- good connection to the city
- nearby bus stop
- bus line 12 connection to the city center
- nearby Lidl
- nearby Laza Kostić high school
- close to walking and recreation areas
- close to Kej, Ribarac, Šodroš and parks
- planned bridge connection towards Fruška gora

The copy should avoid overpromising and should sound elegant, clear and trustworthy.

---

### 5.6 Construction timeline

The website should show key construction information:

- Construction start: March 16, 2026
- Planned completion: November 15, 2027

Possible timeline items:

- Start of construction
- Foundation phase
- Structural works
- Interior works
- Planned completion

---

### 5.7 Contact section

The contact section should be visible and easy to use.

Contact options:

- phone call
- contact form
- inquiry for a specific apartment
- inquiry for general availability

Contact form fields:

- full name
- phone
- email
- message
- selected unit, optional

The contact form should work both as:

- general project inquiry
- specific unit inquiry

---

## 6. Design direction

The design should feel:

- modern
- minimal
- warm
- premium
- elegant
- calm
- trustworthy

The website should look like a serious real estate presentation, not like a generic SaaS landing page.

Visual principles:

- lots of whitespace
- neutral warm colors
- large project images or renders
- clear typography
- soft cards
- subtle borders
- elegant buttons
- readable apartment cards
- visible CTAs

Preferred color palette:

```scss
$site-bg: #f9f8f6;
$site-surface: #efe9e3;
$site-muted: #d9cfc7;
$site-accent: #c9b59c;
$site-text: #1f1f1f;
$site-text-muted: #6f6a64;
```
