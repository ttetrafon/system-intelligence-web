import { useGameSystem } from "~/context/GameSystemContext";
import { useUser } from "~/context/UserContext";
import { BlockEditor } from "../generic/BlockEditor";
import { emptyDocument } from "@app-types/game";

export default function Checks() {
  const { session } = useUser();
  const { data } = useGameSystem();
  const core = data?.core;
  const editable = session?.system_role === 'admin' || session?.system_role === 'owner';

  return (
    <BlockEditor
      editable={editable}
      dataSystem='si'
      dataKey="core.checks.document"
      data={core?.checks.document ?? emptyDocument()}
      gameData={data} >
    </BlockEditor>
  );
}
