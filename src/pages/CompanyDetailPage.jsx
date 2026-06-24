function CompanyDetailPage({ company, goTo, onExperienceDeleted }) {
  if (!company) {
    return (
      <main className="content-page">
        <section className="empty-state">
          <h1>没有找到这家公司</h1>
          <p>可能是链接里的公司编号不存在。</p>
          <button className="primary-button" type="button" onClick={() => goTo("/companies")}>
            返回公司列表
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="content-page detail-layout">
      <button className="back-button" type="button" onClick={() => goTo("/companies")}>
        ← 返回列表
      </button>

      {/* 业务逻辑：详情页展示单家公司观察，不做真实评论流或用户互动。 */}
      <section className="detail-hero">
        <div>
          <span className="soft-tag">{company.category}</span>
          <h1>{company.name}</h1>
          <p>
            {company.city} · {company.category} · {company.experienceCount} 条体验
          </p>
        </div>
        <div className="detail-metrics" aria-label="体验样本和风险反馈">
          <div>
            <span>体验样本</span>
            <strong>{company.experienceCount}</strong>
          </div>
          <div>
            <span>风险反馈</span>
            <strong>{company.riskSummaryText}</strong>
          </div>
        </div>
      </section>

      <section className="detail-section risk-distribution">
        <h2>风险反馈分布</h2>
        {company.experienceCount <= 1 ? (
          <p>当前只有 1 条体验，仅作个人经历参考，不代表整体判断。</p>
        ) : (
          <p>
            基于 {company.experienceCount} 条体验：低 {company.riskDistribution.低} 条 / 中{" "}
            {company.riskDistribution.中} 条 / 高 {company.riskDistribution.高} 条 / 不确定{" "}
            {company.riskDistribution.不确定} 条
          </p>
        )}
      </section>

      <section className="detail-section">
        <h2>整体印象</h2>
        <p>{company.overallImpression}</p>
        <div className="tag-row">
          {company.tags.map((tag) => (
            <span key={tag}>{tag}</span>
          ))}
        </div>
      </section>

      <section className="detail-section note-section">
        <h2>体验样本</h2>
        <div className="experience-note-list">
          {company.experiences.map((experience) => (
            <article className="experience-note-card" key={experience.id}>
              <div className="note-meta">
                <span>{experience.stage}</span>
                <span>{experience.roleName}</span>
                <span>{experience.publishedAt}</span>
                <span>{experience.source === "user" ? "本地发布" : "示例数据"}</span>
              </div>
              <div className="tag-row note-tags">
                {experience.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <p>{experience.content}</p>
              {experience.reminder ? <p className="note-reminder">提醒：{experience.reminder}</p> : null}
              {experience.source === "user" ? (
                <button
                  className="delete-text-button"
                  type="button"
                  onClick={() => {
                    const confirmed = window.confirm("确定删除这条体验吗？删除后无法恢复。");
                    if (confirmed) onExperienceDeleted(company.id, experience.id);
                  }}
                >
                  删除
                </button>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <div className="two-column">
        <section className="detail-section">
          <h2>可以关注</h2>
          <ul>
            {company.highlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>

        <section className="detail-section">
          <h2>投递前提醒</h2>
          <ul>
            {company.watchouts.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="detail-action">
        <p>如果你也有类似体验，可以补充一条，帮助后来的人投递前多一点参考。</p>
        <button className="primary-button" type="button" onClick={() => goTo("/submit")}>
          补充一条体验
        </button>
      </section>
    </main>
  );
}

export default CompanyDetailPage;
