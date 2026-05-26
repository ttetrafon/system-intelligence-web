import { useGameSystem } from "~/context/GameSystemContext";
import { useUser } from "~/context/UserContext";
import { MkEditor } from "../generic/MkEditor";

export default function Aspects() {
  const { session } = useUser();
  const { data } = useGameSystem();
  const editable = session?.system_role === 'admin' || session?.system_role === 'owner';

  return (
    <MkEditor
      editable={editable}
      dataSystem='si'
      dataKey="characters.aspects.document"
      gameData={data} >
    </MkEditor>
  );
}
