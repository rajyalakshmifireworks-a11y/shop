RAJYALAKSHMI FIREWORKS - DIWALI STORE
=====================================

FILES
  index.html     the whole shop page
  images/        product photos, hero banner and logo
  og-image.jpg   picture WhatsApp shows when the link is shared

PUT IT ONLINE (free, about 5 minutes) - Netlify Drop
  1. Open https://app.netlify.com/drop and sign in (free).
  2. Drag this whole folder onto the page. You get a link like
     https://something-random.netlify.app
  3. In Site settings > Change site name, pick a name you like,
     e.g. rajyalakshmi-diwali.netlify.app
  4. Open index.html in a text editor and replace both places that say
     https://YOUR-SITE.netlify.app with your real link. Upload the folder again
     (drag it onto the same site's Deploys page). This makes the WhatsApp
     link preview show your banner.
  5. Send the link to yourself on WhatsApp and test a full order.

CHANGE THINGS (open index.html in a text editor, near the top of the script)
  CONFIG   waNumber (91 + 10 digits), minOrder, shop name
  PRODUCTS one line per product: id, name, cat (category), price, mrp (crossed-out
           price), stock (number in stock). Change price or stock there and re-upload.
  Photos   put the file in images/ and ask for it to be linked to a product id.

BEFORE SHARING WIDELY
  - Check your firecracker licence and your state's rules on selling online.
  - Do a test order and confirm it reaches +91 91822 86897.
  - After WhatsApp share, WhatsApp may cache the preview for a day.

PDF CATALOGUE ADDITIONS (30 October 2026)
  20 confirmed missing products from RFW 2026 A.pdf added as P057-P076.
  Existing product prices, stock quantities, names and family combos are unchanged.
  New entries show the PDF selling price and pack size, with no invented MRP.
  stock:null plus availability:"confirm" allows order enquiries (up to 99 packs),
  but shows "Availability on confirmation" and flags the WhatsApp message.
  Set stock to a verified integer to replace this pending-availability state.
  Products without an approved image show a "Photo coming soon" placeholder.
  Do not add the 14 uncertain matches as duplicates without checking variants.
  Current live URL: https://rajyalakshmifireworks-a11y.github.io/shop/
