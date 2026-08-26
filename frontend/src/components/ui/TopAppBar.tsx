"use client";


export default function TopAppBar() {
  return (
    <header className="bg-paper-white flex justify-between items-center px-gutter py-stack-sm w-full sticky top-0 z-50 border-b-4 border-ink-black shadow-[4px_4px_0px_0px_rgba(15,15,15,1)] md:hidden">
      <div className="flex items-center gap-2">
        <span className="font-headline-lg-mobile text-headline-lg-mobile text-curtain-red italic underline decoration-wavy">RIRII</span>
      </div>
    </header>
  );
}
