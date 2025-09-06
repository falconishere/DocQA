export const documentContext = `
Next.js: The React Framework for Production

Next.js gives you the best developer experience with all the features you need for production: hybrid static & server rendering, TypeScript support, smart bundling, route pre-fetching, and more. No config needed.

Key Features:

1.  Routing: Next.js has a file-system based router built on the concept of pages. When a file is added to the pages directory, it's automatically available as a route. The App Router is a new paradigm that allows for more complex layouts and data fetching strategies, using server components by default.

2.  Data Fetching: Next.js allows for multiple ways to fetch data.
    - getStaticProps (Static Generation): Fetch data at build time. The page is pre-rendered with the fetched data. This is ideal for pages that can be generated ahead of a user's request, like blog posts or marketing pages.
    - getServerSideProps (Server-side Rendering): Fetch data on each request. The page is pre-rendered on the server with the fetched data. This is useful for pages that need to display frequently updated data.
    - Incremental Static Regeneration (ISR): Statically generate a page but re-generate it in the background after a certain time interval. This combines the benefits of static generation with the ability to show fresh content.
    - With the App Router, data fetching is simplified. You can use async/await directly in Server Components, and Next.js will automatically handle caching and revalidation.

3.  Rendering: Next.js supports different rendering strategies on a per-page basis.
    - Static Site Generation (SSG): Pages are rendered to HTML at build time. This provides the best performance.
    - Server-Side Rendering (SSR): Pages are rendered to HTML on the server for each request.
    - Client-Side Rendering (CSR): The traditional React way, where the browser downloads a minimal HTML page and JavaScript renders the rest. Next.js can be used for this as well.
    - The App Router primarily uses React Server Components, which render on the server and send minimal JavaScript to the client, improving performance. Client Components can be opted into for interactivity.

4.  API Routes: Any file inside the directory 'pages/api' is mapped to '/api/*' and will be treated as an API endpoint instead of a Page. These are serverless functions that can be used to build a backend for your application. In the App Router, you can create API endpoints using 'route.ts' files.

5.  Developer Experience: Features like Fast Refresh provide instantaneous feedback on edits made to your React components. It also has built-in support for TypeScript, CSS Modules, and Sass.

Summary:
Next.js is a powerful and flexible React framework that simplifies building modern web applications. It provides a robust set of features out-of-the-box, allowing developers to choose the right rendering and data fetching strategy for their needs, ultimately leading to faster, more SEO-friendly websites.
`;
