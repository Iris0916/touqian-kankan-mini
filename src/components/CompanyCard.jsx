function CompanyCard({ company, onViewDetail }) {
  return (
    <article className="company-card">
      <div className="card-topline">
        <span className="soft-tag">{company.category}</span>
        <span className="risk-tag">{company.riskSummaryText}</span>
      </div>

      <h3>{company.name}</h3>
      <p className="muted-text">
        {company.city} · {company.category}
      </p>
      <p>{company.summary}</p>

      <div className="tag-row" aria-label="公司标签">
        {company.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>

      <div className="card-footer">
        <span className="meta-pill">
          {company.experienceCount} 条体验 · {company.riskSummaryText}
        </span>
        <button className="text-button" type="button" onClick={() => onViewDetail(company.id)}>
          查看详情
        </button>
      </div>
    </article>
  );
}

export default CompanyCard;
