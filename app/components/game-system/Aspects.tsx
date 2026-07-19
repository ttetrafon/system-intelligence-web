import { useGameSystem } from "~/context/GameSystemContext";
import { useUser } from "~/context/UserContext";
import { MkEditor } from "../generic/MkEditor";

export default function Aspects() {
  const { data } = useGameSystem();

  return (
    <MkEditor dataKey="characters.aspects.document" />
  );
}
