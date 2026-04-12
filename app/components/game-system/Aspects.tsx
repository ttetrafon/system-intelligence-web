import { useGameSystem } from "~/context/GameSystemContext";
import { useUser } from "~/context/UserContext";
import { BlockEditor } from "../generic/BlockEditor";
import { emptyDocument } from "@app-types/game";

export default function Aspects() {
  const { session } = useUser();
  const { data } = useGameSystem();
  const editable = session?.system_role === 'admin' || session?.system_role === 'owner';
  const characters = data?.characters;

  return (
    <BlockEditor
      editable={editable}
      dataSystem='si'
      dataKey="characters.aspects.document"
      data={characters?.aspects.document ?? emptyDocument()}
      gameData={data} >
    </BlockEditor>
  );
}
