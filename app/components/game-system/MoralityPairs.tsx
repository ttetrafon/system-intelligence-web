
export interface MoralityPairsProps {
  editing: boolean
}

export default function MoralityPairs({ editing }: MoralityPairsProps) {
  return (
    <p>{`---> ${editing} <---`}</p>
  );
}
