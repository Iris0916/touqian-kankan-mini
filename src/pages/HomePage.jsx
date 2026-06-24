function HomePage({ goTo, homeContent }) {
  return (
    <main>
      {/* 业务逻辑：首页只负责解释产品定位，并把用户引导到列表或发布体验。 */}
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">求职体验参考</span>
          <h1>{homeContent.title}</h1>
          <p>{homeContent.subtitle}</p>
          <div className="hero-actions">
            <button className="primary-button" type="button" onClick={() => goTo("/companies")}>
              开始看看
            </button>
            <button className="secondary-button" type="button" onClick={() => goTo("/submit")}>
              发布体验
            </button>
          </div>
        </div>

        <div className="notebook-visual" aria-label="公司体验手账预览">
          <div className="paper-card paper-main">
            <span>今日观察</span>
            <strong>青桥内容实验室</strong>
            <p>薪资明确 · 反馈清楚 · 适合新手</p>
          </div>
          <div className="paper-card paper-side">
            <span>投递前提醒</span>
            <p>{homeContent.reminder}</p>
          </div>
        </div>
      </section>

      <section className="intro-grid" aria-label="核心能力">
        <article>
          <h2>轻量浏览</h2>
          <p>首页给出产品定位，快速进入公司体验列表。</p>
        </article>
        <article>
          <h2>搜索筛选</h2>
          <p>通过关键词和类型筛选，模拟投递前查公司的过程。</p>
        </article>
        <article>
          <h2>反馈闭环</h2>
          <p>写下具体经历后，给后来的人多一点投递前参考。</p>
        </article>
      </section>
    </main>
  );
}

export default HomePage;
