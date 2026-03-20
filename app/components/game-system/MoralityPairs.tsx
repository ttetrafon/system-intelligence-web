import type { GameSystemData } from "@app-types/game";

export interface MoralityPairsProps {
  editing: boolean,
  gameData: GameSystemData | null,
}

export default function MoralityPairs({ editing, gameData }: MoralityPairsProps) {
  const moralityPairs = gameData?.characters.morality.pairs ?? [];

  return (
    <>
      {editing && <div>controls!?!?!</div>}
      <table>
        <tbody>
          {moralityPairs.map((pair) => (
            <tr key={pair.id}>
              <td>{pair.first}</td>
              <td>{pair.second}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
