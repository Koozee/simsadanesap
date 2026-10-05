export function Header() {
  return (
    <header className="bg-biru-600 text-permukaan border-emas-400 border-b-2">
      <div className="flex h-14 items-center px-4">
        <img
          src="/img/SDNegeri1Pandanmulyo.webp"
          alt="Logo SDN 1 Pandanmulyo"
          className="mr-3 h-9 w-9"
        />
        <div className="flex flex-col justify-center">
          <span className="font-judul text-[18px] leading-tight font-semibold">Kelas 3</span>
          <span className="font-teks text-[15px] leading-tight opacity-90">SDN 1 Pandanmulyo</span>
        </div>
      </div>
    </header>
  )
}
