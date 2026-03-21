import type { GameSystemData } from "@app-types/game";
import { BlockEditorButton } from "../generic/BlockEditorButton";

export interface MoralityPairsProps {
  editing: boolean,
  gameData: GameSystemData | null,
  onAddPair?: () => void,
  onDeletePair?: (id: string) => void,
  onUpdatePair?: (id: string, field: 'first' | 'second', value: string) => void,
}

export default function MoralityPairs({ editing, gameData, onAddPair, onDeletePair, onUpdatePair }: MoralityPairsProps) {
  const moralityPairs = gameData?.characters.morality.pairs ?? [];

  return (
    <div className="flex flex-row flex-nowrap gap-4 justify-center">
      <table>
        <tbody>
          {moralityPairs.map((pair) => (
            <tr key={pair.id}>
              <td className="p-0"><input className='shadow-none border-none text-right px-2' type='text' defaultValue={pair.first} onBlur={(e) => { if (e.target.value !== pair.first) onUpdatePair?.(pair.id, 'first', e.target.value); }} /></td>
              <td className="p-0"><input className='shadow-none border-none text-left px-2' type='text' defaultValue={pair.second} onBlur={(e) => { if (e.target.value !== pair.second) onUpdatePair?.(pair.id, 'second', e.target.value); }} /></td>
              <td className="p-0"><BlockEditorButton text="Delete Morality Pair" icon="delete" onClick={() => onDeletePair?.(pair.id)} /></td>
            </tr>
          ))}
        </tbody>
      </table>
      {editing && <div className="flex flex-col justify-center">
        <BlockEditorButton text="Add Morality Pair" icon="add" onClick={() => onAddPair?.()} />
      </div>}
    </div>
  );
}
