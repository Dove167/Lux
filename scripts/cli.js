#!/usr/bin/env bun

import { program } from 'commander';
import fs from 'fs/promises';
import path from 'path';

// Function to ensure a string is in PascalCase
const toPascalCase = (str) => {
  if (!str) return '';
  // Simple conversion: "my component" -> "MyComponent"
  return str.replace(/(?:^|\s)\w/g, (match) => match.toUpperCase()).replace(/\s+/g, '');
};

program
  .name('lux-cli')
  .description('CLI for scaffolding and managing Lux projects')
  .version('0.0.1');

program
  .command('new-component <name>')
  .description('Create a new Lux component')
  .action(async (name) => {
    const componentName = toPascalCase(name);
    const componentPath = path.join(process.cwd(), 'public/js/components', `${componentName}.js`);

    const componentTemplate = `import { BaseComponent } from '../utils/BaseComponent.js';

export class ${componentName} extends BaseComponent {
  constructor(options) {
    super(options);
    console.log('${componentName} instantiated with options:', this.props);
  }

  onMounted() {
    console.log('${componentName} mounted on element:', this.element);
    // Your component's logic goes here
  }

  // Optional: If your component needs to render its own markup dynamically on the client-side
  // render() {
  //   const el = this.createElement('div', { className: '${name.toLowerCase().replace(/\s+/g, '-')}' });
  //   el.textContent = 'Hello from ${componentName}';
  //   return el;
  // }
}

export default ${componentName};
`;

    try {
      await fs.writeFile(componentPath, componentTemplate, 'utf8');
      console.log(`✅ Component ${componentName} created successfully at public/js/components/${componentName}.js`);
    } catch (error) {
      console.error(`❌ Error creating component: ${error.message}`);
    }
  });

program
  .command('new-route <name>')
  .description('Create a new page template and server route')
  .action(async (name) => {
    const routeName = name.toLowerCase().replace(/^\//, '').replace(/\s+/g, '-');
    const pageTitle = routeName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const templatePath = path.join(process.cwd(), 'public', `${routeName}.ejs`);
    const serverPath = path.join(process.cwd(), 'server.js');

    const ejsTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lux | ${pageTitle}</title>
  <!-- NOTE: This is a basic template. You may want to use EJS partials for headers/footers. -->
  <link rel="stylesheet" href="/main.css">
</head>
<body>
  <header class="main-header">
      <h1><a href="/">Lux</a></h1>
      <nav>
          <a href="/">Home</a>
          <a href="/admin">Admin</a>
      </nav>
  </header>
  <main>
    <h2>${pageTitle}</h2>
    <p>This is the page for "${routeName}".</p>
  </main>
</body>
</html>
`;

    const routeHandlerTemplate = `
app.get('/${routeName}', async (c) => {
  const html = await renderTemplate('${routeName}', { pageTitle: '${pageTitle}' });
  return c.html(html);
});
`;

    try {
      // 1. Create the EJS file
      await fs.writeFile(templatePath, ejsTemplate, 'utf8');
      console.log(`✅ EJS template created successfully at public/${routeName}.ejs`);

      // 2. Add the route to server.js
      let serverContent = await fs.readFile(serverPath, 'utf8');
      const insertionMarker = "// Helper function to render EJS templates";
      if (serverContent.includes(insertionMarker)) {
        serverContent = serverContent.replace(insertionMarker, `${routeHandlerTemplate}\n${insertionMarker}`);
        await fs.writeFile(serverPath, serverContent, 'utf8');
        console.log(`✅ Route "/${routeName}" added successfully to server.js`);
      } else {
        console.warn(`⚠️ Could not find the insertion marker in server.js. Please add the route manually.`);
        console.log('--- Add this to server.js ---');
        console.log(routeHandlerTemplate);
        console.log('-----------------------------');
      }

    } catch (error) {
      console.error(`❌ Error creating route: ${error.message}`);
    }
  });

program.parse(process.argv);
