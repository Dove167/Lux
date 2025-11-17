# Building Your First Lux App: Part 1 - Introduction & Setup

Welcome to the Lux tutorial! In this series, you'll learn how to build a fast, modern, and maintainable web application from scratch using the Lux framework.

## What is Lux?

Lux is a small, server-first web framework designed for one job: building beautiful, production-ready websites in hours, not weeks. It's built on a foundation of web standards, which means you don't need to learn a new templating language or a complex set of abstractions. If you know HTML, CSS, and modern JavaScript, you'll feel right at home.

The core principles of Lux are:

*   **Server-First:** Lux renders pages on the server, which is great for Search Engine Optimization (SEO) and fast initial load times.
*   **Islands Architecture:** Lux uses a "progressive hydration" model, which means you only add interactivity to the parts of your page that need it, keeping your application lightweight and fast.
*   **Standards Native:** Lux is built on Bun, Hono, EJS, and Vanilla JavaScript. There's no Virtual DOM or proprietary syntax like JSX.

In this tutorial, we'll be building a simple "Product Showcase" application.

## Getting Started: Setup

First, you'll need to have **Bun** installed. If you don't have it, you can find installation instructions on the [official Bun website](https://bun.sh/).

Once you have Bun, follow these steps:

1.  **Clone the Lux repository:**
    ```bash
    git clone <repository-url> my-lux-app
    cd my-lux-app
    ```

2.  **Install dependencies:**
    ```bash
    bun install
    ```

3.  **Start the development server:**
    ```bash
    bun run dev
    ```

If you open your browser to `http://localhost:3000` (or the port specified in your terminal), you should see the Lux Sunglasses demo page.

## A Tour of the File Structure

Let's take a quick look at the most important files and directories in a Lux project:

*   `server.js`: This is the heart of your application. It's where you'll define your routes and handle server-side logic. It uses the **Hono** framework for routing.
*   `public/`: This directory contains all of your static assets and templates.
    *   `public/index.ejs`: This is the main EJS template for your homepage. EJS is a simple templating language that lets you embed JavaScript in your HTML.
    *   `public/js/`: This is where your client-side JavaScript lives.
        *   `public/js/components/`: This is where you'll put your interactive components.
        *   `public/js/utils/`: This contains the core Lux runtime, including the `BaseComponent` class and the `ProgressiveHydrator`.
    *   `public/css/`: This is where your CSS files live.
*   `package.json`: This file defines your project's dependencies and scripts.

Now that you're set up and have a feel for the project structure, you're ready to start building!

**Next up:** In [Part 2: Creating Your First Page](./part-2-creating-your-first-page.md), you'll learn how to add a new page and route to your application.
