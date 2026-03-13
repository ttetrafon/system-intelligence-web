import { useGameSystem } from "~/context/GameSystemContext";
import { useUser } from "~/context/UserContext";
import { BlockEditor } from "../generic/block-editor/BlockEditor";
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
      dataPath='characters.json'
      dataProperty='morality'
      data={characters?.morality ?? emptyDocument()}
      dataKey="characters.morality" >
    </BlockEditor>
  );
}
