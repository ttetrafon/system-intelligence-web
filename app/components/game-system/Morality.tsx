import { useGameSystem } from "~/context/GameSystemContext";
import { useUser } from "~/context/UserContext";
import { BlockEditor } from "../generic/BlockEditor";
import { emptyDocument } from "@app-types/game";

export default function Morality() {
  const { session } = useUser();
  const { data } = useGameSystem();
  const characters = data?.characters;
  const editable = session?.system_role === 'admin' || session?.system_role === 'owner';

  return (
    <BlockEditor
      editable={editable}
      dataSystem='si'
      dataKey="characters.aspects.document"
      data={characters?.morality.document ?? emptyDocument()}
      gameData={data} >
    </BlockEditor>
  );
}
