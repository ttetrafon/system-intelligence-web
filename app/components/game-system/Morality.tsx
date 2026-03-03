import { useGameSystem } from "~/context/GameSystemContext";
import { useUser } from "~/context/UserContext";
import { MarkdownEditor } from "../generic/markdown-editor/MarkdownEditor";

export default function Morality() {
  const { session } = useUser();
  const { data } = useGameSystem();
  const characters = data?.characters;
  const editable = session?.system_role === 'admin' || session?.system_role === 'owner';

  return (
    <article>
      <MarkdownEditor
        editable={editable}
        dataSystem='si'
        dataPath='characters.json'
        dataProperty='morality'
        data={characters?.morality ?? ''}
        dataKey="characters.morality" >
      </MarkdownEditor>
    </article>
  );
}
