const navItems = [
  { label: "首页", route: "/" },
  { label: "公司体验", route: "/companies" },
  { label: "发布体验", route: "/submit" },
];

function Header({ currentRoute, goTo }) {
  return (
    <header className="site-header">
      <button className="brand-button" type="button" onClick={() => goTo("/")}>
        <span className="brand-mark">投</span>
        <span>
          <strong>投前看看 Mini</strong>
          <small>求职前的轻量观察本</small>
        </span>
      </button>

      <nav className="nav-links" aria-label="主要页面">
        {navItems.map((item) => (
          <button
            key={item.route}
            className={currentRoute === item.route ? "nav-link active" : "nav-link"}
            type="button"
            onClick={() => goTo(item.route)}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
}

export default Header;
