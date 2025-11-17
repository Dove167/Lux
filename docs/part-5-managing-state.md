# Building Your First Lux App: Part 5 - Managing State

In a real application, different components often need to share and react to the same piece of data. For example, a "product card" component might need to tell a "shopping cart" component that an item has been added.

Lux handles this with a simple and powerful pattern: **focused stores** and an **event bus**.

*   **EventBus:** A central pub/sub system. Components can "emit" events (like `cart:add`), and other components or stores can "listen" for them.
*   **Focused Stores:** A store is a dedicated object for managing a specific piece of the application's state (e.g., the contents of the shopping cart).

In this final part, we'll create a simple "notifier" component that listens for events from our "counter" component and displays a message.

## Step 1: Modify the Counter to Emit Events

First, let's update our `Counter.js` component to announce when it has been updated.

1.  Open `public/js/components/Counter.js`.
2.  At the top of the file, import the `eventBus`:
    ```javascript
    import { eventBus } from '../utils/EventBus.js';
    ```
3.  In both the `increment` and `decrement` methods, add a line to emit an event after the state has been updated:

    ```javascript
    increment() {
      this.setState({ count: this.state.count + 1 });
      eventBus.emit('counter:changed', { newCount: this.state.count });
    }

    decrement() {
      this.setState({ count: this.state.count - 1 });
      eventBus.emit('counter:changed', { newCount: this.state.count });
    }
    ```
    Now, every time the counter changes, it will shout out the new count to the rest of the application.

## Step 2: Create a Notifier Component

Next, let's create a new component that will listen for these events.

1.  Create the EJS partial at `public/partials/notifier.ejs`:
    ```html
    <div class="notifier-component" data-component="Notifier">
      <p>Last counter action: <span class="last-action">none</span></p>
    </div>
    ```

2.  Create the client-side component at `public/js/components/Notifier.js`:
    ```javascript
    import { BaseComponent } from '../utils/BaseComponent.js';
    import { eventBus } from '../utils/EventBus.js';

    export class Notifier extends BaseComponent {
      onMounted() {
        this.lastActionElement = this.element.querySelector('.last-action');

        // Listen for events from the EventBus
        eventBus.on('counter:changed', (data) => this.updateMessage(data));
      }

      updateMessage(data) {
        this.lastActionElement.textContent = `the new count is ${data.newCount}`;
        // Add a temporary highlight to show the change
        this.element.style.backgroundColor = '#e0e7ff';
        setTimeout(() => {
          this.element.style.backgroundColor = 'transparent';
        }, 500);
      }

      // We should also clean up our listener when the component is removed
      onUnmounted() {
        eventBus.off('counter:changed', this.updateMessage);
      }
    }

    export default Notifier;
    ```
    The key here is `eventBus.on(...)`. This subscribes our `updateMessage` method to the `counter:changed` event.

## Step 3: Register and Use the New Component

Finally, let's add our new `Notifier` to the application.

1.  **Register the component:** In `public/index.ejs`, import and register the new component, just like you did for the `Counter`:
    ```javascript
    import Notifier from '/js/components/Notifier.js';
    // ...
    componentRegistry.register('Notifier', Notifier);
    ```

2.  **Use the component:** In `public/index.ejs`, add the notifier partial to the page:
    ```html
    <%- include('partials/notifier') %>
    ```

## Step 4: Verify the State Change

Save your files and go to your homepage (`http://localhost:3000`). You should see both the counter and the notifier. When you click the buttons on the counter, you should see the message in the notifier update immediately.

You have now successfully implemented a simple state management system! By using a central event bus, you've allowed your components to communicate with each other without being directly connected. This is a powerful pattern that helps you build complex, maintainable applications.

## Congratulations!

You've completed the Lux tutorial. You've learned how to:
*   Set up a new Lux project.
*   Create new pages and routes.
*   Build reusable server-side components.
*   Add interactivity with client-side hydration.
*   Manage state and communication between components.

You now have a solid foundation for building your own applications with Lux. Happy coding!
