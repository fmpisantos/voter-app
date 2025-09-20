# AGENTS.md - Voter App Development Guide

## Build/Lint/Test Commands
- **Build**: `npm run build` or `yarn build`
- **Development**: `npm run dev` or `yarn dev`
- **Lint**: `npm run lint` or `yarn lint`
- **Type Check**: `npm run typecheck` or `yarn typecheck`
- **Test All**: `npm test` or `yarn test`
- **Single Test**: `npm test -- <test-file>` or `yarn test <test-file>`
- **Test Watch**: `npm run test:watch` or `yarn test:watch`

## Code Style Guidelines

### Imports
- Use ES6 imports with named exports preferred
- Group imports: React, third-party libraries, local components/utilities
- Absolute imports for src/ directory, relative for same directory

### Formatting
- Use Prettier for consistent formatting
- 2 spaces indentation
- Single quotes for strings, double for JSX
- Trailing commas in multiline objects/arrays

### Types
- Use TypeScript for type safety
- Define interfaces for data structures (User, Idea, Vote, Round)
- Avoid `any` type; use proper unions or generics

### Naming Conventions
- Components: PascalCase (VotingRound, IdeaCard)
- Functions: camelCase (calculateScores, filterIdeas)
- Variables: camelCase (userVotes, currentRound)
- Constants: UPPER_SNAKE_CASE (MAX_ROUNDS = 3)
- Files: kebab-case (voting-system.tsx, idea-list.ts)

### Error Handling
- Use try/catch for async operations
- Return Result types or throw custom errors
- Validate user input on both client and server
- Log errors with context for debugging

### State Management
- Use React hooks (useState, useReducer) for local state
- Context API for global app state
- Consider Zustand or Redux for complex state

### Testing
- Unit tests for utilities and hooks
- Integration tests for components
- E2E tests for critical user flows
- Mock external dependencies

### Security
- Validate all user inputs
- Sanitize data before storage/display
- Use HTTPS in production
- Implement proper authentication/authorization