# Building Your First Lux App: Part 4 - Adding Interactivity with Hydration

So far, we've built static, server-rendered pages. Now, let's bring our application to life with some client-side interactivity. This is where Lux's "islands" architecture shines.

The concept is simple: we render our components on the server as HTML, and then we "hydrate" them on the client-side with JavaScript to add behavior.

In this part, we'll create an interactive "Counter" component.

## Step 1: Create the Server-Side Component

First, let's create the EJS partial for our new component.

1.  In `public/partials/`, create a new file named `counter.ejs`.
2.  Add the following HTML to `public/partials/counter.ejs`:

```html
<div class="counter-component" data-component="Counter" data-props='{"initialCount": <%= initialCount || 0 %>}'>
  <h3>Interactive Counter</h3>
  <p>Current count: <span class="count"><%= initialCount || 0 %></span></p>
  <button class="increment-button">Increment</button>
  <button class="decrement-button">Decrement</button>
</div>
```

This is the most important part of this step:
*   `data-component="Counter"`: This is a special attribute that tells the Lux runtime which JavaScript component to load for this HTML.
*   `data-props='{"initialCount": ...}'`: This is how we pass data from our server-rendered template to our client-side JavaScript component.

## Step 2: Create the Client-Side Component

Now, let's create the JavaScript class that will power our component.

1.  In `public/js/components/`, create a new file named `Counter.js`.
2.  Add the following JavaScript to `public/js/components/Counter.js`:

```javascript
import { BaseComponent } from '../utils/BaseComponent.js';

export class Counter extends BaseComponent {
  constructor(options) {
    super(options);
    // Set the initial state from the props passed in data-props
    this.state = {
      count: this.props.initialCount || 0,
    };
  }

  onMounted() {
    // Find the elements we need to work with
    this.countElement = this.element.querySelector('.count');
    this.incrementButton = this.element.querySelector('.increment-button');
    this.decrementButton = this.element.querySelector('.decrement-button');

    // Add event listeners
    this.incrementButton.addEventListener('click', () => this.increment());
    this.decrementButton.addEventListener('click', () => this.decrement());
  }

  increment() {
    this.setState({ count: this.state.count + 1 });
  }

  decrement() {
    this.setState({ count: this.state.count - 1 });
  }

  // This method is called whenever the state changes
  onUpdated() {
    this.countElement.textContent = this.state.count;
  }
}

export default Counter;
```

Here's a breakdown of this file:
*   `import { BaseComponent } from ...`: All interactive components in Lux extend the `BaseComponent` class, which provides them with props, state, and lifecycle methods.
*   `constructor(options)`: This is where we receive the `options` (including the `props` from `data-props`) and set up our initial state.
*   `onMounted()`: This is a lifecycle method that is called after the component's HTML is on the page. It's the perfect place to add event listeners.
*   `setState({...})`: This is a method from `BaseComponent` that updates the component's state and then calls the `onUpdated()` method.
*   `onUpdated()`: This is a lifecycle method that is called after the state has been updated. We use it to update the DOM with the new count.

## Step 3: Register and Use the Component

Finally, we need to tell our application about our new component and use it on a page.

1.  **Register the component:** Open `public/index.ejs` and find the main `<script type="module">` at the bottom.
    *   First, import your new component:
        ```javascript
        import Counter from '/js/components/Counter.js';
        ```
    *   Then, register it with the `componentRegistry`:
        ```javascript
        componentRegistry.register('Counter', Counter);
        ```

2.  **Use the component on a page:** In `public/index.ejs`, add the following line inside the `<main>` section to include your new counter component:

```html
<%- include('partials/counter', { initialCount: 5 }) %>
```

## Step 4: Verify the Interactivity

Save all your changes and visit your homepage at `http://localhost:3000`. You should see the new counter component, and you should be able to click the "Increment" and "Decrement" buttons to change the count.

You have now built your first interactive component in Lux! You've seen the full server-to-client workflow: rendering the initial HTML on the server and then "hydrating" it with JavaScript on the client to add behavior.

**Next up:** In [Part 5: Managing State](./part-5-managing-state.md), you'll learn how to share state between different components.
