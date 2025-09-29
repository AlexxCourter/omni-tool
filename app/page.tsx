import ClientApp from "./ClientApp";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <div className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start w-full">
        {/* ClientApp is mounted globally via ClientMount in layout.tsx; render no extra app instance here */}
        <></>
      </div>
    </div>
  );
}
