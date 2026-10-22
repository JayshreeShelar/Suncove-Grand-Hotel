# Suncove Grand Hotel: single-page website

Frontend only (HTML, CSS, vanilla JS). No backend, cart, payments or booking checkout.
Open `index.html` in a browser, or serve the folder with any static server.

## Files

| File | Purpose |
|---|---|
| `index.html` | All sections: header, hero + carousel + enquiry bar, about, rooms, gallery, location, enquiry form, footer |
| `css/style.css` | Styles, CSS variables (colours, fonts) at the top, responsive rules at the bottom |
| `js/script.js` | Config, image loading, synced carousel/background, nav, validation, WhatsApp/email enquiries |
| `assets/images/*.svg` | Local fallback placeholders, used automatically if a remote photo fails to load |

## 1. Change contact details and the enquiry channel

Open `js/script.js` and edit the `CONFIG` block at the top:

- `channel`: `"whatsapp"` or `"email"`
- `whatsappNumber`: country code + number, digits only (for example `919812345678`)
- `email`, `phone`, `address`, `city`, `mapQuery`

The footer, location section, links, "Get Directions" and both enquiry forms all read from this block.
Phone/WhatsApp are set to 8830532500 and the location to Lonavala, Pune. The email (`info@example.com`) is still a placeholder: replace it.

## 2. Change images

Photos are defined once in the `IMAGES` block of `js/script.js`. Each key tries its sources in order and
uses the first that loads, with the local SVG placeholder as the last resort.

To use your own photos:
1. Put files in `assets/images/` (for example `ocean-suite.jpg`).
2. Put the path first in the list: `suite: { src: ["assets/images/ocean-suite.jpg", ...] }`.

| Key | Used for |
|---|---|
| `room` | Carousel "Premium Room", rooms section, gallery |
| `beach` | Carousel "Beach View", gallery |
| `suite` | Carousel "Ocean View Suite" (also the default hero background), rooms, gallery, about collage |
| `dining` | Carousel "Rooftop Dining", about section, gallery |
| `exterior` | Carousel "Hotel Exterior", gallery |
| `pool` | About collage, gallery |
| `terrace` | Rooms, gallery |
| `about` | Spare image (not used in the current about layout) |

The default image URLs are Unsplash photo links picked by ID. I could not open them from the build environment,
so please check each one looks right in your browser (and that the licence suits you), or swap in your own photos.
The carousel slide titles and subtitles are in the `SLIDES` array.

## Card shape

All cards (about photos, rooms, amenities, gallery, map, contact boxes, enquiry form) share one cut-corner shape.
It is defined once in `css/style.css`, in the block called "Card shape". Change `--cut` there to make the corner cut bigger or smaller.

## 3. Other things to replace

- Map: it shows Lonavala, Pune. To pin the exact hotel, replace the iframe in `index.html` with the embed code from Google Maps (Share > Embed a map).
- Browser tab icon: `assets/icons/favicon.svg` (gold lotus).
- Social links: replace the `href="#"` values in the footer.
- Copy (hotel description, room text): edit directly in `index.html`.

## How the enquiries work

Both the hero bar and the enquiry form validate in the browser, then open a pre-filled WhatsApp message
(or email draft). The visitor has to press send themselves. The site never says a stay is booked or confirmed.
