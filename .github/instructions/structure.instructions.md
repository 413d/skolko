# File structure and architecture Rules

## 1. General

### JavaScript/TypeScript:

- Use TypeScript for all code. Prefer types.
- Use concise, one-line syntax for simple conditional statements (e.g., if (condition) doSomething()).
- Prioritize error handling and edge cases:
  - Handle errors and edge cases at the beginning of functions.
  - Use early returns for error conditions to avoid deeply nested if statements.
  - Place the happy path last in the function for improved readability.
  - Avoid unnecessary else statements; use if-return pattern instead.
  - Use guard clauses to handle preconditions and invalid states early.
  - Implement proper error logging and user-friendly error messages.
  - Consider using custom error types or error factories for consistent error handling.

### React:

- Follow React best practices and naming conventions.
- Implement proper prop types and default props.
- Use React.lazy for code splitting and dynamic imports.
- Always use functional components with hooks.

---

## 2. Feature-Sliced Design (FSD)

### Layers

Layers are standardized across all FSD projects. You don't have to use all of the layers, but their names are important. There are currently seven of them (from top to bottom):

App — everything that makes the app run — routing, entrypoints, global styles, providers.
Pages — full pages or large parts of a page in nested routing.
Widgets — large self-contained chunks of functionality or UI, usually delivering an entire use case.
Features — reused implementations of entire product features, i.e. actions that bring business value to the user.
Entities — business entities that the project works with, like user or product.
Shared — reusable functionality, especially when it's detached from the specifics of the project/business, though not necessarily.

Here is a simple project that implements FSD (page-sliced):

```
- app
- pages
- shared
```

From top (high-level) to bottom (low-level):

1. `app` — app entry point, global providers, routing setup, styles.
2. `pages` — top-level routes (page components). Each page combines widgets/features.
3. `widgets` — reusable UI blocks composed of features/entities.
4. `features` — user-facing functionality (auth, search, cart). Contain UI, hooks, and logic.
5. `entities` — domain entities (User, Product). Contain models, types, and UI related to the entity.
6. `shared` — system-wide, low-level reusable code:
   - `shared/ui` → design system, DaisyUI wrappers
   - `shared/api` → backend interactions: api-client, request functions, data types, mappers, etc.
   - `shared/lib` → utilities, hooks
   - `shared/config` → environment, feature flags
   - `shared/assets` → static files
   - `shared/types` → global type definitions

---

### Import rules

- Import **only from the same or lower-level layers**:
  - `pages` → may import `widgets`, `features`, `entities`, `shared`
  - `widgets` → may import `features`, `entities`, `shared`
  - `features` → may import `entities`, `shared`
  - `entities` → may import `shared`
  - `shared` → must not import other layers
- **Never import upwards** (e.g., `features` must not import from `pages`).
- Always import via the module’s `index.ts` (public API). No deep imports.

---

### Module structure

Each `feature` or `entity` must have its own folder with this structure:

#### Feature

```
features/
  search/
    api/
      search.client.ts
    model/
      search.model.ts
    hooks/
      useSearch.ts
    ui/
      SearchInput.tsx
      SearchResults.tsx
    index.ts
```

#### Entity

```
entities/
  product/
    ui/
      ProductCard.tsx
      ProductDetails.tsx
    model/
      product.types.ts
      product.mapper.ts
    index.ts
```
