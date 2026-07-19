import { EditorButton } from "../generic/EditorButton";
import { useGameSystem } from "~/context/GameSystemContext";

export interface MoralityPairsProps {
  onAddPair?: () => void,
  onDeletePair?: (id: string) => void,
  onUpdatePair?: (id: string, field: 'first' | 'second', value: string) => void,
}

export function MoralityPairs({ onAddPair, onDeletePair, onUpdatePair }: MoralityPairsProps) {
  const { editing, data } = useGameSystem();
  const moralityPairs = data?.characters.morality.pairs;
  const order = moralityPairs?.order ?? [];
  const items = moralityPairs?.items ?? {};

  return (
    <div className="flex flex-row flex-nowrap gap-4 justify-center">
      <table>
        <tbody>
          {order.map((id) => items[id]).filter(Boolean).map((pair) => (
            <tr key={pair.id} className=" text-typography">
              <td className={editing ? "p-0" : "px-2 text-right"}>
                {editing && <input
                  className='shadow-none border-none text-right px-2'
                  type='text'
                  defaultValue={pair.first}
                  onBlur={(e) => {
                    if (e.target.value !== pair.first)
                      onUpdatePair?.(pair.id, 'first', e.target.value);
                  }} />}
                {!editing && <>{pair.first}</>}
              </td>
              <td className={editing ? "p-0" : "px-2 text-left"}>
                {editing && <input
                  className='shadow-none border-none text-left px-2'
                  type='text'
                  defaultValue={pair.second}
                  onBlur={(e) => {
                    if (e.target.value !== pair.second)
                      onUpdatePair?.(pair.id, 'second', e.target.value);
                  }} />}
                {!editing && <>{pair.second}</>}
              </td>
              {editing && <td className="p-0"><EditorButton text="Delete Morality Pair" icon="delete" onClick={() => onDeletePair?.(pair.id)} /></td>}
            </tr>
          ))}
        </tbody>
      </table>
      {editing && <div className="flex flex-col justify-center">
        <EditorButton text="Add Morality Pair" icon="add" onClick={() => onAddPair?.()} />
      </div>}
    </div>
  );
}
