# System Intelligence Web App

## Workflows

### Adding a new _Entity_

- Create object to be displayed within the BlockEditor.
- Hook it in `renderReactRoots`.
- If these entities can be linked:
  - Parse them in `web\util\game.ts:buildDataLinks` to create appropriate links.
  - Make them displayable in `web\app\components\game-system\InlineDataLink.tsx`.
- ... if not to be linked, add their path in skippable list (`web\util\game.ts:walkStructure`).

## Storage

### R2

- /game-system/{game-system-name-shortcut}/
  - documents structure as in `\web\types\game.tsGameSystemData`
