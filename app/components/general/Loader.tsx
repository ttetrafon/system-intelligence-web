import { useLoading } from "~/context/AppContext";

export default function Loader() {
  const { loading } = useLoading();

  return (
    <>
      {loading && <div id='loader-parent'>
        <span id='loader'></span>
      </div>}
    </>
  );
}
