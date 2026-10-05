export function Header() {
  return (
    <header className="bg-biru-600 text-permukaan border-b-2 border-emas-400">
      <div className="flex items-center px-4 h-14">
        <img
          src="/img/SDNegeri1Pandanmulyo.webp"
          alt="Logo SDN 1 Pandanmulyo"
          className="w-9 h-9 mr-3"
        />
        <div className="flex flex-col justify-center">
          <span className="font-judul font-semibold text-[18px] leading-tight">Kelas 3</span>
          <span className="font-teks text-[15px] leading-tight opacity-90">SDN 1 Pandanmulyo</span>
        </div>
      </div>
    </header>
  )
}
