import { useGameSystem } from "~/context/GameSystemContext";
import { useUser } from "~/context/UserContext";
import { MarkdownEditor } from "../generic/markdown-editor/MarkdownEditor";

export default function Aspects() {
  const { session } = useUser();
  const { data } = useGameSystem();
  const core = data?.core;
  const editable = session?.system_role === 'admin' || session?.system_role === 'owner';

  return (
    <article>
      {/* <MarkdownEditor
        editable={editable}
        dataSystem='si'
        dataPath='core.json'
        dataProperty='checks'
        data={core?.checks ?? ''}
        dataKey="core.checks" >
      </MarkdownEditor> */}
    </article>
  );
}
