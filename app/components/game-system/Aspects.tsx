import { useGameSystem } from "~/context/GameSystemContext";
import { useUser } from "~/context/UserContext";
import { BlockEditor } from "../generic/block-editor/BlockEditor";

export default function Aspects() {
  const { session } = useUser();
  const { data } = useGameSystem();
  const core = data?.core;
  const editable = session?.system_role === 'admin' || session?.system_role === 'owner';

  return (
    <></>
  );
}
