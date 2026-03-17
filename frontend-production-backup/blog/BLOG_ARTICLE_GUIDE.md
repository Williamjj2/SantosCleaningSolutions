# Santos Cleaning Solutions - Blog Article Creation Guide

## For N8N AI Agent

This document contains all information needed to create **high-quality, professional blog articles** for santoscsolutions.com using the new premium layout.

---

## Template Location
`/frontend-production/blog/_TEMPLATE_ARTICLE.html`

## Article Storage Location
New articles should be created as:
- **Recommended:** `/frontend-production/blog/{slug}/index.html`

---

## Required Variables (MUST REPLACE)

| Variable | Description | Example |
|----------|-------------|---------|
| `{{ARTICLE_TITLE}}` | Full, compelling article title | "Professional House Cleaning in Marietta GA: 2025 Guide" |
| `{{META_DESCRIPTION}}` | SEO description (150-160 chars) | "Complete guide to house cleaning prices in Marietta. Learn what's included..." |
| `{{KEYWORDS}}` | SEO keywords, comma-separated | "house cleaning marietta, maid service atlanta" |
| `{{SLUG}}` | URL-friendly version | "marietta-house-cleaning-guide" |
| `{{CATEGORY}}` | Article category | "Guide", "Tips", "Checklist", "News" |
| `{{PUBLISH_DATE}}` | ISO format date | "2024-12-10" |
| `{{PUBLISH_DATE_DISPLAY}}` | Human readable date | "December 10, 2024" |
| `{{MODIFIED_DATE}}` | ISO format | "2024-12-10" |
| `{{READ_TIME}}` | Estimated reading time in minutes | "12" |
| `{{FEATURED_IMAGE_URL}}` | **High-res background image** (Unsplash) | "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80" |
| `{{ARTICLE_CONTENT}}` | The actual HTML content (rich structure) | See Content Structures below |
| `{{RELATED_POSTS}}` | HTML for 3 related cards | See format below |

---

## Content Structure ({{ARTICLE_CONTENT}})

Use these advanced HTML structures to create engaging content. **Do not use plain text blocks.**

### 1. Intro Paragraph & CTA
Always start with a hook and an immediate call-to-action box.
```html
<p style="font-size: 1.25rem; color: var(--primary); font-weight: 500; margin-bottom: 30px;">
    Start with a strong summary paragraph here that hooks the reader...
</p>

<div class="cta-box">
    <h3>Short on Time?</h3>
    <p>Skip the research and get a personalized quote in under 60 seconds.</p>
    <a href="sms:+18663509407" class="cta-btn">Request Free Estimate</a>
</div>
```

### 2. Checklists (Green Checkmarks)
Use for lists of services, benefits, or steps.
```html
<div class="checklist">
    <h4><i class="fas fa-check-circle"></i> What's Included</h4>
    <ul>
        <li>Dusting all surfaces and light fixtures</li>
        <li>Vacuuming carpets and rugs</li>
        <li>Mopping hard floors</li>
    </ul>
</div>
```

### 3. Pricing Tables
Use for cost comparisons or service tiers.
```html
<table class="pricing-table">
    <thead>
        <tr>
            <th>Home Size</th>
            <th>Standard Clean</th>
            <th>Deep Clean</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>1-2 Bedrooms</td>
            <td>$120 – $180</td>
            <td>$200 – $300</td>
        </tr>
        <tr>
            <td>3 Bedrooms</td>
            <td>$150 – $220</td>
            <td>$280 – $400</td>
        </tr>
    </tbody>
</table>
```

### 4. Pro Tip Boxes (Yellow)
Use for expert advice highlighted in yellow.
```html
<div class="tip-box">
    <h4><i class="fas fa-lightbulb"></i> Pro Tip</h4>
    <p>Always clean from top to bottom so dust falls on the floor before you vacuum.</p>
</div>
```

### 5. Blue Callout Boxes
Use for important notices or local specific info.
```html
<div class="callout">
    <h4><i class="fas fa-info-circle"></i> Local Note</h4>
    <p>In Atlanta's pollen season (March-May), we recommend weekly cleanings to keep allergens at bay.</p>
</div>
```

### 6. Testimonials
Use to add social proof within the article.
```html
<div class="testimonial">
    <p>"The team appeared on time and did an amazing job. My house has never looked this clean!"</p>
    <div class="author">— Sarah J., Alpharetta GA</div>
</div>
```

---

## Related Posts Format ({{RELATED_POSTS}})

Include 3 simple cards for the bottom section:

```html
<a href="/blog/slug-here/" style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.08); text-decoration: none; display: block; transition: transform 0.2s;">
    <img src="IMAGE_URL" style="width: 100%; height: 200px; object-fit: cover;" alt="Title">
    <div style="padding: 20px;">
        <h4 style="color: var(--dark); margin-bottom: 8px;">Article Title Here</h4>
        <span style="color: var(--gray); font-size: 0.9rem;">5 min read</span>
    </div>
</a>
```

---

## Image Strategy

Since the hero image is now a background, choose images that are:
1. **High resolution** (w=1600)
2. **Not too busy** (text will be overlaid)
3. **Darker/Gradient compatbile** (white text on top)

**Recommended IDs:**
- Hero (Living Room): `photo-1558618666-fcd25c85cd64`
- Hero (Kitchen): `photo-1556909114-f6e7ad7d3136`
- Detail (Supplies): `photo-1584622050111-993a426fbf0a`

---

## Final Checklist for Agent
1. **Did you update the Sidebar links?** (They are hardcoded in the template, verify they match current site structure if needed).
2. **Is the Hero Image high quality?** Low res looks bad on large headers.
3. **Did you use the structural HTML?** Avoid big blocks of text. Use lists, tables, and boxes.
4. **No WhatsApp Button.** Do not add floating buttons.

---

*Last Updated: December 2024*
