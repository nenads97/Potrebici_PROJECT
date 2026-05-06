# DATABASE_MODEL.md

## 1. Database approach

The project uses **PostgreSQL** as the main database.

The application has two data layers:

1. **Umbraco CMS data**
   - content pages
   - project information
   - apartment/unit content
   - images
   - floor plans
   - SEO fields
   - admin-managed content

2. **Custom application data**
   - buyer inquiries
   - contact form submissions
   - optional lead tracking
   - optional cached/read-optimized data

Umbraco should be used as the admin panel and content management system.

Do not duplicate Umbraco-managed content into custom tables unless there is a strong reason.

---

## 2. Umbraco-managed content

The following data should be managed through Umbraco Document Types.

### Project

Represents the main real estate project.

Fields:

```txt
ProjectName
Slug
Address
City
ShortDescription
FullDescription
LocationDescription
FloorStructure
ConstructionStartDate
ConstructionEndDate
TotalApartments
TotalCommercialSpaces
TotalBusinessApartments
TotalStorageUnits
TotalGarageParkingSpaces
TotalYardParkingSpaces
HeroImage
GalleryImages
SeoTitle
SeoDescription
```
