# System Intelligence Web App

## Workflows

### Adding a new _Document (Page)_

#### Game System

- Find an icon and copy its svg code in `\util\svgs.tsx`.
- Update the relevant interface(s) and the default document(s) in `\types\game.ts`.
  - Update `\workers\GameSystem.ts` for the new document(s).
- Create a page within `\app\components\game-system\`.
  - Create its route in `\app\routes\game-system\`.
  - Declare the route in `\app\routes.ts`.
  - Add the link to the page in `\app\components\game-system\Contents.tsx`.

### Adding a new _Entity_

- Create object to be displayed within the BlockEditor.
- Hook it in `renderReactRoots`.
- If these entities can be linked:
  - Parse them in `\util\game.ts:buildDataLinks` to create appropriate links.
  - Make them displayable in `\app\components\game-system\InlineDataLink.tsx`.
- ... if not to be linked, add their path in skippable list (`\util\game.ts:walkStructure`).

## Storage

### R2

- /game-system/{game-system-name-shortcut}/
  - documents structure as in `\types\game.tsGameSystemData`
