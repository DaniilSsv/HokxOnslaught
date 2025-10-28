import { defineConfig } from 'vite'

// If deploying to GitHub Pages under https://<user>.github.io/HokxOnslaught/
// set `base` to the repository name with leading and trailing slashes.
// This ensures built asset URLs point to /HokxOnslaught/... instead of /... which 404s on GitHub Pages.
export default defineConfig({
  base: 'https://kaljmarik.github.io/HokxOnslaught/'
})
