# Building Your First Lux App: Part 2 - Creating Your First Page

In this part of the tutorial, you'll learn how to add a new page to your Lux application. We'll create a simple "About Us" page.

In Lux, creating a new page involves two main steps:

1.  **Creating a route** in `server.js` to handle requests for the new page.
2.  **Creating an EJS template** to define the HTML content of the page.

Let's get started.

## Step 1: Create the EJS Template

First, we'll create the HTML template for our "About Us" page.

1.  In the `public/` directory, create a new file named `about.ejs`.
2.  Add the following HTML to your new file:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>About Us | Lux</title>
  <link rel="stylesheet" href="/main.css">
</head>
<body>
  <header class="main-header">
    <h1><a href="/">Lux</a></h1>
    <nav>
      <a href="/">Home</a>
      <a href="/about">About</a>
    </nav>
  </header>
  <main>
    <h2>About Our Company</h2>
    <p>We are dedicated to providing the highest quality luxury sunglasses.</p>
  </main>
</body>
</html>
```

This is a simple HTML page, but notice the `<%= %>` syntax that EJS uses. We're not using any dynamic data yet, but we will in later parts of the tutorial.

## Step 2: Create the Route

Now that we have our template, we need to tell our server how to render it. We'll do this by adding a new route to `server.js`.

1.  Open `server.js`.
2.  Find the section where the other page routes are defined (e.g., near the `app.get('/', ...)` route).
3.  Add the following code to create a new route for our "About" page:

```javascript
// Add this new route
app.get('/about', async (c) => {
  const html = await renderTemplate('about', { pageTitle: 'About Us' });
  return c.html(html);
});
```

Here's what this code does:
*   `app.get('/about', ...)`: This tells our Hono server to listen for `GET` requests to the `/about` URL.
*   `await renderTemplate('about', ...)`: This is a helper function in Lux that finds and renders an EJS template. We're telling it to use our new `about.ejs` template.
*   `return c.html(html)`: This sends the rendered HTML back to the browser.

## Step 3: Verify Your New Page

Now, make sure your development server is still running (`bun run dev`), and then open your browser to `http://localhost:3000/about`. You should see your new "About Us" page!

You've now successfully added a new, server-rendered page to your Lux application.

**Next up:** In [Part 3: Building a Reusable Component](./part-3-building-a-reusable-component.md), you'll learn how to create modular and reusable UI elements.
