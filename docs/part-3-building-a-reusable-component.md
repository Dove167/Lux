# Building Your First Lux App: Part 3 - Building a Reusable Component

As your application grows, you'll want to reuse parts of your UI across different pages. In Lux, you can do this by creating reusable components. In this part, we'll create a simple, non-interactive "Call to Action" (CTA) component that we can use on any page.

## The Concept of Partials in EJS

EJS allows you to include one template inside another, which is perfect for creating reusable components. These included templates are often called "partials."

Our goal is to create a `cta.ejs` partial and then include it in both our `index.ejs` and `about.ejs` pages.

## Step 1: Create the Component (Partial)

First, let's create the file for our new component.

1.  Create a new directory inside `public/` called `partials/`. This will help us keep our reusable components organized.
2.  Inside `public/partials/`, create a new file named `cta.ejs`.
3.  Add the following HTML to `public/partials/cta.ejs`:

```html
<section class="cta-section">
  <h2>Ready to Experience True Luxury?</h2>
  <p>Browse our collection and find the perfect pair of sunglasses today.</p>
  <a href="/products" class="cta-button">Shop Now</a>
</section>
```

This is the basic markup for our CTA component.

## Step 2: Pass Data to the Component

What if we want to customize the text of our component? We can pass data to our EJS partials.

Let's modify `public/partials/cta.ejs` to use variables for the title, text, and button link:

```html
<section class="cta-section" style="text-align: center; padding: 40px; background-color: #f4f4f4;">
  <h2><%= title %></h2>
  <p><%= text %></p>
  <a href="<%= link %>" class="cta-button" style="display: inline-block; padding: 10px 20px; background-color: #333; color: #fff; text-decoration: none; border-radius: 5px; margin-top: 10px;"><%= buttonText %></a>
</section>
```

We've now made our component dynamic. The `<%= ... %>` tags will be replaced by the data we pass in.

## Step 3: Use the Component on a Page

Now, let's include our new CTA component on the "About" page.

1.  Open `public/about.ejs`.
2.  Add the following line just before the closing `</main>` tag:

```html
<%- include('partials/cta', {
  title: "Find Your Perfect Pair",
  text: "Explore our latest collection of luxury sunglasses.",
  link: "/products",
  buttonText: "View Collection"
}) %>
```

Here's what this does:
*   `<%- include(...) %>`: This is the EJS syntax for including a partial. We use `<%-` instead of `<%=` to ensure the HTML is not escaped.
*   `'partials/cta'`: This is the path to our partial, relative to the `public/` directory. (You don't need the `.ejs` extension).
*   `{...}`: This is a JavaScript object where we pass in the data that our component needs.

## Step 4: Verify the Component

Save your changes and visit your "About" page at `http://localhost:3000/about`. You should now see the new "Call to Action" section at the bottom of the page.

You've successfully created a reusable, data-driven UI component. You can now use this same `<%- include(...) %>` tag on any page in your application.

**Next up:** In [Part 4: Adding Interactivity with Hydration](./part-4-adding-interactivity-with-hydration.md), you'll learn how to take a server-rendered component and bring it to life on the client-side with JavaScript.
