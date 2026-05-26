import { useGameSystem } from "~/context/GameSystemContext";
import { useUser } from "~/context/UserContext";
import { MkEditor } from "../../../util/lib/react/markdownEditor/MkEditor";

export default function Morality() {
  const { session } = useUser();
  const { data } = useGameSystem();
  const editable = session?.system_role === 'admin' || session?.system_role === 'owner';

  return (
    <MkEditor
      editable={editable}
      dataSystem='si'
      dataKey="characters.morality.document"
      gameData={data} >
    </MkEditor>
  );
}
