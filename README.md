# Life on a Canvas

A simple, elegant website for Mother's artwork with a WhatsApp ordering flow.

## What to change first

1. Open the file [Life On A Canvas - share.html](Life%20On%20A%20Canvas%20-%20share.html).
2. Update the WhatsApp number in the script section:
   - Find `const whatsappNumber = "919999999999";`
   - Replace it with your actual number, for example `919876543210`
3. Update the product list in the same script section to include your real artworks:
   - `name`
   - `price`
   - `description`
   - `accent`
4. Replace the placeholder preview text with real artwork names or later add images.

## How to keep versioning on GitHub

### Option 1: GitHub Desktop (easiest)

1. Create a new repository on GitHub.
2. Open GitHub Desktop.
3. Add the folder as a new repository.
4. Commit the files and publish the branch to GitHub.

### Option 2: Terminal

```bash
git init
git add .
git commit -m "Initial website"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

## How to deploy it for free

### Best simple option: GitHub Pages

1. Push the site to GitHub.
2. Open your repository on GitHub.
3. Go to Settings → Pages.
4. Under Source, choose `Deploy from a branch`.
5. Choose `main` and `/root`.
6. Save.
7. GitHub will give you a URL such as:
   - `https://yourusername.github.io/your-repo-name/`

### Alternative: Netlify

1. Sign up at netlify.com.
2. Drag and drop the folder into the site area.
3. Netlify will publish it and give you a live link.

## Recommended next steps

- Add real photos of the paintings.
- Add prices and sizes for each piece.
- Replace the placeholder WhatsApp number.
- Add your mother’s short story or bio.
- Share the website link with customers.

If you want, I can next help you turn this into a more polished gallery with real image upload sections and a cleaner product management flow.
