export function Header() {
  return (
    <header className="bg-primary-600 text-surface border-gold-400 border-b-2">
      <div className="flex h-14 items-center px-4">
        <img
          src="/img/SDNegeri1Pandanmulyo.webp"
          alt="Logo SDN 1 Pandanmulyo"
          className="mr-3 h-9 w-9"
        />
        <div className="flex flex-col justify-center">
          <span className="font-heading text-[18px] leading-tight font-semibold">Kelas 3</span>
          <span className="font-body text-[15px] leading-tight opacity-90">SDN 1 Pandanmulyo</span>
        </div>
      </div>
    </header>
  )
}
