import { useGameSystem } from "~/context/GameSystemContext";
import { useUser } from "~/context/UserContext";
import { MkEditor } from "../generic/MkEditor";

export default function Checks() {
  const { session } = useUser();
  const { data } = useGameSystem();
  const editable = session?.system_role === 'admin' || session?.system_role === 'owner';

  return (
    <MkEditor
      editable={editable}
      dataSystem='si'
      dataKey="core.checks.document"
      gameData={data} >
    </MkEditor>
  );
}
