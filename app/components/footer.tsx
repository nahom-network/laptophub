export default function Footer() {
  return (
    <footer className="border-t border-border/60 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
        <span>LaptopHub</span>
        <p>
          Made by{" "}
          <a
            href="https://nahom.codes"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            NAHOM.CODES
          </a>
        </p>
        <a
          href="https://laptophub.pro.et"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors"
        >
          laptophub.pro.et
        </a>
      </div>
    </footer>
  );
}
