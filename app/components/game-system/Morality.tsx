import { useGameSystem } from "~/context/GameSystemContext";
import { MkEditor } from "../generic/MkEditor";

export default function Morality() {
  const { data } = useGameSystem();

  return (
    <MkEditor dataKey="characters.morality.document" />
  );
}
